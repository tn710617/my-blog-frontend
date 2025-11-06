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

const createBufferRecord = (url, buffer) => ({
  sourceUrl: url,
  type: 'buffer',
  buffer,
  cleanup: () => {}
});

const createRemoteRecord = (url) => ({
  sourceUrl: url,
  type: 'remote',
  url,
  cleanup: () => {}
});

export const preloadMotionAudio = async (url) => {
  if (typeof window === 'undefined') {
    return createRemoteRecord(url);
  }

  if (audioRecordCache.has(url)) {
    return audioRecordCache.get(url);
  }

  const preloadPromise = (async () => {
    try {
      const audioContext = getAudioContext();
      const response = await fetch(url, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const decoded = await audioContext.decodeAudioData(arrayBuffer.slice(0));
      return createBufferRecord(url, decoded);
    } catch (error) {
      console.warn('Fallback to remote audio playback due to preload error:', url, error);
      return createRemoteRecord(url);
    }
  })();

  audioRecordCache.set(url, preloadPromise);
  return preloadPromise;
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

export const playTone = () => Promise.resolve();
