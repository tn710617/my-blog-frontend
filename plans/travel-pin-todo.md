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
- [✅T5.1] 表單 Modal（Create/Edit）：欄位/驗證/送出/登入要求
- [✅T5.2] 刪除確認 Modal：摘要/確認/取消/刪除 API 同步
- [✅T5.3] ESC 確認 Modal：未存變更提示
- [✅T5.4] 照片 Modal：全螢幕檢視
- [✅T5.5] Overlay 與 scroll lock：開啟任一阻塞型 Modal 時鎖住背景
- [⏭T5.6] Modal 開啟時停用地圖互動（關閉後恢復）— 延到最後（Overlay 已足夠攔截）

**完成摘要（新增）**
- 集中 ESC 處理：新增 `useKeyboardHandlers` 於頁面層集中管理 ESC，避免分散在 Overlay/其他處造成競態。
- ESC 行為矩陣：
  - delete modal：ESC 視同取消 → 關閉 delete modal → 回到 display popup（延遲一個 tick 重開，避開 key 事件競態）。
  - photo modal：ESC 僅關閉 photo modal → 回到 display popup（使用 openDisplayPopup），保持一致行為。
  - form（Edit）modal：
    - 無變更：ESC 關閉 form → 回到 display popup。
    - 有變更：ESC 開啟 EscConfirmModal（未儲存確認）；
      - 取消/ESC：關閉確認 → 回 edit modal，並保留草稿。
      - 放棄變更：關閉確認 → 回 display popup。
  - display popup：ESC 關閉 display popup 與 overlay。
- Overlay 行為：維持 blur 與攔截互動；顯示期間暫停 Mapbox 互動（keyboard/drag/zoom/touch 等），關閉時恢復。
- Edit 草稿暫存：利用 `useModalStore.modalData.draft` 保留使用者輸入，從 EscConfirm 取消/ESC 返回 edit modal 時欄位不丟失。

**補充（行為細化）**
- EscConfirm 內嵌於表單：不再使用獨立 `esc-confirm` modal；activeModal 維持 `form`，以 `modalData.confirmOpen` 控制確認層顯示。
- 鍵盤：`form + confirmOpen` 時 ESC 視為「取消確認」→ 只關確認層，不關表單；`form + dirty` 時第一次 ESC 開確認層；`form + 非 dirty` 時 ESC 關表單並回 popup。
- Overlay 點擊：`form + confirmOpen` 僅關確認層；`delete` 回 popup；`photo` 關自身；`display` 關 popup。
- 預設欄位：visited_at 預設當天（yyyy-mm-dd）；送出時若空自動補今日。
- 座標欄位：Create 送出使用 `draft.coordinates`；Update 使用 `pin.coordinates`；在表單編輯期間會保留 `draft.coordinates` 不被覆蓋。
  - 依賴：T1.*、T2.*、T4.*

## Phase 6 — 背景遮罩與互動規則（跨元件）✅ DONE
- [✅T6.1] 規範 Overlay 顯示條件（阻塞型 Modal、或 Popup 開啟）
- [✅T6.2] 定義 Overlay 點擊行為（關閉/取消/不動作）
- [✅T6.3] 手機上 Overlay 吞掉滾動/手勢（避免觸發地圖）
  - 依賴：T5.*、T4.6

**完成摘要：**
- Overlay 顯示條件：透過 `hasAnyModalOpen()` 判斷，包含所有阻塞型 modal 與 display popup
- 點擊行為矩陣：delete modal 返回 display popup；form + confirmOpen 僅關確認層；photo modal 關閉保留 display popup；其他關閉 popup + modal
- 手機互動攔截：scroll lock (`overflow: hidden`) + 停用所有 Mapbox 互動 (keyboard/dragPan/scrollZoom/boxZoom/doubleClickZoom/touchZoomRotate/dragRotate)
- Portal 渲染：掛載至地圖容器保持 stacking context 一致；backdrop-filter 模糊地圖但不影響 popup (z-index 分層)

**實作位置：**
- `src/Pages/TravelPinsNew/components/BackgroundOverlay.jsx`：完整 overlay 邏輯與互動處理
- `src/Pages/TravelPinsNew/stores/modalStore.js`：modal 狀態管理與 `hasAnyModalOpen()` 判斷
- `src/Pages/TravelPinsNew/utils/displayPopupController.js`：跨元件 popup 開關控制

