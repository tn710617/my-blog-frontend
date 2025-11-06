import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  preloadMotionAudio,
  createAudioInstance,
  stopAudioInstance,
  getAudioContext
} from '../utils/audioGenerator';
import { fetchMotionAudios } from '../../../APIs/motionAudios';

const VALID_LEVELS = new Set([1, 2, 3]);

/**
 * useAudioGenerator Hook
 * 下載並快取對應 level 的音訊，提供隨機播放能力
 */
const SILENT_AUDIO_DATA_URL =
  'data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

export const useAudioGenerator = (options = {}) => {
  const {
    onPlayStart = null,
    onPlayEnd = null
  } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const currentAudioRef = useRef(null);
  const audioLibraryRef = useRef(new Map());
  const libraryReadyRef = useRef(false);
  const pendingLevelRef = useRef(null);
  const isUnlockedRef = useRef(false);
  const currentSourceNodeRef = useRef(null);
  const currentGainNodeRef = useRef(null);

  const selectRandomEntry = useCallback((level) => {
    const entries = audioLibraryRef.current.get(level);
    if (!entries || entries.length === 0) {
      return null;
    }

    const index = Math.floor(Math.random() * entries.length);
    return entries[index];
  }, []);

  const startPlayback = useCallback((level) => {
    const entry = selectRandomEntry(level);
    if (!entry) {
      throw new Error(`No audio available for level ${level}`);
    }

    setError(null);

    try {
      const audioContext = getAudioContext();
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {});
      }

      const audio = createAudioInstance(entry.url);
      currentAudioRef.current = audio;

      const sourceNode = audioContext.createMediaElementSource(audio);
      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
      sourceNode.connect(gainNode);
      gainNode.connect(audioContext.destination);
      currentSourceNodeRef.current = sourceNode;
      currentGainNodeRef.current = gainNode;

      const cleanup = () => {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        if (currentSourceNodeRef.current === sourceNode) {
          try {
            currentSourceNodeRef.current.disconnect();
          } catch (disconnectError) {
            console.warn('Failed to disconnect source node:', disconnectError);
          }
          currentSourceNodeRef.current = null;
        }
        if (currentGainNodeRef.current === gainNode) {
          try {
            currentGainNodeRef.current.disconnect();
          } catch (disconnectError) {
            console.warn('Failed to disconnect gain node:', disconnectError);
          }
          currentGainNodeRef.current = null;
        }
      };

      const handleEnded = () => {
        cleanup();
        if (currentAudioRef.current === audio) {
          currentAudioRef.current = null;
        }
        setIsPlaying(false);
        if (onPlayEnd) {
          onPlayEnd(level);
        }

        const nextLevel = pendingLevelRef.current;
        if (nextLevel !== null && libraryReadyRef.current) {
          pendingLevelRef.current = null;
          try {
            startPlayback(nextLevel);
          } catch (err) {
            console.error('Error starting pending audio:', err);
            setError(err instanceof Error ? err.message : 'Audio playback error');
          }
        } else {
          setCurrentLevel(null);
        }
      };

      const handleError = (event) => {
        cleanup();
        if (currentAudioRef.current === audio) {
          currentAudioRef.current = null;
        }
        setIsPlaying(false);
        const message = event?.message || 'Audio playback failed';
        setError(message);

        const nextLevel = pendingLevelRef.current;
        if (nextLevel !== null && libraryReadyRef.current) {
          pendingLevelRef.current = null;
          try {
            startPlayback(nextLevel);
          } catch (err) {
            console.error('Error starting pending audio after failure:', err);
            setError(err instanceof Error ? err.message : 'Audio playback error');
          }
        } else {
          setCurrentLevel(null);
        }
      };

      const fadeInDuration = 0.05;
      const fadeOutDuration = 0.08;

      const scheduleFadeOut = (duration) => {
        if (!Number.isFinite(duration) || duration <= 0) {
          return;
        }
        const now = audioContext.currentTime;
        const fadeInStart = now;
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(0.0001, fadeInStart);
        gainNode.gain.linearRampToValueAtTime(1, fadeInStart + fadeInDuration);

        const fadeOutStart = fadeInStart + Math.max(duration - fadeOutDuration, fadeInDuration);
        gainNode.gain.setValueAtTime(1, fadeOutStart);
        gainNode.gain.linearRampToValueAtTime(0.0001, fadeOutStart + fadeOutDuration);
      };

      const handleLoadedMetadata = () => {
        scheduleFadeOut(audio.duration);
      };

      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);

      setIsPlaying(true);
      setCurrentLevel(level);
      if (onPlayStart) {
        onPlayStart(level);
      }

      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch((err) => {
          handleError(err);
        });
      }

      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        scheduleFadeOut(audio.duration);
      }
    } catch (err) {
      if (currentAudioRef.current) {
        stopAudioInstance(currentAudioRef.current);
        currentAudioRef.current = null;
      }
      if (currentSourceNodeRef.current) {
        try {
          currentSourceNodeRef.current.disconnect();
        } catch (disconnectError) {
          console.warn('Failed to disconnect source node:', disconnectError);
        }
        currentSourceNodeRef.current = null;
      }
      if (currentGainNodeRef.current) {
        try {
          currentGainNodeRef.current.disconnect();
        } catch (disconnectError) {
          console.warn('Failed to disconnect gain node:', disconnectError);
        }
        currentGainNodeRef.current = null;
      }
      setIsPlaying(false);
      throw err instanceof Error ? err : new Error('Audio playback failed');
    }
  }, [onPlayEnd, onPlayStart, selectRandomEntry]);

  const groupByLevel = useCallback((records) => {
    const grouped = new Map();

    records.forEach((record) => {
      const level = Number(record.level);
      if (!VALID_LEVELS.has(level)) {
        return;
      }

      if (!grouped.has(level)) {
        grouped.set(level, []);
      }
      grouped.get(level).push(record);
    });

    return grouped;
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadLibrary = async () => {
      if (libraryReadyRef.current || isCancelled) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const apiRecords = await fetchMotionAudios();
        if (isCancelled) {
          return;
        }

        const groupedRecords = groupByLevel(apiRecords);
        const levelEntries = Array.from(groupedRecords.entries());

        const prepared = await Promise.all(levelEntries.map(async ([level, records]) => {
          const entries = await Promise.all(records.map(async (record) => {
            try {
              const cacheRecord = await preloadMotionAudio(record.audio_url);
              return {
                id: record.id,
                url: cacheRecord.playbackUrl,
                filename: record.original_filename,
                sourceUrl: record.audio_url
              };
            } catch (err) {
              console.error('Failed to preload audio element:', record.audio_url, err);
              return null;
            }
          }));

          return [Number(level), entries.filter(Boolean)];
        }));

        if (isCancelled) {
          return;
        }

        const library = new Map(prepared.filter(([, entries]) => entries.length > 0));
        audioLibraryRef.current = library;
        libraryReadyRef.current = true;
        setIsReady(true);

        if (pendingLevelRef.current !== null && !currentAudioRef.current) {
          const levelToPlay = pendingLevelRef.current;
          pendingLevelRef.current = null;
          try {
            startPlayback(levelToPlay);
          } catch (err) {
            console.error('Error starting pending audio:', err);
            setError(err instanceof Error ? err.message : 'Audio playback error');
            pendingLevelRef.current = levelToPlay;
          }
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Failed to initialise motion audio library:', err);
          setError(err instanceof Error ? err.message : 'Failed to load motion audios');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadLibrary();

    return () => {
      isCancelled = true;
    };
  }, [groupByLevel, startPlayback]);

  const play = useCallback((level) => {
    if (!VALID_LEVELS.has(level)) {
      return;
    }

    setError(null);

    if (!libraryReadyRef.current) {
      pendingLevelRef.current = level;
      return;
    }

    if (!isPlaying && !currentAudioRef.current) {
      pendingLevelRef.current = null;
      try {
        startPlayback(level);
      } catch (err) {
        console.error('Error starting audio:', err);
        setError(err instanceof Error ? err.message : 'Audio playback error');
        pendingLevelRef.current = level;
      }
      return;
    }

    if (isPlaying && currentLevel === level && pendingLevelRef.current === null) {
      return;
    }

    pendingLevelRef.current = level;
  }, [currentLevel, isPlaying, startPlayback]);

  const stop = useCallback(() => {
    pendingLevelRef.current = null;

    if (currentAudioRef.current) {
      stopAudioInstance(currentAudioRef.current);
      currentAudioRef.current = null;
    }
    if (currentSourceNodeRef.current) {
      try {
        currentSourceNodeRef.current.disconnect();
      } catch (err) {
        console.warn('Failed to disconnect source node on stop:', err);
      }
      currentSourceNodeRef.current = null;
    }
    if (currentGainNodeRef.current) {
      try {
        currentGainNodeRef.current.disconnect();
      } catch (err) {
        console.warn('Failed to disconnect gain node on stop:', err);
      }
      currentGainNodeRef.current = null;
    }

    setIsPlaying(false);
    setCurrentLevel(null);
  }, []);

  const unlock = useCallback(() => {
    if (isUnlockedRef.current) {
      return;
    }

    try {
      try {
        const audioContext = getAudioContext();
        audioContext.resume().catch(() => {});
      } catch (err) {
        console.warn('Failed to ensure audio context during unlock:', err);
      }

      const audio = new Audio(SILENT_AUDIO_DATA_URL);
      audio.volume = 0;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(() => {
          isUnlockedRef.current = true;
          audio.pause();
        }).catch(() => {
          // ignore, user gesture requirement not satisfied yet
        });
      } else {
        isUnlockedRef.current = true;
      }
    } catch (error) {
      console.warn('Audio unlock failed:', error);
    }
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return useMemo(() => ({
    play,
    stop,
    unlock,
    isPlaying,
    currentLevel,
    error,
    isLoading,
    isReady
  }), [currentLevel, error, isLoading, isPlaying, isReady, play, stop, unlock]);
};

export default useAudioGenerator;
