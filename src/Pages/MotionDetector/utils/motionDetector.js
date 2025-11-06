/**
 * 震動強度檢測演算法
 * 根據加速度的幅度和頻率判定強度等級 (1, 2, 3)
 */

/**
 * 計算三軸加速度的合值
 * @param {object} acceleration - { x, y, z } 加速度值
 * @returns {number} 合加速度值
 */
export const calculateMagnitude = (acceleration) => {
  const { x = 0, y = 0, z = 0 } = acceleration;
  return Math.sqrt(x * x + y * y + z * z);
};

/**
 * 移除重力加速度影響
 * 假設靜止狀態下的加速度包含重力（約 9.8 m/s²）
 * @param {object} acceleration - { x, y, z } 加速度值
 * @returns {object} 移除重力後的加速度值
 */
export const removeGravity = (acceleration) => {
  // 簡單起見，我們不修改原始值，而是在計算時考慮
  // 因為 DeviceMotionEvent 已經在一定程度上移除了重力影響
  return acceleration;
};

/**
 * 計算加速度值序列的頻率
 * 使用零交叉計數方法估計頻率
 * @param {number[]} magnitudes - 時間序列的加速度合值數組
 * @param {number} samplingRate - 採樣率（Hz）
 * @returns {number} 估計的頻率（Hz）
 */
export const calculateFrequency = (
  magnitudes,
  options = {}
) => {
  const {
    samplingRate = 60,
    durationMs = null
  } = options;

  if (magnitudes.length < 2) {
    return 0;
  }

  const mean = magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length;

  let zeroCrossings = 0;
  for (let i = 1; i < magnitudes.length; i++) {
    const prev = magnitudes[i - 1] - mean;
    const curr = magnitudes[i] - mean;
    if (prev === 0) {
      continue;
    }
    if (prev * curr < 0) {
      zeroCrossings++;
    }
  }

  const totalTimeSeconds = durationMs && durationMs > 0
    ? durationMs / 1000
    : magnitudes.length / samplingRate;

  if (!totalTimeSeconds) {
    return 0;
  }

  return zeroCrossings / (2 * totalTimeSeconds);
};

/**
 * 計算加速度序列的幅度（最大值或標準差）
 * @param {number[]} magnitudes - 加速度合值數組
 * @param {string} method - 'max' 或 'std'（標準差）
 * @returns {number} 幅度值
 */
export const calculateAmplitude = (magnitudes, method = 'max') => {
  if (magnitudes.length === 0) return 0;

  if (method === 'max') {
    return Math.max(...magnitudes);
  } else if (method === 'maxDeviation') {
    const mean = magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length;
    return magnitudes.reduce(
      (max, value) => Math.max(max, Math.abs(value - mean)),
      0
    );
  } else if (method === 'range') {
    const max = Math.max(...magnitudes);
    const min = Math.min(...magnitudes);
    return max - min;
  } else if (method === 'std') {
    // 計算標準差
    const mean = magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length;
    const variance =
      magnitudes.reduce((sum, val) => sum + (val - mean) ** 2, 0) /
      magnitudes.length;
    return Math.sqrt(variance);
  }

  return 0;
};

/**
 * 判定震動強度等級
 * @param {number} amplitude - 幅度值
 * @param {number} frequency - 頻率值（Hz）
 * @returns {number} 強度等級 (1, 2, 3)
 *
 * 規則：
 * - 強度 3：amplitude ≥ 0.75 且 frequency ≥ 0.8Hz
 * - 強度 2：amplitude ≥ 0.35
 * - 強度 1：其餘非靜止狀態
  * - 等級 0：傳遞到此函式前已判定為靜止（幅度小於 minMagnitude）
 */
export const determineMotionLevel = (amplitude, frequency) => {
  if (amplitude >= 0.75 && frequency >= 0.8) {
    return 3;
  }

  if (amplitude >= 0.35) {
    return 2;
  }

  return 1;
};

/**
 * 根據加速度序列計算強度等級
 * @param {number[]} magnitudes - 加速度合值序列
 * @param {object} options - 配置選項
 * @returns {number} 強度等級 (1, 2, 3)
 */
export const calculateMotionLevel = (
  magnitudes,
  options = {}
) => {
  const {
    samplingRate = 60,
    amplitudeMethod = 'std',
    minMagnitude = 0.1,
    windowSize = 1000
  } = options;

  const filtered = magnitudes.filter((magnitude) => Number.isFinite(magnitude));

  if (filtered.length < 2) {
    return 0;
  }

  const amplitude = calculateAmplitude(filtered, amplitudeMethod);

  if (amplitude < minMagnitude) {
    return 0;
  }

  const frequency = calculateFrequency(filtered, {
    samplingRate,
    durationMs: windowSize
  });

  return determineMotionLevel(amplitude, frequency);
};

/**
 * 對加速度序列進行滑動平均平滑化
 * @param {number[]} magnitudes - 加速度合值序列
 * @param {number} windowSize - 窗口大小
 * @returns {number[]} 平滑化後的序列
 */
export const smoothMagnitudes = (magnitudes, windowSize = 3) => {
  if (magnitudes.length === 0) return [];

  const smoothed = [];
  for (let i = 0; i < magnitudes.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(magnitudes.length, i + Math.ceil(windowSize / 2));
    const window = magnitudes.slice(start, end);
    const avg = window.reduce((a, b) => a + b, 0) / window.length;
    smoothed.push(avg);
  }

  return smoothed;
};
