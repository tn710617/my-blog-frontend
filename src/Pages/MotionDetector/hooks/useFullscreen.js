import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * useFullscreen Hook
 * 管理全屏 API，處理跨瀏覽器相容性
 *
 * @returns {object} 包含 isFullscreen, enterFullscreen, exitFullscreen 等
 */
export const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(null);
  const elementRef = useRef(null);

  // 檢查全屏 API 支援
  const isSupported = useCallback(() => {
    return !!(
      document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.mozFullScreenEnabled ||
      document.msFullscreenEnabled
    );
  }, []);

  // 獲取當前全屏元素
  const getFullscreenElement = useCallback(() => {
    return (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  }, []);

  // 進入全屏
  const enterFullscreen = useCallback(async (element = null) => {
    if (!isSupported()) {
      setError('Fullscreen API is not supported');
      return false;
    }

    const target = element || elementRef.current || document.documentElement;

    try {
      // 嘗試不同的全屏 API
      if (target.requestFullscreen) {
        await target.requestFullscreen();
      } else if (target.webkitRequestFullscreen) {
        await target.webkitRequestFullscreen();
      } else if (target.mozRequestFullScreen) {
        await target.mozRequestFullScreen();
      } else if (target.msRequestFullscreen) {
        await target.msRequestFullscreen();
      }

      // 對於 iOS，可能需要額外的處理
      if (
        !getFullscreenElement() &&
        target.webkitEnterFullscreen
      ) {
        target.webkitEnterFullscreen();
      }

      setIsFullscreen(true);
      setError(null);
      return true;
    } catch (err) {
      console.error('Error entering fullscreen:', err);
      setError(`Error entering fullscreen: ${err.message}`);
      return false;
    }
  }, [isSupported, getFullscreenElement]);

  // 退出全屏
  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement || getFullscreenElement()) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
      }

      setIsFullscreen(false);
      setError(null);
      return true;
    } catch (err) {
      console.error('Error exiting fullscreen:', err);
      setError(`Error exiting fullscreen: ${err.message}`);
      return false;
    }
  }, [getFullscreenElement]);

  // 監聽全屏狀態變化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!getFullscreenElement());
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [getFullscreenElement]);

  return {
    isFullscreen,
    isSupported: isSupported(),
    error,
    enterFullscreen,
    exitFullscreen,
    elementRef
  };
};

export default useFullscreen;
