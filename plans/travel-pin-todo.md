# Travel Pins 重建 TODO（依需求規格 + 先後順序）

> 目標：依據 plans/travel-pin-requirement.md 的「需求」在新環境重建功能。以下清單將工作拆解為可執行的任務與驗收點。

## Phase 0 — 規劃與基礎設置（起點）✅ DONE
- [✅T0.1] 選定地圖技術（直接使用 Mapbox GL JS，3D Globe 投影）
- [✅T0.2] 設定環境變數（VITE_MAPBOX_TOKEN 已存在於 .env.production）
- [✅T0.3] 建立 i18n 架構（travel_pins.* 鍵值已存在，可直接使用 React Intl）
- [✅T0.4] 規劃權限/登入流程（沿用既有 auth store 與 API 結構）
- [✅T0.5] 制定 z-index 與疊層規則（src/TravelPinsNew/utils/zIndex.js）

**完成摘要：**
- 建立目錄結構 `src/TravelPinsNew/{components,hooks,utils,stores}/`
- 使用 Zustand persist 模式處理 localStorage
- 更新執行指引加入技術規範

## Phase 1 — 資料模型與 API（先於地圖展示）✅ DONE
- [✅T1.1] 定義 Pin 資料模型（src/TravelPinsNew/utils/dataModels.js，含驗證與轉換）
- [✅T1.2] 確認 API 端點（沿用既有 src/APIs/travel-pins.js，功能完整）
- [✅T1.3] 決定深連結 URL 規格（`/travel-pins-new?pin=<id>`，src/TravelPinsNew/utils/urlUtils.js）
- [✅T1.4] 決定 Markdown→HTML 的安全策略（基於既有實作改良，加強 XSS 防護）

**完成摘要：**
- 資料驗證、URL 處理、安全的 Markdown 轉換
- API 整合 hooks 重新匯出，保持一致性

## Phase 2 — 地圖與鏡頭（基礎顯示）✅ DONE
- [✅T2.1] 初始化單一地圖實例（直接 mapboxgl，globe 投影，錯誤處理）
- [✅T2.2] 建立相機輔助（src/TravelPinsNew/utils/cameraHelpers.js）
- [✅T2.3] Mapbox 手勢控制（cooperative gestures 支援手機模式）
- [✅T2.4] 行動裝置垂直 padding（setPadding bottom: 100 於手機）

**完成摘要：**
- MapContainer 使用直接 mapboxgl（避免 react-map-gl 導入問題）
- 載入指示器、錯誤處理、手機手勢切換按鈕
- 地圖控制項：導航、定位
- 響應式處理與視窗調整

**變更注意事項：**
- 從 react-map-gl 改為直接 mapboxgl 以保持與現有代碼一致
- 手勢切換需重建地圖實例（mapbox 限制）
- TODO 註解標示後續 Phase 整合點

## Phase 3 — 釘點（Symbols / Markers）（先有 Pin 再談顯示）✅ DONE
- [✅T3.1] 依 pins 列表建立/更新/移除 Marker（useMarkerManager hook）
- [✅T3.2] Marker hover/click 視覺（scale 1.12, opacity 0.65）
- [✅T3.3] 螢幕距離顏色分配（簡化為 round-robin 色彩指派）
- [✅T3.4] DOM 就地更新 footprint（地圖移動時更新可見性）
- [✅T3.5] 地球背面遮蔽（簡化版半球遮蔽檢查）
- [✅T3.6] 安全移除（marker.remove() 與 Map 清理）

**完成摘要：**
- 採用 Mapbox SymbolLayer 呈現釘點（GeoJSON source + 基底層 + hover 層），GPU 直接遮擋背面，無初幀閃爍。
- `SymbolsManager` 管理釘點生命週期與互動；hover 以第二層 `setFilter()` 實現（避免在 layout 使用 feature-state）。
- footprint 圖示放大（base 1.3、hover 1.5），使用高對比色盤；螢幕鄰近分色，孤立點用 id 雜湊穩定挑色。
- 點擊事件已在 Phase 4 串接 Popup。

**變更注意事項：**
- 取代原 HTML Marker API；不再需要半球遮蔽與初幀時序控制邏輯。
- 不引用舊頁任何檔案，維持 TravelPinsNew 內聚。
- `renderWorldCopies: false` 避免世界拷貝重影。

**重構摘要：**
- **重新實作專屬工具**：建立 TravelPinsNew 目錄下的 palettes、footprintIcon、hemisphereCulling、colorManager、markdownUtils 等工具，避免依賴舊實作
- **保留必要複雜度**：根據需求確認，proximity color management 和 hemisphere culling 為必要功能，非過度設計
- **修復顏色管理時序問題**：移動 `assignColorsByScreen` 到標記建立之前
- **移除內建地圖控制項**：移除 NavigationControl 和 GeolocateControl 避免 touchmove passive event 警告
- **修復 Z_INDEX 匯出問題**：統一使用 Z_INDEX 而非 Z_INDEX_CSS

