# Travel Pins 新版實作執行指引（Executor Guideline）

本指引用於在新目錄重建 Travel Pins 功能時的執行流程與品質規範，避免重工與技術債。

## 文件依據（必讀）
- 需求：`plans/travel-pin-requirement.md`
- 待辦：`plans/travel-pin-todo.md`

實作任何任務前，先對照以上兩份文件，確認需求與優先順序（Phase 與任務依賴）。

## 範圍限制（Scope）
- 新實作僅放在：`src/TravelPinsNew/`（可建立子資料夾：`Map/`, `Markers/`, `Popups/`, `Modals/`, `utils/` 等）。
- 可共用：
  - `src/APIs/*`（資料 API）。
  - 登入/登出相關 store（auth）與語系/在地化相關 store（locale/i18n），可直接引用既有實作，不需重複撰寫。
- 不直接引用：舊實作（`src/Pages/TravelPins/*`）的其它程式碼；若需沿用邏輯，請在新目錄以更乾淨的方式重寫（目標：重構並移除不必要的技術債）。

## 工作流程（每次實作必遵循）
1) 檢視進度與挑選任務
- 依 `plans/travel-pin-todo.md` 的 Phase 與依賴關係挑選下一個任務（T 編號）。
- 確認當前代碼中是否已有類似功能或半成品，必要時先重構/整合，避免重複實作與產生 duplicate code。

2) 設計與落檔
- 以需求為準（對照 `requirement.md` 的對應章節）。
- 僅在 `src/TravelPinsNew/` 內新增/更改程式碼；必要的共用工具，請在新目錄內建立對應的 `utils/`，而不是引用舊頁的 utils。

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
