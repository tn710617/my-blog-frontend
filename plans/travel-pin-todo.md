# Travel Pins 重建 TODO（依需求規格 + 先後順序）

> 目標：依據 plans/travel-pin-requirement.md 的「需求」在新環境重建功能。以下清單將工作拆解為可執行的任務與驗收點。

## Phase 0 — 規劃與基礎設置（起點）
- [T0.1] 選定地圖技術（Mapbox GL JS 或等價 3D/Globe 能力）
- [T0.2] 設定環境變數（地圖 Token、API Base URL 等）
- [T0.3] 建立 i18n 架構（至少支援現有語言與日期本地化）
- [T0.4] 規劃權限/登入流程（未登入時的指引與阻擋策略）
- [T0.5] 制定 z-index 與疊層規則（地圖、標記、Popup、Overlay、Modal、手勢告警）

## Phase 1 — 資料模型與 API（先於地圖展示）
- [T1.1] 定義 Pin 資料模型（id、title、note、visited_at、coordinates、photo_url、photos）
- [T1.2] 確認/設計 API 端點（CRUD、列表、單筆）
- [T1.3] 決定深連結 URL 規格 `/travel-pins?pin=<id>`（或等價路徑）
- [T1.4] 決定 Markdown→HTML 的安全策略（XSS 過濾/白名單）
  - 依賴：T0.2、T0.3

## Phase 2 — 地圖與鏡頭（基礎顯示）
- [T2.1] 初始化單一地圖實例（cooperative gestures、locale、錯誤處理）
- [T2.2] 建立相機輔助：`flyTo(center, zoom, duration)`、`easeTo({center, duration})`、`getZoom()`
- [T2.3] 偵測並處理 Mapbox 手勢教學/警示（教學期間禁止標記 hover/click）
- [T2.4] 行動裝置垂直 padding（`setPadding`）讓地球視覺上移
  - 依賴：T0.*

## Phase 3 — 釘點（Markers）（先有 Pin 再談顯示）
- [T3.1] 依 pins 列表建立/更新/移除 Marker
- [T3.2] Marker hover/click 視覺
- [T3.3] 螢幕距離顏色分配 `assignColorsByScreen`
- [T3.4] DOM 就地更新 footprint `recolorMarkers`（move/zoom 時）
- [T3.5] 地球背面遮蔽（Occlusion）
- [T3.6] 安全移除（刪除 pin 後移除 Marker/Popup）
  - 依賴：T1.*、T2.*

## Phase 4 — 顯示視窗（Display Popup）
- [T4.1] 建立 Popup 並綁定 Marker（標題/日期/備註/照片/附件）
- [T4.2] 互動：Copy Link（`/travel-pins?pin=<id>`）
- [T4.3] 互動：Edit → 觸發編輯 Modal
- [T4.4] 互動：Delete → 觸發刪除確認 Modal
- [T4.5] 互動：點照片 → 開啟照片 Modal
- [T4.6] `open/close` 回報管理層（互斥/遮罩控制）
- [T4.7] pins 變動時更新已開啟 Popup 內容（避免重建）
- [T4.8] 樣式覆寫（命名空間選擇器，避免汙染）
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
