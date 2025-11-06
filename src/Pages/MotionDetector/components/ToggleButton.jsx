/**
 * ToggleButton 元件
 * 啟用/禁用切換按鈕，支持長按進度
 */

const ToggleButton = ({
  isEnabled = false,
  isPressed = false,
  progress = 0,
  onLongPressStart = null,
  onLongPressEnd = null,
  disabled = false,
  onClick = null
}) => {
  const handleMouseDown = (e) => {
    if (!disabled && onLongPressStart) {
      onLongPressStart(e);
    }
  };

  const handleMouseUp = (e) => {
    if (!disabled && onLongPressEnd) {
      onLongPressEnd(e);
    }
  };

  const handleTouchStart = (e) => {
    if (!disabled && onLongPressStart) {
      onLongPressStart(e);
    }
  };

  const handleTouchEnd = (e) => {
    if (!disabled && onLongPressEnd) {
      onLongPressEnd(e);
    }
  };

  // 顏色根據啟用狀態變化
  const bgColor = isEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600';
  const textColor = isEnabled ? 'text-red-600' : 'text-green-600';

  return (
    <div className="relative flex flex-col items-center gap-4">
      {/* 主按鈕 */}
      <button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onClick={onClick}
        disabled={disabled}
        className={`
          w-24 h-24 rounded-full flex items-center justify-center
          text-white font-bold text-lg
          transition-all duration-200
          ${bgColor}
          ${isPressed ? 'scale-95 shadow-lg' : 'shadow-md'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
          select-none
        `}
      >
        {isEnabled ? '停用' : '啟用'}
      </button>

      {/* 進度條 (長按時顯示) */}
      {isPressed && (
        <div className="relative w-32 h-1 bg-gray-300 rounded-full overflow-hidden">
          {/* 進度 */}
          <div
            className={`
              h-full rounded-full transition-all duration-75
              ${progress < 33 ? 'bg-green-500' : progress < 66 ? 'bg-yellow-500' : 'bg-red-500'}
            `}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* 進度文字 */}
      {isPressed && (
        <div className={`text-sm font-semibold ${textColor}`}>
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
};

export default ToggleButton;
