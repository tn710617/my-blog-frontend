/**
 * ProgressBar 元件
 * 顯示長按倒數進度條
 */

const ProgressBar = ({ progress = 0, isVisible = false }) => {
  if (!isVisible) {
    return null;
  }

  // 顏色漸變：綠色 -> 黃色 -> 紅色
  const getColor = () => {
    if (progress < 33) return 'bg-green-500';
    if (progress < 66) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // 圓形進度條（環形設計）
  const circumference = 2 * Math.PI * 45; // 半徑 45
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex items-center justify-center">
      {/* 環形進度條 */}
      <div className="relative w-28 h-28">
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* 背景圓 */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="4"
          />
          {/* 進度圓 */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={getColor().replace('bg-', '')}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-200"
          />
        </svg>

        {/* 中央文字 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold">{Math.round(progress)}%</div>
            <div className="text-xs text-gray-500">長按停用</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
