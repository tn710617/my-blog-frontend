let audioContextInstance = null;
const audioRecordCache = new Map();

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

const createRecordFromBlob = (url, blob) => {
  const objectUrl = URL.createObjectURL(blob);
  return {
    sourceUrl: url,
    playbackUrl: objectUrl,
    type: 'blob',
    cleanup: () => {
      try {
        URL.revokeObjectURL(objectUrl);
      } catch (error) {
        console.warn('Failed to revoke object URL:', error);
      }
    }
  };
};

const createRecordFromRemote = (url) => ({
  sourceUrl: url,
  playbackUrl: url,
  type: 'remote',
  cleanup: () => {}
});

export const preloadMotionAudio = async (url) => {
  if (typeof window === 'undefined') {
    return createRecordFromRemote(url);
  }

  if (audioRecordCache.has(url)) {
    return audioRecordCache.get(url);
  }

  const preloadPromise = (async () => {
    try {
      const response = await fetch(url, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`);
      }

      const blob = await response.blob();
      return createRecordFromBlob(url, blob);
    } catch (error) {
      console.warn('Falling back to remote audio playback due to preload error:', error);
      return createRecordFromRemote(url);
    }
  })();

  audioRecordCache.set(url, preloadPromise);
  return preloadPromise;
};

export const createAudioInstance = (url) => {
  if (typeof window === 'undefined') {
    throw new Error('Audio playback is not available in this environment');
  }

  const audio = new Audio(url);
  audio.preload = 'auto';
  audio.crossOrigin = 'anonymous';
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
  audioRecordCache.forEach(async (recordPromise) => {
    try {
      const record = await recordPromise;
      record.cleanup?.();
    } catch (error) {
      console.warn('Failed to cleanup cached audio record:', error);
    }
  });
  audioRecordCache.clear();
};

// 舊版 API 的兼容導出（避免舊程式碼導入失敗）
export const playTone = () => Promise.resolve();
