const audioElementCache = new Map();

export const preloadMotionAudio = (url) => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (audioElementCache.has(url)) {
    return audioElementCache.get(url);
  }

  const audio = new Audio();
  audio.preload = 'auto';
  audio.src = url;
  try {
    audio.load();
  } catch (error) {
    console.warn('Failed to preload audio element:', url, error);
  }

  audioElementCache.set(url, audio);
  return audio;
};

export const createAudioInstance = (url) => {
  if (typeof window === 'undefined') {
    throw new Error('Audio playback is not available in this environment');
  }

  const audio = new Audio(url);
  audio.preload = 'auto';
  return audio;
};

export const stopAudioInstance = (audio) => {
  if (!audio) {
    return;
  }

  try {
    audio.pause();
    audio.currentTime = 0;
  } catch (error) {
    console.warn('Failed to stop audio instance:', error);
  }
};

export const clearAudioCache = () => {
  audioElementCache.forEach((audio) => {
    try {
      audio.pause();
      audio.src = '';
    } catch (error) {
      console.warn('Failed to clear cached audio element:', error);
    }
  });
  audioElementCache.clear();
};

// 舊版 API 的兼容導出（避免舊程式碼導入失敗）
export const playTone = () => Promise.resolve();
