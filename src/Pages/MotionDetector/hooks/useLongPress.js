import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * useLongPress Hook
 * 管理長按邏輯，返回進度信息和事件處理器
 *
 * @param {object} options - 配置選項
 * @returns {object} 包含 progress, isPressed, handlers 等
 */
export const useLongPress = (options = {}) => {
  const {
    duration = 3000, // 長按持續時間（ms），預設 3秒
    onComplete = null, // 長按完成的回調
    onCancel = null, // 取消長按的回調
    onProgress = null // 進度更新回調
  } = options;

  const [progress, setProgress] = useState(0);
  const [isPressed, setIsPressed] = useState(false);

  const timerRef = useRef(null);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // 處理按下開始
  const handlePressStart = useCallback(
    (e) => {
      // 防止默認行為（如長按菜單）
      if (e.preventDefault) {
        e.preventDefault();
      }

      setIsPressed(true);
      setProgress(0);
      if (onProgress) {
        onProgress(0);
      }
      startTimeRef.current = Date.now();

      // 定時更新進度
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const progressPercent = Math.min((elapsed / duration) * 100, 100);
        setProgress(progressPercent);
        if (onProgress) {
          onProgress(progressPercent);
        }

        // 檢查是否完成
        if (elapsed >= duration) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
          setIsPressed(false);
          setProgress(0);

          if (onComplete) {
            onComplete();
          }
        }
      }, 50); // 每 50ms 更新一次進度

      // 設定超時作為備份
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        setIsPressed(false);
        setProgress(0);
        if (onProgress) {
          onProgress(100);
        }

        if (onComplete) {
          onComplete();
        }
      }, duration);
    },
    [duration, onComplete, onProgress]
  );

  // 處理按下結束或取消
  const handlePressEnd = useCallback(
    (e) => {
      if (!isPressed) return;

      // 清理定時器
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      setIsPressed(false);

      if (progress < 100) {
        setProgress(0);
        if (onProgress) {
          onProgress(0);
        }
        if (onCancel) {
          onCancel();
        }
      }
    },
    [isPressed, progress, onCancel, onProgress]
  );

  // 清理函數
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 返回事件處理器
  const handlers = {
    onMouseDown: handlePressStart,
    onMouseUp: handlePressEnd,
    onMouseLeave: handlePressEnd,
    onTouchStart: handlePressStart,
    onTouchEnd: handlePressEnd,
    onTouchCancel: handlePressEnd
  };

  return {
    progress, // 0-100 的進度百分比
    isPressed, // 是否正在按下
    handlers // 事件處理器對象
  };
};

export default useLongPress;
