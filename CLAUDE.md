# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 這是什麼

個人部落格 + 旅遊地圖標記（travel-pins）的前端，是純 client，所有資料來自獨立的 Laravel 後端（見 `../my-blog-backend`）。**Vite 7 + React 19** 單頁應用，套件管理用 **Yarn**，Node `20.11.1`（`.nvmrc`；`package.json` engines 要求 `>=18.9.0`）。

> 注意：建置工具是 **Vite，不是 Create React App**；測試是 **Vitest，不是 Jest**。請以 `package.json` 的 scripts 為準。

## 常用指令

```bash
yarn dev               # 開發伺服器（vite --mode development），:3000
yarn build             # 一般 build → 輸出到 build/
yarn build-production  # 正式 build（vite build --mode production）
yarn test              # 跑測試（vitest run --config vite.config.js，搭配 MSW）
yarn lint              # eslint，掃 src 下 .js/.jsx/.ts/.tsx
yarn preview           # 預覽 build 產物
yarn deploy            # 執行 scripts/deploy.sh 部署
```

單一測試檔：`yarn test <path/to/file.test.js>`。

### Docker

`docker-compose.yml` 的 service 名為 `app`（node:22-alpine，port 3000，原始碼掛載做熱重載）。它的 `env_file` 實際載入 **`.env.development`**（內含 `VITE_API_URL=http://localhost/api`）。`host.docker.internal` 只寫在 `.env.docker.template`；若要讓容器連到 host 上的後端，需自行把該 template 複製成 `.env.local` 並改用 `host.docker.internal`。`docker-compose.yml` 雖宣告了 `extra_hosts: host.docker.internal:host-gateway`，但預設啟動仍是 localhost 版。

## 環境變數（皆為 `VITE_` 前綴）

| 變數 | dev (`.env.development`) | production (`.env.production`) | 用途 |
|---|---|---|---|
| `VITE_API_URL` | `http://localhost/api` | `https://blog-api.learn-or-die.com/api` | 後端 API base |
| `VITE_API_VERSION` | `v1` | `v1` | API 版本路由段 |
| `VITE_ENV` | `local` | `production` | 環境識別 |
| `VITE_DOMAIN` | `localhost:3000` | `blog.learn-or-die.com` | 前端網域 |
| `VITE_MAPBOX_TOKEN` | （有值） | （有值） | Mapbox GL token |
| `VITE_WC_PROJECT_ID` | （有值） | （有值） | WalletConnect 專案 ID（無則行動端登入會丟錯） |
| `VITE_CHAIN_ID` | `1` | `1` | 以太坊主網 |
| `VITE_GA_ID` | 空 | `G-…` | Google Analytics |
| `VITE_DEBUG_TRAVEL_PINS` | `1` | — | travel-pins debug |

API 實際 base URL 在 `src/APIs/axios.js` 組成：`${VITE_API_URL}/${VITE_API_VERSION}`（如 `http://localhost/api/v1`）。

## 架構

### 進入點與 Provider 疊層
`src/main.jsx`：`QueryClientProvider`（react-query，預設 `retry:false`）→ `BrowserRouter`（React Router v7，啟用 future flags）→ `SetLocale`（react-intl `IntlProvider`）→ `App`。DEV 下掛 `ReactQueryDevtools`。

### 路由（`src/App.jsx`）
所有頁面巢狀在 `Layout` 下：

- 公開：`/`（Posts 首頁）、`/about`、`/single-post`、`/travel-pins-new`、`/demo/css-position`、`*`（fallback 回 Posts）。
- 受保護（包在 `ProtectedRoute`）：`/create-post`、`/edit-post`、`/motion-detector`。

`ProtectedRoute` 先看 `useAuthStore` 的登入狀態，未登入則導回 `/` 並開登入彈窗。`Layout` 內含 `Nav`、`Outlet`、`Footer`、`Toaster`(react-hot-toast)、`CheckLogin`、`LoginModal`。

### 目錄
- `src/APIs/` —— 依 domain 分檔的 react-query hooks：`auth.js`、`posts.js`、`categories.js`、`tags.js`、`travel-pins.js`、`motionAudios.js`；底層 `axios.js`（base URL、`withCredentials:true`、XSRF cookie 設定）與 `useAxios.js`（攔截器：401 開登入彈窗、403 導回首頁）。
- `src/stores/` —— 所有 Zustand store 集中在 `index.js`（見下）。
- `src/Pages/` —— 路由級頁面（Posts、SinglePost、CreatePost、EditPost、About、TravelPinsNew、MotionDetector、Demo）。
- `src/Components/` —— 共用元件（Nav、Layout、LoginModal、ProtectedRoute、Modal、MarkdownEditor、PostMetadata、Footer…）。
- `src/hooks/` —— 自訂 hooks（`useCreatePostForm`、`useEditPostForm`、`useDebounce`、`usePostFormCache`、`useScrollDirection`、`useBodyScrollLock`、`useTagifyManager`）。
- `src/wallet/getProvider.js` —— 取得 ethers provider：桌機用 injected `window.ethereum`，行動端用 WalletConnect（`EthereumProvider` + QR modal）。
- `src/locales/` —— `en.json`、`zh-TW.json`。
- `src/mocks/` —— MSW（`server.js`、`handlers.js`），測試用。

### Zustand stores（`src/stores/index.js`）
持久化到 localStorage 的：`useAuthStore`（isLoggedIn）、`useLocaleStore`（locale，預設 en，含 `initializeFromNavigator`）、`usePostFormStore`、`useEditPostFormStore`（依 postId 分存）。非持久化的：`useCategoryStore`、`usePaginationStore`、`usePostSortStore`、`usePostTagsStore`、`useLoginModalStore`、`useMetaMaskModalStore`。store 內有 `isClient` 等 SSR 安全檢查。

### 認證流程（Web3）
登入流程的正本是後端 `my-blog-backend/CLAUDE.md`〈Web3 / MetaMask authentication〉那一段（決策 5：API 契約由後端持有），這裡不另寫一遍；前端這一側的實作在 `src/APIs/auth.js` 的 `useLoginWithMetaMask`，provider 取得在 `src/wallet/getProvider.js`。

## 測試
Vitest 設定在 `vite.config.js` 的 `test` 區塊（`globals:true`、`environment:'jsdom'`、`setupFiles:['./src/setupTests.js']`）。`setupTests.js` 載入 `@testing-library/jest-dom` matchers，並以 MSW 啟動 mock server（`beforeAll listen` / `afterEach resetHandlers` / `afterAll close`）。mock handler 在 `src/mocks/handlers.js`。

## Vite 細節
- 自訂 plugin 把 `.js` 當 JSX 處理；path alias `@/*` 與 `src/*`。
- dev server `host: 0.0.0.0`、`port: 3000`（方便 Docker 連入）；正式 build 關閉 sourcemap，輸出到 `build/`（沿用 CRA 風格的輸出目錄名）。
- TypeScript 設定寬鬆（`strict:false`），JSX 用 `react-jsx`。Tailwind content 掃 `./src/**/*.{js,jsx,ts,tsx}`，自訂 `.no-scrollbar`。

## commit 訊息
commit 訊息依 dispatch-flow plugin 的規矩，不加 AI 署名。
