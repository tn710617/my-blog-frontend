/**
 * PermissionRequest 元件
 * 顯示權限申請提示和按鈕
 */

const PermissionRequest = ({
  permissionStatus = 'unknown',
  onRequestPermission = null,
  isLoading = false
}) => {
  const isGranted = permissionStatus === 'granted';
  const isDenied = permissionStatus === 'denied';
  const isRequesting = permissionStatus === 'requesting';

  if (isGranted) {
    return (
      <div className="p-4 bg-green-100 border border-green-400 rounded-lg">
        <p className="text-green-800 text-center font-semibold">
          ✓ 已授予權限，可以開始使用
        </p>
      </div>
    );
  }

  if (isDenied) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 rounded-lg">
        <p className="text-red-800 text-center font-semibold mb-3">
          ✗ 權限被拒絕
        </p>
        <p className="text-red-700 text-sm mb-4">
          請在設備設定中允許存取動作感測數據：
          <br />
          設定 → 隱私 → 動作與健身
        </p>
        <button
          onClick={onRequestPermission}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold disabled:opacity-50"
        >
          {isLoading ? '申請中...' : '重新申請'}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-100 border border-blue-400 rounded-lg">
      <p className="text-blue-800 text-center font-semibold mb-3">
        需要存取裝置的加速度感測器
      </p>
      <p className="text-blue-700 text-sm mb-4">
        此功能需要您的裝置權限來檢測震動強度。
      </p>
      <button
        onClick={onRequestPermission}
        disabled={isLoading || isRequesting}
        className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50"
      >
        {isRequesting ? '申請中...' : '申請權限'}
      </button>
    </div>
  );
};

export default PermissionRequest;
