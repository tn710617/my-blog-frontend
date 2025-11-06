import { useState, useCallback } from 'react';
import useDeviceMotion from './hooks/useDeviceMotion';
import useLongPress from './hooks/useLongPress';
import useAudioGenerator from './hooks/useAudioGenerator';
import {
  vibrateShort,
  vibrateDouble,
  vibrateProgress
} from './utils/deviceVibration';

import ToggleButton from './components/ToggleButton';
import MotionDisplay from './components/MotionDisplay';
import PermissionRequest from './components/PermissionRequest';

/**
 * Motion Detector 主頁面
 * 檢測手機震動強度並播放對應音頻
 */
const MotionDetector = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [lastLevel, setLastLevel] = useState(0);
  const [sensitivity, setSensitivity] = useState(1);
  const isDev = import.meta.env.DEV;

  // 音頻播放 Hook（提前定義，以便在回調中使用）
  const audioGenerator = useAudioGenerator();

  // 當強度等級變化時的回調（使用 useCallback 以穩定引用）
  const handleLevelChange = useCallback((level) => {
    if (typeof level !== 'number') {
      return;
    }

    if (level > 0) {
      audioGenerator.play(level);
    }
    setLastLevel(level);
  }, [audioGenerator]);

  // 加速度感測 Hook
  const deviceMotion = useDeviceMotion({
    enabled: isEnabled,
    windowSize: 1000,
    samplingRate: 60,
    onLevelChange: handleLevelChange,
    sensitivityScale: sensitivity
  });

  // 長按邏輯 Hook（用於停用）
  const longPress = useLongPress({
    duration: 3000,
    onComplete: () => {
      handleDisable();
    },
    onProgress: (value) => {
      if (value < 100) {
        vibrateProgress();
      }
    }
  });

  // 啟用震動檢測
  const handleEnable = async () => {
    if (deviceMotion.permissionStatus !== 'granted') {
      return;
    }

    audioGenerator.unlock?.();
    setIsEnabled(true);
    vibrateShort();
  };

  // 禁用震動檢測
  const handleDisable = async () => {
    try {
      setIsEnabled(false);
      audioGenerator.stop();
      setLastLevel(0);
      vibrateDouble();
    } catch (error) {
      console.error('Error disabling motion detector:', error);
    }
  };

  // 申請權限
  const handleRequestPermission = async () => {
    const granted = await deviceMotion.requestPermission();
    if (granted) {
      vibrateShort();
      audioGenerator.unlock?.();
      setIsEnabled(true);
    } else {
      vibrateDouble();
    }
  };

  const shouldShowPermissionRequest =
    deviceMotion.isSupported &&
    deviceMotion.permissionStatus !== 'granted';

  return (
    <div className="w-full h-screen flex flex-col items-center bg-white overflow-hidden mobile-container">
      {/* 標題 */}
      <div className="pt-8 pb-4">
        <h1 className="text-3xl font-bold text-gray-800">
          運動檢測器
        </h1>
      </div>

      {/* 描述 */}
      <div className="px-6 pb-4">
        <p className="text-gray-600 text-center text-sm max-w-xs">
          將手機平放在床上，系統將檢測震動強度（1-3級）並播放相應的音效
        </p>
      </div>

      {/* 內容區域 */}
      <div className="w-full px-6 flex-1 flex flex-col gap-4 overflow-y-auto">
        {/* 錯誤信息 */}
        {deviceMotion.error && (
          <div className="p-4 bg-red-100 border border-red-400 rounded-lg">
            <p className="text-red-800 text-sm">{deviceMotion.error}</p>
          </div>
        )}

        {/* 設備支援性檢查 */}
        {!deviceMotion.isSupported && (
          <div className="p-4 bg-red-100 border border-red-400 rounded-lg">
            <p className="text-red-800 text-center font-semibold mb-1">
              ✗ 您的設備不支援此功能
            </p>
            <p className="text-red-700 text-sm">
              需要支援 DeviceMotionEvent 的現代瀏覽器和加速度感測器
            </p>
          </div>
        )}

        {/* 權限申請 */}
        {shouldShowPermissionRequest && (
          <PermissionRequest
            permissionStatus={deviceMotion.permissionStatus}
            onRequestPermission={handleRequestPermission}
            isLoading={deviceMotion.permissionStatus === 'requesting'}
          />
        )}

       {/* 權限已授予提示 */}
       {deviceMotion.permissionStatus === 'granted' && !isEnabled && (
         <div className="p-4 bg-green-100 border border-green-400 rounded-lg">
           <p className="text-green-800 text-center font-semibold">
             ✓ 已授予權限，點擊下方按鈕開始使用
           </p>
         </div>
       )}

        {/* 靈敏度調整 */}
        <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">震動靈敏度</p>
              <p className="text-xs text-gray-600">
                {deviceMotion.debugInfo.sensitivity ? `${deviceMotion.debugInfo.sensitivity}%` : `${Math.round(sensitivity * 100)}%`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSensitivity(1)}
              className="text-xs text-blue-600 underline"
            >
              重置
            </button>
          </div>
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={sensitivity}
            onChange={(event) => setSensitivity(Number(event.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="mt-3 text-xs text-gray-600 space-y-1">
            <p>臨界範圍：
              {deviceMotion.debugInfo.intensityMin && deviceMotion.debugInfo.intensityMax
                ? ` ${deviceMotion.debugInfo.intensityMin} ~ ${deviceMotion.debugInfo.intensityMax}`
                : ' 調整以增減靈敏度'}
            </p>
            <p>向右拖曳 → 更敏感；向左拖曳 → 更耐震</p>
          </div>
        </div>

        {/* 強度顯示區域（啟用時） */}
        {isEnabled && (
          <div className="flex flex-col items-center gap-4">
            <MotionDisplay level={deviceMotion.level ?? lastLevel} isVisible={true} />
            <div className="w-full p-4 bg-blue-100 border border-blue-400 rounded-lg">
              <p className="text-blue-800 text-center font-semibold mb-3">
                ✓ 正在監聽震動...
              </p>
              <div className="bg-white rounded p-3 text-xs font-mono text-gray-700 space-y-1">
                <p className={deviceMotion.isListening ? 'text-green-600' : 'text-red-600'}>
                  監聽狀態: {deviceMotion.isListening ? '✓ ON' : '✗ OFF'}
                </p>
                <p>權限: {deviceMotion.permissionStatus}</p>
                <p>支援: {deviceMotion.isSupported ? '✓' : '✗'}</p>
                <p>事件計數: {deviceMotion.debugInfo.eventCount}</p>
                <p>最後合加速度: {deviceMotion.debugInfo.lastMagnitude || '-'}</p>
                <p>最後差值: {deviceMotion.debugInfo.lastDiff || '-'}</p>
                <p>平均值: {deviceMotion.debugInfo.mean || '-'}</p>
                <p>標準差: {deviceMotion.debugInfo.std || '-'}</p>
                <p>強度: {deviceMotion.debugInfo.intensity || '-'}</p>
                <p>正規化: {deviceMotion.debugInfo.normalized || '-'}</p>
                <p>平滑後: {deviceMotion.debugInfo.smooth || '-'}</p>
                <p>靈敏度: {deviceMotion.debugInfo.sensitivity || `${Math.round(sensitivity * 100)}%`}</p>
                {deviceMotion.debugInfo.intensityMin && deviceMotion.debugInfo.intensityMax && (
                  <p>閾值：{deviceMotion.debugInfo.intensityMin} ~ {deviceMotion.debugInfo.intensityMax}</p>
                )}
                <p>音效狀態: {
                  audioGenerator.isReady ? '已就緒' : (audioGenerator.isLoading ? '載入中' : '尚未就緒')
                }</p>
              </div>
              {!audioGenerator.isReady && (
                <p className="mt-3 text-xs text-blue-700">
                  音效載入中...
                </p>
              )}
              {audioGenerator.error && (
                <p className="mt-3 text-xs text-red-600">
                  音效載入失敗：{audioGenerator.error}
                </p>
              )}
            </div>
          </div>
        )}

        {isDev && audioGenerator.isReady && (
          <div className="p-4 bg-purple-100 border border-purple-400 rounded-lg">
            <p className="text-purple-800 text-sm font-semibold mb-3">
              開發測試：手動播放音效
            </p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[1, 2, 3].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => audioGenerator.play(lvl)}
                  className="px-3 py-2 text-sm font-semibold text-white bg-purple-500 rounded hover:bg-purple-600 active:bg-purple-700"
                >
                  播放等級 {lvl}
                </button>
              ))}
            </div>
            <button
              onClick={() => audioGenerator.stop()}
              className="w-full px-3 py-2 text-sm font-semibold text-purple-700 bg-white border border-purple-400 rounded hover:bg-purple-50"
            >
              停止播放
            </button>
          </div>
        )}

        {/* 按鈕區域與提示 */}
        <div className="flex flex-col items-center gap-4 pb-8">
          <ToggleButton
            isEnabled={isEnabled}
            isPressed={longPress.isPressed}
            progress={isEnabled ? longPress.progress : 0}
            onLongPressStart={isEnabled ? (e) => {
              const eventType = e?.type ?? '';
              if (eventType.startsWith('touch')) {
                longPress.handlers.onTouchStart?.(e);
              } else {
                longPress.handlers.onMouseDown?.(e);
              }
            } : null}
            onLongPressEnd={isEnabled ? (e) => {
              const eventType = e?.type ?? '';
              if (eventType.startsWith('touch')) {
                longPress.handlers.onTouchEnd?.(e);
              } else {
                longPress.handlers.onMouseUp?.(e);
              }
            } : null}
            disabled={
              !deviceMotion.isSupported || deviceMotion.permissionStatus !== 'granted'
            }
            onClick={!isEnabled ? handleEnable : undefined}
          />

          {isEnabled && (
            <p className="text-gray-600 text-sm font-semibold">
              {longPress.isPressed ? `按住停用 (${Math.round(longPress.progress)}%)` : '長按按鈕 3 秒停用'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MotionDetector;
