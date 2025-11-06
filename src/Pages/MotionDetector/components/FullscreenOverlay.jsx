/**
 * FullscreenOverlay 元件
 * 全屏背景和佈局
 */

const FullscreenOverlay = ({ children, isVisible = false, className = '' }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`
        fixed inset-0 z-50 bg-black flex flex-col items-center justify-between
        safe-area-inset
        ${className}
      `}
      style={{
        paddingTop: 'max(env(safe-area-inset-top), 20px)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 20px)',
        paddingLeft: 'max(env(safe-area-inset-left), 0px)',
        paddingRight: 'max(env(safe-area-inset-right), 0px)',
        touchAction: 'none' // 防止預設觸摸行為
      }}
    >
      {children}
    </div>
  );
};

export default FullscreenOverlay;
