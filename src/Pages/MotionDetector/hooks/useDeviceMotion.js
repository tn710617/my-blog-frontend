import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { calculateMagnitude } from '../utils/motionDetector';

const GRAVITY = 9.80665;
const DEFAULT_WINDOW_MS = 1000;
const DEFAULT_SAMPLE_LIMIT = 20;
const SMOOTHING_ALPHA = 0.35;
const DEFAULT_INTENSITY_MIN = 0.2;
const MAX_SENSITIVITY_SCALE = 5;
const MOTION_WEIGHT = 0.7;
const ROTATION_WEIGHT = 0.3;
const DEG_TO_RAD = Math.PI / 180;
const IDLE_RESET_TICKS = 6;
const MIN_SIGMA_FOR_LEVEL = 0.05;
const HYSTERESIS_THRESHOLDS = {
  up: {
    1: 0.18,
    2: 0.45,
    3: 0.7
  },
  down: {
    1: 0.1,
    2: 0.32,
    3: 0.55
  }
};

const hasDeviceMotionSupport = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return 'DeviceMotionEvent' in window;
};

const requiresExplicitPermission = () => {
  return (
    typeof DeviceMotionEvent !== 'undefined' &&
    typeof DeviceMotionEvent.requestPermission === 'function'
  );
};

const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

