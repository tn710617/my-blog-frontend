# Travel Pins 新版實作執行指引（Executor Guideline）

本指引用於在新目錄重建 Travel Pins 功能時的執行流程與品質規範，避免重工與技術債。

## 文件依據（必讀）
- 需求：`plans/travel-pin-requirement.md`
- 待辦：`plans/travel-pin-todo.md`

實作任何任務前，先對照以上兩份文件，確認需求與優先順序（Phase 與任務依賴）。

## 範圍限制（Scope）
- 新實作僅放在：`src/Pages/TravelPinsNew/`（可建立子資料夾：`components/`, `hooks/`, `utils/`, `stores/` 等）。
- 可共用：
  - `src/APIs/*`（資料 API）。
  - `src/Components/*`（通用 UI 組件，如 Modal、Button 等）。
  - 登入/登出相關 store（auth）與語系/在地化相關 store（locale/i18n），可直接引用既有實作，不需重複撰寫。
- 不直接引用：舊實作（`src/Pages/TravelPins/*`）的其它程式碼；若需沿用邏輯，請在新目錄以更乾淨的方式重寫（目標：重構並移除不必要的技術債）。
- 不直接 import 舊頁的任何功能，包含 utils、hooks、components 等。
- **審視必要性原則**：參考舊實作前，先質疑功能是否必要或過度設計。優先實作 MVP 功能，避免直接複製複雜邏輯。

### 目錄結構規劃
```
src/Pages/TravelPinsNew/
├── index.jsx                 # 主要頁面組件
├── components/              # 頁面專用組件
│   ├── Map/                # 地圖相關組件
│   ├── Symbols/            # SymbolLayer 相關組件（取代 HTML Markers）
│   ├── Popups/             # 彈出視窗組件
│   └── Modals/             # 模態窗組件
├── hooks/                   # 頁面專用 hooks
├── utils/                   # 頁面專用工具函數
└── stores/                  # 頁面專用狀態管理
```

### 依賴重構考量（Dependency Refactoring）
移動到 `src/Pages/TravelPinsNew/` 後需要處理的依賴關係：

1. **路由整合**：
   - 更新 `src/App.js` 或路由配置，將新頁面整合到現有路由系統
   - 遵循現有 Pages 目錄的路由模式（參考其他頁面如何註冊路由）

2. **Import 路徑調整**：
   - 所有對新頁面的 import 需要更新為 `src/Pages/TravelPinsNew`
   - 內部組件的相對路徑需要重新檢查（如 `./components/Map` 等）

3. **共用組件整合**：
   - 檢查是否可以使用 `src/Components/*` 中現有的通用組件
   - 如 Modal、Button、Loading 等，避免重複實作

4. **狀態管理整合**：
   - 檢查是否需要與現有的全域 stores（如 `src/stores/*`）整合
   - 頁面專用的 stores 放在 `src/Pages/TravelPinsNew/stores/`

5. **API 整合**：
   - 確認 `src/APIs/*` 中的 API 函數是否足夠，或需要新增 travel-pins 相關的 API

6. **測試文件**：
   - 如果有測試文件，需要更新測試中的 import 路徑

## 工作流程（每次實作必遵循）
1) 檢視進度與挑選任務
- 依 `plans/travel-pin-todo.md` 的 Phase 與依賴關係挑選下一個任務（T 編號）。
- 確認當前代碼中是否已有類似功能或半成品，必要時先重構/整合，避免重複實作與產生 duplicate code。

2) 設計與落檔
- 以需求為準（對照 `requirement.md` 的對應章節）。
- 僅在 `src/Pages/TravelPinsNew/` 內新增/更改程式碼；必要的共用工具，請在新目錄內建立對應的 `utils/`，而不是引用舊頁的 utils。

3) 開發與標記進度
- 開發過程中，於 TODO 檔案將對應任務標記為 In Progress（可於項目前加入 `(in-progress)` 或小節備註）。
- 實作完成後，將該項標記為 Done，並在同一小節下追加「變更摘要」與「注意事項」。

4) 提交（Commit，手動）
- 注意：本流程不會自動執行 git commit；請由執行者「手動」提交。
- 提交時仍建議採用 Conventional Commits，訊息內帶上任務代號（例如：`feat(travel-pins-new): T3.1 建立 Marker 生命週期`）。

5) 重新啟動容器（Docker）
- 完成一個任務後，請重新啟動開發容器，讓環境乾淨載入變更：
  - Docker Compose：`docker-compose restart app`
  - 或新版：`docker compose restart app`
- 若非容器環境，請重啟本地開發伺服器（例如 `yarn start` 所啟動的進程）。

6) 提示驗收（手動測試）
- 每次完成任務後，在 PR 或提交說明中，附上「手動驗收建議項目」，對照 `requirement.md` 與該任務的驗收條目。例如：
  - 地圖初始化：是否能正常載入、錯誤處理是否友善。
  - 釘點顯示：新增後是否立即出現；背面是否隱藏。
  - 顯示視窗：開關是否正常、按鈕行為（複製連結/編輯/刪除/看圖）。
  - 深連結：`?pin=<id>` 是否能定位並自動開窗（桌機/手機皆正常）。
  - 阻塞型 Modal：開啟期間背景不可操作；關閉後恢復。
- 注意：依需求，完成後「不需」執行自動化測試，但請提供手動驗收清單。