## Phase 7 — 深連結（Deep-link）✅ DONE
- [✅T7.1] Copy Link 構造 URL（Popup 內按鈕）
- [✅T7.2] 進頁辨識 `?pin=<id>`
- [✅T7.3] 置中相機 `easeTo({ center })`（設定合適 zoom）
- [✅T7.4] `moveend`（或 timeout 後備）自動開啟顯示視窗
- [✅T7.5] 桌機/手機穩定性驗證
  - 依賴：T4.*、T3.*

**完成摘要：**
- URL 解析：`getPinIdFromUrl()` 從 URL 參數解析 pin ID，支援數字與字母數字格式
- 相機定位：`easeTo({ center, zoom })` 平滑移動至目標位置，zoom 至少 4.5 確保可見性
- 自動開啟 popup：`moveend` 事件觸發 + 950ms timeout 後備，修復競態條件（`popupOpened` 旗標避免重複開啟）
- 穩定性：支援桌機/手機，尊重既有 mobile padding 設置，無需額外 padding 處理
- 錯誤處理：多層 try-catch 確保任何步驟失敗都有後備處理

**實作位置：**
- `src/Pages/TravelPinsNew/utils/urlUtils.js`：URL 生成、解析、剪貼簿複製
- `src/Pages/TravelPinsNew/components/SymbolsManager.jsx:350-377`：深連結觸發與 popup 開啟邏輯

## Phase 8 — 權限與登入（橫切需求）✅ DONE
- [✅T8.1] 未登入：建立/編輯/刪除需先登入或提示
- [✅T8.2] Popup 內按鈕依登入狀態顯示/隱藏
- [✅T8.3] 已登入可完整操作
  - 依賴：T1.*、T5.1/5.2、T4.*

**完成摘要：**
- 建立釘點權限：地圖背景點擊時檢查 `isLoggedIn`，未登入顯示登入 Modal (`setShowLoginModal(true)`)
- 編輯/刪除權限：Popup 按鈕基於 `isLoggedIn` 條件渲染，未登入時完全隱藏
- 登入狀態整合：使用 `useAuthStore((s) => s.isLoggedIn)` 與既有認證系統整合
- 權限一致性：所有需要權限的操作 (create/edit/delete) 都有適當的登入檢查

**實作位置：**
- `src/Pages/TravelPinsNew/components/SymbolsManager.jsx:289-292`：地圖點擊創建釘點的登入檢查
- `src/Pages/TravelPinsNew/utils/popupHtml.js:43-59`：編輯/刪除按鈕的條件渲染
- `src/Pages/TravelPinsNew/components/SymbolsManager.jsx:123-124`：認證狀態與登入 Modal 整合

## Phase 9 — 國際化（i18n）✅ DONE
- [✅T9.1] 文案抽離為多語 key（Popup、Modals、按鈕、錯誤訊息）
- [✅T9.2] 日期本地化格式（依語系顯示）
  - 依賴：T0.3

**完成摘要：**
- 文案完整國際化：所有 UI 文字使用 `travel_pins.*` 翻譯鍵值，涵蓋 popup、modals、按鈕、錯誤訊息
- 翻譯鍵對齊：修復 popup HTML 使用的鍵值，新增 `travel_pins.popup.copy_link` 鍵（EN/ZH-TW）
- 日期本地化：使用 `toLocaleDateString()` 自動根據瀏覽器/使用者語系格式化日期
- React Intl 整合：已整合 `useIntl` hook，支援完整的 i18n 生態系統
- 雙語支援：完整的英文 (en.json) 與繁體中文 (zh-TW.json) 翻譯

**實作位置：**
- `src/locales/en.json`：英文翻譯（89-150 行 travel_pins 相關鍵值）
- `src/locales/zh-TW.json`：中文翻譯（90-151 行 travel_pins 相關鍵值）
- `src/Pages/TravelPinsNew/utils/popupHtml.js`：popup 文字國際化
- `src/Pages/TravelPinsNew/components/Modals/EditPinModal.jsx`：編輯表單完整國際化
- `src/Pages/TravelPinsNew/components/Modals/DeleteConfirmationModal.jsx`：刪除確認對話框國際化
- `src/Pages/TravelPinsNew/components/Modals/EscConfirmModal.jsx`：未儲存變更確認對話框國際化
- `src/Pages/TravelPinsNew/components/MobileGestureToggle.jsx`：React Intl 整合範例

