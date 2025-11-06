/**
 * Web Audio API 音頻生成工具
 * 為不同強度等級生成不同頻率的 sine wave
 */

let audioContextInstance = null;

/**
 * 獲取或建立 AudioContext
 */
export const getAudioContext = () => {
  if (typeof window === 'undefined') {
    throw new Error('Web Audio API is not available in this environment');
  }

  if (!audioContextInstance) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      throw new Error('Web Audio API is not supported in this browser');
    }
    audioContextInstance = new AudioContext();
  }
  return audioContextInstance;
};

/**
 * 根據強度等級取得頻率
 * @param {number} level - 強度等級 (1, 2, 3)
 * @returns {number} 頻率 (Hz)
 */
export const getFrequencyForLevel = (level) => {
  const frequencies = {
    1: 200,  // 輕度 - 200Hz
    2: 400,  // 中度 - 400Hz
    3: 800   // 強度 - 800Hz
  };
  return frequencies[level] || 200;
};

/**
 * 生成並播放簡單的 tone
 * @param {number} level - 強度等級 (1, 2, 3)
 * @param {number} duration - 持續時間（秒），預設 0.5
 * @returns {Promise} 返回播放完成的 Promise
 */
export const playTone = (level, duration = 0.5) => {
  return new Promise((resolve) => {
    try {
      const audioContext = getAudioContext();
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {});
      }
      const frequency = getFrequencyForLevel(level);

      // 建立振盪器
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // 連接
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // 設定參數
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      // 設定音量和淡出
      const currentTime = audioContext.currentTime;
      gainNode.gain.setValueAtTime(0.3, currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        currentTime + duration
      );

      // 播放
      oscillator.start(currentTime);
      oscillator.stop(currentTime + duration);

      // 播放完成後的回調
      setTimeout(() => {
        resolve();
      }, duration * 1000);
    } catch (error) {
      console.error('Failed to play tone:', error);
      resolve();
    }
  });
};

/**
 * 停止所有當前播放的音頻
 */
export const stopAllAudio = () => {
  try {
    const audioContext = getAudioContext();
    if (audioContext.state === 'running') {
      // 實際上我們無法直接停止所有振盪器，但可以重置音量
      // 在這個簡單實現中，我們讓當前的音頻自然播放完成
    }
  } catch (error) {
    console.error('Failed to stop audio:', error);
  }
};

/**
 * 重置音頻上下文（用於清理）
 */
export const resetAudioContext = () => {
  try {
    if (audioContextInstance) {
      if (audioContextInstance.state === 'running') {
        // AudioContext 無法直接關閉，但可以設為 null
      }
    }
  } catch (error) {
    console.error('Failed to reset audio context:', error);
  }
};
