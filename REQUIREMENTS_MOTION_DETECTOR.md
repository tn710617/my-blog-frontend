# Motion Detector 運動檢測器 - 需求文檔

## 項目概述

在博客上添加一個運動檢測器網頁，用於檢測手機在床上的振動強度，並播放對應的音頻反饋。

---

## 功能需求

### 1. 路由和訪問控制
- **路由路徑**: `/motion-detector`
- **訪問權限**: 不需要登入（為了方便 Android 設備測試，暫時移除 ProtectedRoute）
- **菜單**: 不在導航菜單中顯示此頁面的鏈接
- **導航**: 可直接在瀏覽器地址欄訪問

### 2. 振動檢測

#### 2.1 加速度傳感器
- 使用 `DeviceMotionEvent` API 訪問設備加速度傳感器
- 採集三軸加速度數據 (X, Y, Z)
- 採樣率: 60 Hz
- 時間窗口: 1000ms

#### 2.2 強度等級判定
三個振動強度等級（1、2、3）：

| 等級 | 條件 | 描述 |
|------|------|------|
| **1** | `amplitude < 3` | 輕度振動 |
| **2** | `3 ≤ amplitude ≤ 8` | 中度振動 |
| **3** | `amplitude > 8 && frequency ≥ 5Hz` | 強度振動 |

##### 計算方法
- **幅度 (Amplitude)**: 取加速度序列中的最大值
- **頻率 (Frequency)**: 使用零交叉計數法估計，單位 Hz
- **加速度合值 (Magnitude)**: √(x² + y² + z²)

### 3. 音頻反饋

#### 3.1 音頻生成
- 使用 Web Audio API 動態生成音調（而非使用音頻文件）
- 每個等級對應不同頻率：
  - 等級 1: 200 Hz 正弦波
  - 等級 2: 400 Hz 正弦波
  - 等級 3: 800 Hz 正弦波
- 音頻時長: 0.5 秒
- 音量漸出效果（指數淡出）

#### 3.2 音頻隊列
- 實現隊列機制，避免音頻重疊
- 等待上一個音頻播放完成後再播放下一個
- 連續相同等級的振動只播放一次音頻

### 4. 用戶界面 (UI)

#### 4.1 設計原則
- **平臺**: 僅針對移動設備優化，不考慮桌面使用
- **全屏**: 填滿整個屏幕
- **觸摸友好**: 按鈕大小和間距適合觸摸操作

#### 4.2 主要組件

##### 標題區域
- 標題: "運動檢測器"
- 描述: "將手機平放在床上，系統將檢測振動強度（1-3級）並播放相應的音效"

##### 狀態信息區域
- **設備支援性檢查**: 如不支援 DeviceMotionEvent，顯示錯誤提示
- **權限申請提示**: 初次使用時提示申請權限
- **權限已授予提示**: 綠色提示框
- **啟用狀態信息**: 藍色框顯示正在監聽
- **調試信息** (開發階段):
  - 事件計數
  - 最後加速度 (X, Y, Z)
  - 最後幅度
  - 振幅值
  - 頻率值 (Hz)
  - 監聽狀態 (ON/OFF)
  - 權限狀態
  - 設備支援狀態

##### 強度顯示區域
- 啟用時顯示當前檢測到的等級 (1/2/3)
- 大字體顯示 (120px+)
- 顏色編碼:
  - 級別 1: 綠色
  - 級別 2: 黃色
  - 級別 3: 紅色

##### 切換按鈕
- **外觀**: 圓形按鈕，大小適合觸摸 (96px 直徑)
- **狀態顯示**:
  - 禁用: 綠色背景，顯示「啟用」
  - 啟用: 紅色背景，顯示「停用」
- **點擊行為**: 單擊切換開/關

#### 4.3 長按停用機制
- **激活條件**: 僅在啟用狀態時有效
- **長按時長**: 3 秒
- **視覺反饋**:
  - 顯示進度條
  - 進度文字百分比 (0-100%)
  - 進度條顏色:
    - 0-33%: 綠色
    - 33-66%: 黃色
    - 66-100%: 紅色
- **觸覺反饋**: 長按期間每 50ms 振動一次
- **完成**: 3 秒後自動禁用

