import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  preloadMotionAudio,
  createAudioInstance,
  stopAudioInstance
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

  const queueRef = useRef([]);
  const isProcessingRef = useRef(false);
  const currentAudioRef = useRef(null);
  const audioLibraryRef = useRef(new Map());
  const libraryReadyRef = useRef(false);
  const lastDispatchedLevelRef = useRef(null);
  const isUnlockedRef = useRef(false);

  const hasLibraryForLevel = useCallback((level) => {
    return audioLibraryRef.current.has(level) && audioLibraryRef.current.get(level).length > 0;
  }, []);

  const selectRandomEntry = useCallback((level) => {
    const entries = audioLibraryRef.current.get(level);
    if (!entries || entries.length === 0) {
      return null;
    }

    const index = Math.floor(Math.random() * entries.length);
    return entries[index];
  }, []);

  const playEntry = useCallback((level) => {
    const entry = selectRandomEntry(level);
    if (!entry) {
      throw new Error(`No audio available for level ${level}`);
    }

    return new Promise((resolve, reject) => {
      try {
        const audio = createAudioInstance(entry.url);
        currentAudioRef.current = audio;

        const cleanup = () => {
          audio.removeEventListener('ended', handleEnded);
          audio.removeEventListener('error', handleError);
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
          resolve();
        };

        const handleError = (event) => {
          cleanup();
          if (currentAudioRef.current === audio) {
            currentAudioRef.current = null;
          }
          setIsPlaying(false);
          reject(new Error(event?.message || 'Audio playback failed'));
        };

        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        setIsPlaying(true);
        setCurrentLevel(level);
        if (onPlayStart) {
          onPlayStart(level);
        }

        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(handleError);
        }
      } catch (err) {
        if (currentAudioRef.current) {
          stopAudioInstance(currentAudioRef.current);
          currentAudioRef.current = null;
        }
        setIsPlaying(false);
        reject(err instanceof Error ? err : new Error('Audio playback failed'));
      }
    });
  }, [onPlayEnd, onPlayStart, selectRandomEntry]);

  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || !libraryReadyRef.current) {
      return;
    }

    isProcessingRef.current = true;

    try {
      while (queueRef.current.length > 0 && libraryReadyRef.current) {
        const level = queueRef.current.shift();

        if (!hasLibraryForLevel(level)) {
          console.warn(`No audio library for level ${level}`);
          continue;
        }

        try {
          await playEntry(level);
        } catch (err) {
          console.error('Error playing audio:', err);
          setError(err instanceof Error ? err.message : 'Audio playback error');
        }
      }

      if (queueRef.current.length === 0) {
        lastDispatchedLevelRef.current = null;
      }
    } finally {
      isProcessingRef.current = false;
    }
  }, [hasLibraryForLevel, playEntry]);

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

        const prepared = levelEntries.map(([level, records]) => {
          const entries = records.map((record) => {
            try {
              preloadMotionAudio(record.audio_url);
              return {
                id: record.id,
                url: record.audio_url,
                filename: record.original_filename
              };
            } catch (err) {
              console.error('Failed to preload audio element:', record.audio_url, err);
              return null;
            }
          }).filter(Boolean);

          return [Number(level), entries];
        });

        if (isCancelled) {
          return;
        }

        const library = new Map(prepared.filter(([, entries]) => entries.length > 0));
        audioLibraryRef.current = library;
        libraryReadyRef.current = true;
        setIsReady(true);

        if (queueRef.current.length > 0) {
          processQueue();
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
  }, [groupByLevel, processQueue]);

  const play = useCallback((level) => {
    if (!VALID_LEVELS.has(level)) {
      return;
    }

    if (lastDispatchedLevelRef.current === level && queueRef.current.length === 0 && !isProcessingRef.current) {
      return;
    }

    queueRef.current.push(level);
    lastDispatchedLevelRef.current = level;
    setError(null);

    if (libraryReadyRef.current) {
      processQueue();
    }
  }, [processQueue]);

  const stop = useCallback(() => {
    queueRef.current = [];
    lastDispatchedLevelRef.current = null;

    if (currentAudioRef.current) {
      stopAudioInstance(currentAudioRef.current);
      currentAudioRef.current = null;
    }

    setIsPlaying(false);
    setCurrentLevel(null);
  }, []);

  const unlock = useCallback(() => {
    if (isUnlockedRef.current) {
      return;
    }

    try {
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
    isReady,
    queueLength: queueRef.current.length
  }), [currentLevel, error, isLoading, isPlaying, isReady, play, stop, unlock]);
};

export default useAudioGenerator;
