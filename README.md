# my-blog-frontend

個人部落格 + 旅遊地圖標記（travel-pins）的前端：Vite 7 + React 19 單頁應用，純 JSON API client，資料來自另一個 repo `my-blog-backend`，登入用 MetaMask / WalletConnect 錢包簽章。

## 跑起來

```bash
yarn install && yarn dev     # 開發伺服器在 :3000，預設打 http://localhost/api（後端先起）
yarn test                    # Vitest
```

## 細節去哪讀

- 架構、指令、環境變數、測試：`CLAUDE.md`
- 部署手冊：`scripts/README.md`（部署腳本 `scripts/deploy.sh` 住在同一個目錄）