### 5. 權限管理

#### 5.1 iOS (13+) 權限流程
- 設備檢查: `DeviceMotionEvent.requestPermission()`
- 用戶需主動點擊「申請權限」按鈕
- 權限狀態：unknown → requesting → granted/denied
- 權限申請成功後，**立即添加事件監聽器**（不等待其他操作）

#### 5.2 Android/非 iOS 設備
- 自動視為已授予權限
- 在用戶點擊「啟用」時添加事件監聽器
- 簡化權限申請流程

#### 5.3 權限狀態顯示
```
unknown  → 顯示「需要存取加速度感測器」+ 申請按鈕
granted  → 顯示「已授予權限，點擊下方按鈕開始使用」
denied   → 顯示「權限被拒絕」+ 重試按鈕
requesting → 顯示「正在申請權限...」(加載中)
```

### 6. 觸覺反饋 (Haptic Feedback)

| 操作 | 振動模式 |
|------|---------|
| 啟用按鈕點擊 | 100ms 單次短振 |
| 長按進度中 | 50ms 間隔振動 |
| 停用完成 | [50ms, 100ms, 50ms] 雙擊模式 |

---

## 技術實現

### 技術棧
- **前端框架**: React
- **路由**: React Router v7
- **狀態管理**: Zustand (授權狀態)
- **API**: DeviceMotionEvent (加速度傳感器), Web Audio API (音頻生成)
- **樣式**: Tailwind CSS
- **實時數據**: 定時檢查 (500ms 間隔)

### 核心模塊

#### Hooks (src/Pages/MotionDetector/hooks/)
1. **useDeviceMotion.js**
   - 管理加速度傳感器監聽
   - 計算運動等級
   - 返回: level, isListening, error, permissionStatus, debugInfo

2. **useAudioGenerator.js**
   - 管理音頻播放隊列
   - 使用 Web Audio API 生成正弦波
   - 返回: play(), stop(), isPlaying, currentLevel, queueLength

3. **useLongPress.js**
   - 管理 3 秒長按計時
   - 返回: progress (0-100%), isPressed, handlers

4. **useFullscreen.js** (可選)
   - 全屏模式支持

#### 組件 (src/Pages/MotionDetector/components/)
1. **MotionDisplay.jsx** - 顯示當前等級
2. **ToggleButton.jsx** - 啟用/停用按鈕 + 長按進度條
3. **PermissionRequest.jsx** - 權限申請提示
4. **FullscreenOverlay.jsx** (可選) - 全屏模式背景

#### 工具函數 (src/Pages/MotionDetector/utils/)
1. **motionDetector.js**
   - calculateMagnitude() - 計算加速度合值
   - calculateFrequency() - 估計頻率 (零交叉計數)
   - calculateAmplitude() - 計算幅度 (最大值/標準差)
   - determineMotionLevel() - 判定等級
   - calculateMotionLevel() - 完整流程

2. **audioGenerator.js**
   - playTone(level, duration) - 播放指定等級的音調

3. **deviceVibration.js**
   - vibrateShort() - 短振
   - vibrateProgress() - 長按進度振動
   - vibrateDouble() - 雙擊模式

#### 樣式 (src/Pages/MotionDetector/styles/)
1. **MotionDetector.css** - 移動優化樣式

---

## 開發階段清單

### Phase 1: 基礎設置 ✅
- [x] 創建頁面路由
- [x] 創建基本 UI 布局
- [x] 集成 DeviceMotionEvent API

### Phase 2: 核心功能 ✅
- [x] 實現加速度數據採集
- [x] 實現運動等級計算算法
- [x] 實現 Web Audio API 音頻生成
- [x] 實現音頻隊列機制

### Phase 3: 用戶交互 ✅
- [x] 實現切換按鈕
- [x] 實現 3 秒長按停用
- [x] 實現長按進度條視覺反饋
- [x] 實現觸覺反饋

### Phase 4: 權限管理 ✅
- [x] 實現 iOS 權限流程
- [x] 實現 Android 權限處理
- [x] 實現權限申請 UI

