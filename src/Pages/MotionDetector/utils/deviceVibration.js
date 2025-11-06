/**
 * 設備觸覺反饋工具
 * 使用 Vibration API 提供觸覺反饋
 */

/**
 * 檢查設備是否支援振動 API
 */
export const isVibrationSupported = () => {
  return !!(
    navigator.vibrate ||
    navigator.webkitVibrate ||
    navigator.mozVibrate ||
    navigator.msVibrate
  );
};

/**
 * 獲取振動函數（跨瀏覽器相容性）
 */
const getVibrationFunction = () => {
  return (
    navigator.vibrate ||
    navigator.webkitVibrate ||
    navigator.mozVibrate ||
    navigator.msVibrate
  );
};

/**
 * 短振動反饋（啟用時）
 */
export const vibrateShort = () => {
  const vibrate = getVibrationFunction();
  if (vibrate) {
    vibrate.call(navigator, 100); // 100ms 短振動
  }
};

/**
 * 漸進式振動（長按進度反饋）
 */
export const vibrateProgress = () => {
  const vibrate = getVibrationFunction();
  if (vibrate) {
    vibrate.call(navigator, 50); // 50ms 短振動
  }
};

/**
 * 雙振動（停用時）
 */
export const vibrateDouble = () => {
  const vibrate = getVibrationFunction();
  if (vibrate) {
    vibrate.call(navigator, [50, 100, 50]); // 50ms 振動，100ms 停頓，50ms 振動
  }
};

/**
 * 自訂振動模式
 * @param {number|number[]} pattern - 振動時間（ms）或 [振，停，振...] 模式
 */
export const vibrate = (pattern) => {
  const vibrate = getVibrationFunction();
  if (vibrate) {
    vibrate.call(navigator, pattern);
  }
};

/**
 * 取消振動
 */
export const cancelVibration = () => {
  const vibrate = getVibrationFunction();
  if (vibrate) {
    vibrate.call(navigator, 0); // 傳入 0 或空陣列可取消
  }
};