**修復項目（補完）：**
- 新增 `travel_pins.popup.copy_link` 翻譯鍵（EN/ZH-TW）
- 修復 popup HTML 使用正確的翻譯鍵（`travel_pins.popup.edit_button`, `delete_button`）
- 移除所有 modal 中的硬編碼中文文字，改用 `intl.formatMessage()` 
- popup 中 "Notes" 改用 `travel_pins.popup.travel_notes` 翻譯鍵
- **修復顯示彈出窗口按鈕翻譯問題（2024-12-19）：**
  - 問題：SymbolsManager 使用回退翻譯函數 `t = (key) => key` 導致按鈕顯示原始鍵值
  - 解決：在 SymbolsManager 中導入 `useIntl` hook，建立正確的翻譯函數 `t` 和 `formatDate`
  - 修復：硬編碼的 "Photo" 和 "Copied!" 文字改用翻譯鍵 `travel_pins.popup.photo` 和 `travel_pins.popup.copied`
  - 結果：所有 popup 按鈕現在正確顯示本地化文字 (Copy Link/複製連結, Edit/編輯, Delete/刪除)

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
## Phase 12 — 清理與移除舊路線 ✅ DONE
- [✅] 移除 HTML Marker 路線相關檔案（已改為 SymbolLayer）：
  - `src/Pages/TravelPinsNew/components/MarkersManager.jsx`
  - `src/Pages/TravelPinsNew/hooks/useMarkerManager.js`
  - `src/Pages/TravelPinsNew/utils/markerUtils.js`
  - `src/Pages/TravelPinsNew/utils/hemisphereCulling.js`
  - `src/Pages/TravelPinsNew/utils/footprintIcon.js`
- [✅] 調整 `colorManager.js`：保留 `assignColorsByScreen`/`getColorAssignment`/`createColorAssignmentRef`，移除僅供 HTML Marker 使用的 `recolorMarkers`
- [✅] 統一 z-index 常數並套用：`utils/zIndex.js`（POPUP 1400／OVERLAY 1200／MODAL 1600），`popupStyles.js` 直接引用常數
- [✅] Overlay 以 portal 掛載至地圖容器（同一 stacking context），使用 `backdrop-filter: blur(2px)`，不遮擋 Popup

## Phase 13 — 搜尋功能（地名/座標）✅ DONE
- [✅T13.1] 複用現有搜尋組件，整合至 TravelPinsNew 頁面：
  - 修改 NavBar 邏輯：當頁面為 `travel-pins-new` 時顯示 `TravelPinsSearchBar` 
  - 保持組件位置在 `src/Components/Nav/TravelPinsSearchBar.jsx`（沿用現有架構）
  - 創建 `useLocationListener` hook 處理地圖導航整合
  - 修改 `onLocationSelect` 回調，透過 CustomEvent 支援 TravelPinsNew 地圖實例
  - 樣式與位置完全沿用現有 TravelPins 設定
- [✅T13.2] 地名搜尋功能驗證：現有 Mapbox Geocoding API 功能完整運作
- [✅T13.3] 座標搜尋解析功能：
  - 支援多種格式：`lng,lat` / `lat,lng`（逗號、空白分隔）
  - 智慧判斷座標順序（基於數值範圍：|num1| > 90 視為經度）
  - 座標驗證：lat (-90~90), lng (-180~180)
  - 特殊圖示顯示：🎯 for coordinates, 🌍 for countries, 📍 for places
  - **座標搜尋使用街道級別 zoom (15)**，地名搜尋保持原有層級
- [✅T13.5] 快捷鍵整合：
  - 評估複雜度：TravelPinsSearchBar 邏輯簡單，沿用現有實作
  - 解決 ESC 處理衝突：在 TravelPinsNew useKeyboardHandlers 中添加搜尋框特例處理
  - 添加搜尋框 id="location-search-input" 支援既有邏輯
  - 保持 Ctrl/Cmd+F 聚焦功能正常運作