### Phase 5: 測試與優化 🔄
- [ ] 在 Android 設備上真機測試
- [ ] 驗證振動強度檢測準確性
- [ ] 驗證音頻播放隊列正確性
- [ ] 驗證長按停用功能
- [ ] 移除調試信息和 console.log

### Phase 6: 最後整理
- [ ] 移除手動測試按鈕
- [ ] 重新添加 ProtectedRoute (if needed)
- [ ] 代碼清理和優化
- [ ] 文檔完善

---

## 測試計畫

### 真機測試環境
- **設備**: Android 手機 (需支援加速度傳感器)
- **瀏覽器**: Chrome 或 Firefox
- **網絡**: 能夠訪問本地開發服務器

### 測試用例

| 用例 | 步驟 | 預期結果 |
|------|------|---------|
| 1. 權限申請 | 1. 訪問頁面 2. 點擊「申請權限」 | 顯示權限申請對話框，授予後顯示「已授予權限」 |
| 2. 輕度振動 | 1. 啟用 2. 輕輕搖晃手機 | 顯示級別 1，播放 200Hz 音調 |
| 3. 中度振動 | 1. 啟用 2. 中力搖晃手機 | 顯示級別 2，播放 400Hz 音調 |
| 4. 強度振動 | 1. 啟用 2. 快速/用力搖晃 | 顯示級別 3，播放 800Hz 音調 |
| 5. 等級變化 | 1. 啟用 2. 不同強度搖晃 | 等級正確改變，新音調播放，舊隊列取消 |
| 6. 長按停用 | 1. 啟用 2. 長按按鈕 3 秒 | 進度條填滿，自動停用，顯示「已停用」 |
| 7. 重新啟用 | 1. 停用 2. 再次點擊「啟用」 | 正常啟用，不會無限振動 |
| 8. 音頻隊列 | 1. 啟用 2. 快速搖晃改變強度 | 音頻依次播放，不重疊 |

---

## 已知問題與限制

### iOS 限制
- iOS Safari/Chrome 可能因為 HTTPS 限制而無法獲取加速度數據
- 需要在 HTTPS 環境下測試
- iOS 13+ 需明確申請 DeviceMotionEvent 權限

### Android 注意事項
- 某些設備可能加速度傳感器不靈敏
- 需要在實際設備上驗證

### 瀏覽器兼容性
- 僅支援支援 DeviceMotionEvent 的現代瀏覽器
- Web Audio API 跨瀏覽器相容性良好

---

## 環境配置

### 開發環境
- Node.js: 16.x 或更高
- Docker: 用於開發容器
- 包管理器: Yarn

### Docker 命令
```bash
# 啟動開發服務器
docker-compose up

# 重啟容器
docker-compose restart

# 停止容器
docker-compose down
```

### 本地開發
```bash
# 安裝依賴
yarn install

# 啟動開發服務器
yarn start

# 構建生產版本
yarn run build-production
```

---

## 文件結構

```
src/Pages/MotionDetector/
├── index.jsx                    # 主頁面組件
├── components/
│   ├── MotionDisplay.jsx       # 等級顯示組件
│   ├── ToggleButton.jsx        # 切換按鈕組件
│   ├── PermissionRequest.jsx   # 權限申請組件
│   └── FullscreenOverlay.jsx   # 全屏背景組件
├── hooks/
│   ├── useDeviceMotion.js      # 加速度傳感器 Hook
│   ├── useAudioGenerator.js    # 音頻播放 Hook
│   ├── useLongPress.js         # 長按計時 Hook
│   └── useFullscreen.js        # 全屏模式 Hook
├── utils/
│   ├── motionDetector.js       # 運動檢測算法
│   ├── audioGenerator.js       # 音頻生成工具
│   └── deviceVibration.js      # 觸覺反饋工具
└── styles/
    └── MotionDetector.css      # 樣式文件
```

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| v0.1 | 2025-11-06 | 初始實現，完成核心功能 |
| v0.2 | 2025-11-06 | 修復等級卡在 2 的問題，修復無限振動 Bug |

---

## 聯繫與支援

如有問題或需要進一步的調整，請參考：
- 項目根目錄 `CLAUDE.md` 文件
- 提交 Issue 或 Pull Request