## Phase 4 — 顯示視窗（Display Popup）✅ DONE
- [✅T4.0] 更新需求文件，確認近距離標記需不同顏色（requirements.md）
- [✅T4.1] 建立 Popup HTML 結構（popupHtml.js）
- [✅T4.2] 建立 Popup 樣式系統（popupStyles.js）
- [✅T4.3] 建立 Popup Factory 與事件處理（popupFactory.js）
- [✅T4.4] 修復工具匯入錯誤（Z_INDEX_CSS → Z_INDEX）
- [✅T4.5] 圖層點擊整合 Popup（`SymbolsManager` 開關單一實例）
- [✅T4.6] 權限顯示/隱藏（登入/登出即時刷新 Popup 內容）
- [✅T4.7] 複製連結（含按鈕視覺回饋）
- [✅T4.8] 背景遮罩與聚焦效果（Overlay 以 portal 掛載於 map 容器；有 blur，不遮住 Popup）
- [✅T4.9] Pins 變動時即時更新已開啟 Popup 內容

**變更摘要：**
- Overlay 採 portal 渲染進地圖容器（同一 stacking context），並統一 z-index 於 `utils/zIndex.js`（POPUP 1400、OVERLAY 1200、MODAL 1600）。
- `.mapboxgl-popup` 的 z-index 由樣式以常數注入，確保永遠在 Overlay 之上；Overlay 使用 `backdrop-filter: blur(2px)` 只模糊地圖，不影響 Popup。
  - 依賴：T3.*、T1.4（Markdown 安全）

## Phase 5 — React Modals（表單/刪除/ESC/照片）
- [T5.1] 表單 Modal（Create/Edit）：欄位/驗證/送出/登入要求
- [T5.2] 刪除確認 Modal：摘要/確認/取消/刪除 API 同步
- [T5.3] ESC 確認 Modal：未存變更提示
- [T5.4] 照片 Modal：全螢幕檢視
- [T5.5] Overlay 與 scroll lock：開啟任一阻塞型 Modal 時鎖住背景
- [T5.6] Modal 開啟時停用地圖互動（關閉後恢復）
  - 依賴：T1.*、T2.*、T4.*

## Phase 6 — 背景遮罩與互動規則（跨元件）
- [T6.1] 規範 Overlay 顯示條件（阻塞型 Modal、或 Popup 開啟）
- [T6.2] 定義 Overlay 點擊行為（關閉/取消/不動作）
- [T6.3] 手機上 Overlay 吞掉滾動/手勢（避免觸發地圖）
  - 依賴：T5.*、T4.6

## Phase 7 — 深連結（Deep-link）
- [T7.1] Copy Link 構造 URL（Popup 內按鈕）
- [T7.2] 進頁辨識 `?pin=<id>`，等待對應 Marker
- [T7.3] 置中相機 `easeTo({ center })`，避免改變 zoom 觸發自動關閉
- [T7.4] `moveend`（或 timeout 後備）開啟對應顯示視窗
- [T7.5] 桌機/手機穩定性驗證
  - 依賴：T4.*、T3.*

## Phase 8 — 權限與登入（橫切需求）
- [T8.1] 未登入：建立/編輯/刪除需先登入或提示
- [T8.2] Popup 內按鈕依登入狀態顯示/隱藏
- [T8.3] 已登入可完整操作
  - 依賴：T1.*、T5.1/5.2、T4.*

## Phase 9 — 國際化（i18n）
- [T9.1] 文案抽離為多語 key（Popup、Modals、按鈕、錯誤訊息）
- [T9.2] 日期本地化格式（依語系顯示）
  - 依賴：T0.3

## Phase 10 — 非功能性（NFR）
- [ ] 性能：
  - [ ] 大量釘點時仍能流暢移動/縮放/開關視窗
  - [ ] 事件節流/防抖（move/zoom 回呼）
  - [ ] 僅更新必要 DOM（避免重建整棵）
- [ ] 行動裝置體驗：
  - [ ] 視窗內捲動不影響地圖
  - [ ] 地圖手勢與視窗手勢不衝突（必要時停用地圖互動）
- [ ] 可近用性（a11y）：
  - [ ] Modal 具 `role="dialog"`、可鍵盤操作與明確關閉方式
  - [ ] 圖片替代文字、按鈕可聚焦
- [ ] 安全：
  - [ ] 不儲存敏感資訊於前端
  - [ ] Markdown → HTML 有基本 XSS 防護

## Phase 11 — 驗收測試（Acceptance）
- [ ] 新增釘點後，無刷新立即出現在地圖
- [ ] 地球背面的釘點不顯示；旋轉至正面後可見
- [ ] 點釘點開啟顯示視窗；可複製連結、進入編輯、進入刪除、開啟照片
- [ ] 開啟任一阻塞型 Modal 時，背景不可互動；關閉後恢復
- [ ] 造訪 `/travel-pins-new?pin=<id>` 時，地圖置中到該點並自動開啟顯示視窗
- [ ] 未登入時，建立/編輯/刪除會被阻擋且有明確提示/登入引導
- [ ] i18n 文案與日期格式正確
- [ ] 在桌機與行動裝置上均表現穩定

---
### 執行順序建議（摘要）
1) Phase 0 → 1（基礎 + 資料）
2) Phase 2（地圖）
3) Phase 3（Marker）
4) Phase 4（Display Popup）
5) Phase 5（各類 Modal + Overlay/互動停用）
6) Phase 6（Overlay 細節與手機手勢）
7) Phase 7（Deep-link）
8) Phase 8（權限）
9) Phase 9（i18n 完整化）
10) Phase 10（NFR 優化）
11) Phase 11（驗收測試）

---
> 註：此 TODO 專注在「需求」層級，不綁定現有實作；實作時可按新技術棧調整細節，但需滿足需求與驗收條目。
