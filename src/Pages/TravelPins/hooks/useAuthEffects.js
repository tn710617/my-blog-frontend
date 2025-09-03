import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to manage authentication-related effects and button visibility
 * @param {boolean} isLoggedIn - Current authentication status
 * @returns {Object} Auth-related functions and refs
 */
export const useAuthEffects = (isLoggedIn) => {
  // 保存最新 auth 狀態，避免事件閉包拿到舊值
  const authRef = useRef(isLoggedIn);

  // 把 auth 狀態套用到某個 popup 容器
  const applyAuthButtonsVisibility = useCallback((rootEl, isAuth = authRef.current) => {
    if (!rootEl) return;
    const buttons = rootEl.querySelector('.auth-buttons-container');
    if (!buttons) return;
    buttons.classList.remove('auth-buttons-visible', 'auth-buttons-hidden');
    buttons.classList.add(isAuth ? 'auth-buttons-visible' : 'auth-buttons-hidden');
  }, []);

  // Auth 改變時，立刻同步 ref，並更新所有已開啟的 popups
  useEffect(() => {
    authRef.current = isLoggedIn;

    // 更新目前畫面上所有已開啟的 popup
    const openPopupEls = document.querySelectorAll('[id^="popup-"]');
    openPopupEls.forEach(el => applyAuthButtonsVisibility(el, isLoggedIn));

    // 兼容你現有的 global 方法（若別處有呼叫）
    if (typeof window.updateTravelPinAuthButtons === 'function') {
      window.updateTravelPinAuthButtons(isLoggedIn);
    }

    // 再延遲一次，避免剛渲染的 DOM 尚未到位
    const t = setTimeout(() => {
      const delayedEls = document.querySelectorAll('[id^="popup-"]');
      delayedEls.forEach(el => applyAuthButtonsVisibility(el, isLoggedIn));
      if (typeof window.updateTravelPinAuthButtons === 'function') {
        window.updateTravelPinAuthButtons(isLoggedIn);
      }
    }, 100);

    return () => {
      clearTimeout(t);
    };
  }, [isLoggedIn, applyAuthButtonsVisibility]);

  return {
    authRef,
    applyAuthButtonsVisibility
  };
};