const average = (values) => {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const standardDeviation = (values) => {
  if (values.length < 2) {
    return 0;
  }

  const mean = average(values);
  const variance = values.reduce((sum, value) => {
    const delta = value - mean;
    return sum + delta * delta;
  }, 0) / values.length;

  return Math.sqrt(variance);
};

/**
 * useDeviceMotion Hook
 * 監聽設備的加速度感測器並檢測震動強度
 */
export const useDeviceMotion = (options = {}) => {
  const {
    enabled = false,
    windowSize = DEFAULT_WINDOW_MS,
    samplingRate = 60,
    onLevelChange = null,
    sensitivityScale = 1
  } = options;

  const [level, setLevel] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  const [debugInfo, setDebugInfo] = useState({
    eventCount: 0,
    lastMagnitude: null,
    lastDiff: null,
    lastRotation: null,
    mean: null,
    std: null,
    intensity: null,
    boostedIntensity: null,
    normalized: null,
    smooth: null,
    baseline: null,
    sigma: null,
    sensitivity: null,
    lastAccelData: null,
    normalizedUp1: null,
    normalizedUp2: null,
    normalizedUp3: null,
    normalizedDown1: null,
    normalizedDown2: null,
    normalizedDown3: null
  });

  const samplesRef = useRef([]);
  const lastLevelRef = useRef(0);
  const listenerRef = useRef(null);
  const intervalRef = useRef(null);
  const eventCountRef = useRef(0);
  const lastAccelDataRef = useRef(null);
  const onLevelChangeRef = useRef(onLevelChange);
  const forceListeningRef = useRef(false);
  const prevSmoothRef = useRef(0);
  const idleTickRef = useRef(0);

  onLevelChangeRef.current = onLevelChange;

  const isSupported = hasDeviceMotionSupport();

  const sampleLimit = useMemo(() => {
    const estimated = Math.round((samplingRate || 60) * (windowSize / 1000));
    if (Number.isFinite(estimated) && estimated > 0) {
      return clamp(estimated, 10, 60);
    }
    return DEFAULT_SAMPLE_LIMIT;
  }, [samplingRate, windowSize]);

  const sensitivityConfig = useMemo(() => {
    const clampedScale = clamp(sensitivityScale, 0.1, MAX_SENSITIVITY_SCALE);
    return {
      scale: clampedScale,
      display: (clampedScale * 100).toFixed(0)
    };
  }, [sensitivityScale]);

  const resetBuffers = useCallback(() => {
    samplesRef.current = [];
    eventCountRef.current = 0;
    lastLevelRef.current = 0;
    prevSmoothRef.current = 0;
    idleTickRef.current = 0;
  }, []);

  const handleMotionEvent = useCallback((event) => {
    const { accelerationIncludingGravity, rotationRate } = event;

    if (!accelerationIncludingGravity) {
      return;
    }

    const sanitized = {
      x: Number.isFinite(accelerationIncludingGravity.x) ? accelerationIncludingGravity.x : 0,
      y: Number.isFinite(accelerationIncludingGravity.y) ? accelerationIncludingGravity.y : 0,
      z: Number.isFinite(accelerationIncludingGravity.z) ? accelerationIncludingGravity.z : 0
    };

    const magnitude = calculateMagnitude(sanitized);
    const diff = Math.max(0, Math.abs(magnitude - GRAVITY));

    let rotationMagnitude = 0;
    if (rotationRate) {
      const rx = Number.isFinite(rotationRate.alpha) ? rotationRate.alpha * DEG_TO_RAD : 0;
      const ry = Number.isFinite(rotationRate.beta) ? rotationRate.beta * DEG_TO_RAD : 0;
      const rz = Number.isFinite(rotationRate.gamma) ? rotationRate.gamma * DEG_TO_RAD : 0;
      rotationMagnitude = Math.sqrt(rx * rx + ry * ry + rz * rz);
    }

    const timestamp = Date.now();

    samplesRef.current.push({
      timestamp,
      diff,
      magnitude,
      rotation: rotationMagnitude
    });

    if (samplesRef.current.length > sampleLimit) {
      samplesRef.current.splice(0, samplesRef.current.length - sampleLimit);
    }

    const cutoff = timestamp - windowSize;
    samplesRef.current = samplesRef.current.filter((sample) => sample.timestamp >= cutoff);

    eventCountRef.current += 1;
    lastAccelDataRef.current = {
      x: sanitized.x.toFixed(2),
      y: sanitized.y.toFixed(2),
      z: sanitized.z.toFixed(2)
    };
  }, [sampleLimit, windowSize]);

  const detachListener = useCallback(() => {
    if (listenerRef.current && typeof window !== 'undefined') {
      window.removeEventListener('devicemotion', listenerRef.current);
      listenerRef.current = null;
    }
    setIsListening(false);
  }, []);

  const attachListener = useCallback(() => {
    if (!isSupported || listenerRef.current || typeof window === 'undefined') {
      return;
    }

    const listener = (event) => handleMotionEvent(event);
    window.addEventListener('devicemotion', listener);
    listenerRef.current = listener;
    setIsListening(true);
  }, [handleMotionEvent, isSupported]);

  useEffect(() => {
    if (!isSupported) {
      setError('您的裝置不支援 DeviceMotion 感測器');
      setPermissionStatus('denied');
      return;
    }

    if (!requiresExplicitPermission()) {
      setPermissionStatus('granted');
    }
  }, [isSupported]);

  useEffect(() => {
    return () => {
      detachListener();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [detachListener]);

  useEffect(() => {
    if (!isSupported || permissionStatus !== 'granted') {
      detachListener();
      if (lastLevelRef.current !== 0) {
        lastLevelRef.current = 0;
        setLevel(0);
        if (onLevelChangeRef.current) {
          onLevelChangeRef.current(0);
        }
      } else {
        setLevel(0);
      }
      resetBuffers();
      return;
    }

    if (enabled || forceListeningRef.current) {
      attachListener();
    } else {
      detachListener();
      if (lastLevelRef.current !== 0) {
        lastLevelRef.current = 0;
        setLevel(0);
        if (onLevelChangeRef.current) {
          onLevelChangeRef.current(0);
        }
      } else {
        setLevel(0);
      }
      resetBuffers();
    }
  }, [attachListener, detachListener, enabled, isSupported, permissionStatus, resetBuffers]);

  useEffect(() => {
    if (enabled) {
      forceListeningRef.current = false;
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !isListening) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const intervalDelay = 150;
    const getNextLevel = (value, currentLevel) => {
      if (value >= HYSTERESIS_THRESHOLDS.up[3]) {
        return 3;
      }
      if (value >= HYSTERESIS_THRESHOLDS.up[2]) {
        return currentLevel === 3 && value < HYSTERESIS_THRESHOLDS.down[3] ? 3 : 2;
      }
      if (value >= HYSTERESIS_THRESHOLDS.up[1]) {
        if (currentLevel === 3 && value >= HYSTERESIS_THRESHOLDS.down[3]) {
          return 3;
        }
        if (currentLevel === 2 && value >= HYSTERESIS_THRESHOLDS.down[2]) {
          return 2;
        }
        return 1;
      }
      if (currentLevel > 0 && value >= HYSTERESIS_THRESHOLDS.down[currentLevel]) {
        return currentLevel;
      }
      return 0;
    };

    const interval = setInterval(() => {
      const samples = samplesRef.current;

      if (samples.length < Math.max(6, Math.floor(sampleLimit / 3))) {
        prevSmoothRef.current *= 0.9;
        if (prevSmoothRef.current < 0.05) {
          prevSmoothRef.current = 0;
        }

        if (lastLevelRef.current !== 0 && prevSmoothRef.current === 0) {
          lastLevelRef.current = 0;
          setLevel(0);
          if (onLevelChangeRef.current) {
            onLevelChangeRef.current(0);
          }
        }

        setDebugInfo((prev) => ({
          ...prev,
          eventCount: eventCountRef.current,
          lastMagnitude: samples[samples.length - 1]?.magnitude.toFixed(2) ?? null,
          lastDiff: samples[samples.length - 1]?.diff.toFixed(2) ?? null,
          lastRotation: samples[samples.length - 1]?.rotation?.toFixed(3) ?? null,
          mean: null,
          std: null,
          intensity: null,
          boostedIntensity: null,
          normalized: null,
          smooth: prevSmoothRef.current.toFixed(2),
          baseline: null,
          sigma: null,
          lastAccelData: lastAccelDataRef.current,
          sensitivity: sensitivityConfig.display,
          intensityMin: HYSTERESIS_THRESHOLDS.up[1].toFixed(2),
          intensityMax: HYSTERESIS_THRESHOLDS.up[3].toFixed(2),
          normalizedUp1: HYSTERESIS_THRESHOLDS.up[1].toFixed(2),
          normalizedUp2: HYSTERESIS_THRESHOLDS.up[2].toFixed(2),
          normalizedUp3: HYSTERESIS_THRESHOLDS.up[3].toFixed(2),
          normalizedDown1: HYSTERESIS_THRESHOLDS.down[1].toFixed(2),
          normalizedDown2: HYSTERESIS_THRESHOLDS.down[2].toFixed(2),
          normalizedDown3: HYSTERESIS_THRESHOLDS.down[3].toFixed(2)
        }));

        return;
      }

      const diffs = samples.map((sample) => sample.diff);
      const rotations = samples.map((sample) => sample.rotation ?? 0);

      const combined = diffs.map((motion, index) => {
        const rotation = rotations[index] ?? 0;
        return MOTION_WEIGHT * motion + ROTATION_WEIGHT * rotation;
      });

      const baseline = average(combined);
      const sigma = standardDeviation(combined);
      const latestMotion = diffs[diffs.length - 1] ?? 0;
      const latestRotation = rotations[rotations.length - 1] ?? 0;
      const latestCombined = combined[combined.length - 1] ?? 0;

      const boostedIntensity = latestCombined * sensitivityConfig.scale;
      const adaptiveRange = Math.max(sigma * 2, DEFAULT_INTENSITY_MIN);
      const hasStableSigma = sigma >= MIN_SIGMA_FOR_LEVEL;
      const normalized = hasStableSigma
        ? clamp((boostedIntensity - baseline) / adaptiveRange, 0, 1)
        : 0;

      let smooth = SMOOTHING_ALPHA * normalized +
        (1 - SMOOTHING_ALPHA) * prevSmoothRef.current;

      if (normalized < 0.02 && smooth < 0.05) {
        smooth = 0;
      }

      if (normalized < 0.05) {
        idleTickRef.current += 1;
      } else {
        idleTickRef.current = 0;
      }

      if (idleTickRef.current >= IDLE_RESET_TICKS) {
        smooth = 0;
        prevSmoothRef.current = 0;
      }

      prevSmoothRef.current = smooth;

      const nextLevel = getNextLevel(smooth, lastLevelRef.current);

      setDebugInfo({
        eventCount: eventCountRef.current,
        lastMagnitude: samples[samples.length - 1]?.magnitude.toFixed(2) ?? null,
        lastDiff: latestMotion.toFixed(2),
        lastRotation: latestRotation.toFixed(3),
        mean: baseline.toFixed(2),
        std: sigma.toFixed(2),
        intensity: latestCombined.toFixed(2),
        boostedIntensity: boostedIntensity.toFixed(2),
        normalized: normalized.toFixed(2),
        smooth: smooth.toFixed(2),
        baseline: baseline.toFixed(2),
        sigma: sigma.toFixed(2),
        lastAccelData: lastAccelDataRef.current,
        sensitivity: sensitivityConfig.display,
        intensityMin: HYSTERESIS_THRESHOLDS.up[1].toFixed(2),
        intensityMax: HYSTERESIS_THRESHOLDS.up[3].toFixed(2),
        normalizedUp1: HYSTERESIS_THRESHOLDS.up[1].toFixed(2),
        normalizedUp2: HYSTERESIS_THRESHOLDS.up[2].toFixed(2),
        normalizedUp3: HYSTERESIS_THRESHOLDS.up[3].toFixed(2),
        normalizedDown1: HYSTERESIS_THRESHOLDS.down[1].toFixed(2),
        normalizedDown2: HYSTERESIS_THRESHOLDS.down[2].toFixed(2),
        normalizedDown3: HYSTERESIS_THRESHOLDS.down[3].toFixed(2)
      });

      if (nextLevel !== lastLevelRef.current) {
        lastLevelRef.current = nextLevel;
        setLevel(nextLevel);
        if (onLevelChangeRef.current) {
          onLevelChangeRef.current(nextLevel);
        }
      }
    }, intervalDelay);

    intervalRef.current = interval;

    return () => {
      clearInterval(interval);
      intervalRef.current = null;
    };
  }, [enabled, isListening, sampleLimit, sensitivityConfig.display, sensitivityConfig.scale]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      setError('您的裝置不支援 DeviceMotion 感測器');
      setPermissionStatus('denied');
      return false;
    }

    if (!requiresExplicitPermission()) {
      setPermissionStatus('granted');
      setError(null);
      return true;
    }

    try {
      setPermissionStatus('requesting');
      const result = await DeviceMotionEvent.requestPermission();

      if (result === 'granted') {
        setPermissionStatus('granted');
        setError(null);
        if (requiresExplicitPermission()) {
          forceListeningRef.current = true;
        }
        attachListener();
        return true;
      }

      setPermissionStatus('denied');
      setError('權限被拒絕');
      return false;
    } catch (err) {
      setPermissionStatus('denied');
      setError(`申請權限失敗：${err.message}`);
      return false;
    }
  }, [attachListener, isSupported]);

  return {
    level,
    isListening,
    error,
    permissionStatus,
    isSupported,
    requestPermission,
    debugInfo
  };
};

export default useDeviceMotion;