## 品質規範（Quality Gate）
- 不重複：新代碼不得與舊頁功能並存重複；若發現類似邏輯，採「取代/重構」而非複製。
- 可讀性：分層清楚（Map、Markers、Popups、Modals、utils），避免巨型檔案。
- 防偶發錯誤：對非同步與事件競態採取穩健策略（等待資源就緒、加上 fallback）。
- i18n：文字使用多語 key；日期採在地化格式。
- 權限：受限操作（新建/編輯/刪除）需檢查登入狀態並導向登入或提示。
- 安全：Markdown→HTML 需經基本防護；不在前端存敏感資訊。

## 技術規範（Technical Guidelines）
- **狀態管理**：使用 Zustand 配合 persist 中間件處理 localStorage，遵循現有專案模式。
  - 僅持久化用戶偏好設定（如手勢模式），不持久化運行狀態（如地圖實例、錯誤狀態）。
  - 使用 `partialize` 選擇需持久化的狀態欄位。
- **共用資源**：可直接引用 `src/APIs/*`、`src/stores/*` 中的 auth 與 locale 相關功能。
- **環境變數**：Mapbox Token 已配置於 `.env.production`，使用 `VITE_MAPBOX_TOKEN`。
- **i18n 鍵值**：travel_pins.* 相關的多語言鍵值已存在，可直接使用。

### SymbolLayer 實作要點（新版技術路線）
本頁 Travel Pins New 採用 Mapbox SymbolLayer 呈現釘點，完全取代 HTML Marker，解決 globe 下初載入背面閃爍問題。

- 基本結構：
  - `GeoJSON source`：包含所有 pin 作為 Point features，feature.id 對應 pin.id。
  - `symbol layer`（基底層）：`icon-image` 來自 feature.properties.icon，固定 `icon-size` 與 `icon-opacity`。
  - `symbol layer`（hover 層）：放大版且半透明，只顯示當前 hover feature，透過 `setFilter()` 切換目標。
  - 檔案：`src/Pages/TravelPinsNew/components/SymbolsManager.jsx`。

- 顏色與圖示：
  - 啟動時預載多款高對比 footprint 圖示（data URL），命名如 `fp-contrast-<idx>`。
  - 視圖改變時，使用 `assignColorsByScreen()` 依螢幕鄰近分配顏色索引；若為孤立點則用 `id` 雜湊成穩定索引。
  - 以 `source.setData()` 更新 features 的 `properties.icon`（注意：`icon-image` 屬於 layout，不能用 feature-state）。

- 互動與事件：
  - hover：在基底層與 hover 層上綁定 `mousemove`/`mouseleave`，以 `setFilter()` 切換 hover 層顯示的 id。
  - click：在圖層上綁定 `click` 事件以開啟 popup（後續接入 popupFactory）。
  - 注意：清理時先移除 hover 層再移除基底層，再移除 source，避免依賴錯誤。

- 對比與可讀性：
  - 改用高飽和對比色（藍/紅/綠/琥珀/紫/青/玫紅），並放大 `icon-size`（基底 1.3、hover 1.5）。
  - 如需更強對比，可：
    - 方案 A（建議）使用 SDF 圖示，配合 `icon-color` 與 `icon-halo-*` 加粗白色描邊。
    - 方案 B 新增 `circle` 背景層（白色/深色半透明）形成「泡泡」背景。

- 不再需要的邏輯：
  - HTML Marker 半球遮蔽與初幀時序控制邏輯（`isBehindGlobe`、初幀隱藏/顯示）均可移除於新路線。

### 效能與穩定性建議（新增）
- 視圖事件節流：`move/zoom/rotate/pitch` 事件觸發頻繁，`assignColorsByScreen` + `setData` 建議加 16–32ms 節流。
- 來源更新策略：若 pin 數量大，可僅更新變動 features（拆分 source 或以多層處理）。
- 佈局順序：以 `beforeId` 插入圖層，確保位於底圖標籤之上、彈窗之下（必要時統一在 MapContainer 新增輔助常數）。
- 圖示載入回退：`addImage` 失敗時忽略錯誤但保留重試機制（可加載入旗標避免重複呼叫）。

### 手動驗收清單（SymbolLayer 版，新增）
- 載入：背面釘點不出現；無任何初載入閃爍。
- 互動：滑過放大且半透明；點擊能觸發事件（後續接 popup）。
- 視圖：拖曳/縮放/旋轉/傾斜後，顏色分配能更新，鄰近點不會同色重疊。
- 顯示：各 zoom 下圖示大小與清晰度可接受；顏色與地圖背景對比足夠。
- 穩定：快速拖曳下不報錯、不掉圖示（重載圖示/節流機制正常）。

## 常見情境對照（範例）
- 完成「T3.1 建立/更新/移除 Marker」後：
  - 更新 TODO：T3.1 → Done，附上「支援新增/刪除即時反映」等摘要。
  - 重啟容器：`docker compose restart app`。
  - 驗收建議：新增 Pin 是否立即顯示；刪除 Pin 是否從地圖移除；移動/縮放後顏色重算是否生效。

- 完成「T7 深連結」後：
  - 更新 TODO：T7.* → Done（列出 `?pin=<id>` 成功率、手機/桌機觀察）。
  - 重啟容器：`docker compose restart app`。
  - 驗收建議：重載帶參數 URL，是否置中與自動開窗；搬動鏡頭是否不會立即關閉視窗（符合需求）。

## 注意事項
- 任何時候若發現已存在的類似功能，可先重構或合併，避免兩套並行造成維護成本與技術債。
- 若需求與 TODO 有出入，以 `requirement.md` 為準，並提 PR 補齊 TODO。
- 多人協作時，請在 TODO 中鎖定你要做的項目（加上 Assignee/日期），避免撞車。
