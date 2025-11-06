/**
 * MotionDisplay 元件
 * 實時顯示當前檢測到的震動強度等級
 */

const MotionDisplay = ({ level = null, isVisible = false }) => {
  if (!isVisible) {
    return null;
  }

  // 根據強度等級決定顏色
  const getColor = () => {
    switch (level) {
      case 0:
        return 'text-gray-400';
      case 1:
        return 'text-green-400';
      case 2:
        return 'text-yellow-400';
      case 3:
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  // 根據強度等級決定描述文字
  const getDescription = () => {
    switch (level) {
      case 0:
        return '靜止';
      case 1:
        return '輕度';
      case 2:
        return '中度';
      case 3:
        return '強度';
      default:
        return '未檢測';
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* 大號數字 */}
      <div
        className={`
          text-9xl font-bold
          ${getColor()}
          drop-shadow-lg
          transition-colors duration-300
          select-none
        `}
      >
        {level !== null ? level : '-'}
      </div>

      {/* 描述文字 */}
      <div
        className={`
          text-lg font-semibold
          ${getColor()}
          transition-colors duration-300
          text-center
        `}
      >
        {getDescription()}
      </div>
    </div>
  );
};

export default MotionDisplay;