**完成摘要：**
- ✅ 地名搜尋：完整的 Mapbox Geocoding 整合，支援國家/城市搜尋
- ✅ 座標搜尋：支援多格式座標輸入，自動解析並導航到街道級別視圖 (zoom: 15)
- ✅ 智慧 Zoom：座標搜尋→街道級別，國家搜尋→國家級別，城市搜尋→城市級別  
- ✅ 快捷鍵協調：Ctrl/Cmd+F 聚焦、ESC 處理不衝突、↑↓ Enter 鍵盤導航
- ✅ UI 一致性：保持現有設計語言，座標結果顯示特殊圖示和標題

**實作位置：**
- `src/Components/Nav/index.jsx`：NavBar 路徑判斷邏輯更新
- `src/Components/Nav/TravelPinsSearchBar.jsx`：座標解析功能、UI 更新
- `src/Pages/TravelPinsNew/hooks/useLocationListener.js`：地圖導航整合
- `src/Pages/TravelPinsNew/hooks/useKeyboardHandlers.js`：ESC 衝突解決
- `src/Pages/TravelPinsNew/index.jsx`：hook 整合

**實作決策：**
- ✅ 複用現有 `TravelPinsSearchBar` 組件（功能完整、UI 現代化）
- ✅ 保持在 `src/Components/Nav/` 位置（符合通用 UI 組件原則）
- ❌ 不實作搜尋歷史功能（localStorage）
- ❌ 不整合 GPS 定位按鈕（將於 Phase 14 獨立實作）
- ✅ 舊版 travel-pins 頁面將被移除，最終邏輯僅需支援 travel-pins-new

**依賴：** Phase 2（地圖實例）、現有 NavBar 架構

## Phase 14 — 工具與動作（定位/控制）✅ DONE
- [✅T14.1] 取得使用者位置按鈕（定位成功置中、失敗提示錯誤）
- [✅T14.2] 定位時顯示 loading 與錯誤 UI（如權限拒絕/逾時）
- [✅T14.3] 搜尋/定位與 SymbolLayer 不互斥（維持 hover/click）

**完成摘要：**
- GPS 定位按鈕：位於右下角 (`fixed bottom-6 right-6`)，64x64px 圓形設計
- 定位狀態顯示：loading 動畫 (琥珀色脈衝效果)、成功 (綠色漸層)、錯誤 toast (紅色通知)
- 位置精度：街道級別 zoom (15)，平滑 flyTo 動畫 2.5s
- 錯誤處理：權限拒絕/逾時/服務不可用等完整錯誤訊息與手動清除機制
- 手勢切換按鈕：移動至左下角 (`fixed bottom-6 left-6`)，採用舊實作的精緻設計風格
- 完整國際化：所有按鈕文字、錯誤訊息、提示文字支援 EN/ZH-TW
- 地圖容器優化：移除內容確保 Mapbox GL JS 最佳互動性，加入 WebGL 支援檢測

**變更摘要（Phase 14 完成時）：**
- **按鈕布局優化**：MobileGestureToggle 移動至左下角，採用舊實作一致的視覺設計
- **地圖容器清理**：移除所有內容避免 Mapbox GL JS 互動干擾，加入 WebGL 支援檢測
- **定位功能完整**：GPS 按鈕功能完備，包含錯誤處理、動畫效果、國際化支援

**實作位置：**
- `src/Pages/TravelPinsNew/components/LocationButton.jsx`：GPS 定位按鈕完整實作
- `src/Pages/TravelPinsNew/components/MobileGestureToggle.jsx`：手勢切換按鈕位置與樣式更新
- `src/Pages/TravelPinsNew/components/MapContainer.jsx`：地圖容器優化與 WebGL 檢測
- `src/Pages/TravelPinsNew/hooks/useGeolocation.js`：定位邏輯 hook
- `src/Pages/TravelPinsNew/index.jsx`：組件整合與事件處理

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

---
### 備註（Overlay 互動行為現況）
- 目前 Overlay 以 portal 掛載於地圖容器上層，會攔截滑鼠/觸控/滾輪事件，足以確保「無法與地圖互動」。
- Popup 的 z-index 高於 Overlay，確保不被遮擋或模糊，互動正常。
- 可選加強（選擇性，最後階段再做）：在 Overlay 顯示時呼叫下列 API 暫停地圖互動，關閉時恢復：
  - `map.dragPan.disable()/enable()`、`map.scrollZoom.disable()/enable()`、`map.boxZoom.disable()/enable()`、`map.keyboard.disable()/enable()`、`map.doubleClickZoom.disable()/enable()`、`map.touchZoomRotate.disable()/enable()`。
