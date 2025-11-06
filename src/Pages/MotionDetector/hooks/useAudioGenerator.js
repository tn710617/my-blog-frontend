import { useState, useCallback, useRef, useEffect } from 'react';
import { playTone } from '../utils/audioGenerator';

/**
 * useAudioGenerator Hook
 * 管理音頻播放隊列，使用 Web Audio API 生成音調
 *
 * @param {object} options - 配置選項
 * @returns {object} 包含 play, stop, isPlaying, currentLevel 等
 */
export const useAudioGenerator = (options = {}) => {
  const {
    audioDuration = 0.5, // 每個音頻的持續時間（秒）
    onPlayStart = null, // 開始播放回調
    onPlayEnd = null // 停止播放回調
  } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [error, setError] = useState(null);

  const queueRef = useRef([]);
  const isProcessingRef = useRef(false);
  const lastPlayedLevelRef = useRef(null);
  const lastDispatchedLevelRef = useRef(null);

  // 處理隊列中的下一個音頻
  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || queueRef.current.length === 0) {
      return;
    }

    isProcessingRef.current = true;

    try {
      const level = queueRef.current.shift();

      lastPlayedLevelRef.current = level;
      setCurrentLevel(level);
      setIsPlaying(true);

      if (onPlayStart) {
        onPlayStart(level);
      }

      // 播放音頻
      await playTone(level, audioDuration);

      // 播放完成
      setIsPlaying(false);

      if (onPlayEnd) {
        onPlayEnd(level);
      }

      isProcessingRef.current = false;

      // 處理隊列中的下一個
      if (queueRef.current.length > 0) {
        processQueue();
      } else {
        lastDispatchedLevelRef.current = null;
      }
    } catch (err) {
      console.error('Error playing audio:', err);
      setError(`Error playing audio: ${err.message}`);
      setIsPlaying(false);
      isProcessingRef.current = false;
    }
  }, [audioDuration, onPlayStart, onPlayEnd]);

  // 播放指定強度的音頻
  const play = useCallback(
    (level) => {
      if (!level || (level !== 1 && level !== 2 && level !== 3)) {
        console.warn(`Invalid audio level: ${level}`);
        return;
      }

      if (lastDispatchedLevelRef.current === level) {
        return;
      }

      try {
        queueRef.current.push(level);
        lastDispatchedLevelRef.current = level;
        setError(null);

        processQueue();
      } catch (err) {
        console.error('Error queuing audio:', err);
        setError(`Error queuing audio: ${err.message}`);
      }
    },
    [processQueue]
  );

  // 停止播放
  const stop = useCallback(() => {
    queueRef.current = [];
    isProcessingRef.current = false;
    setIsPlaying(false);
    setCurrentLevel(null);
    lastDispatchedLevelRef.current = null;
    lastPlayedLevelRef.current = null;
  }, []);

  // 清理函數
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    play,
    stop,
    isPlaying,
    currentLevel,
    error,
    queueLength: queueRef.current.length
  };
};

export default useAudioGenerator;
