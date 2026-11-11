# 前端部署手冊

這一份是前端（`my-blog-frontend`）推上正式環境的手冊，與部署腳本 `deploy.sh` 放在同一個目錄。
目標讀者是**沒有部署過這個專案的人**：照著做能推一版上去、出事知道怎麼退回。

正式環境沒有容器、沒有 CI：部署就是「在本機 build 出靜態檔，打包 scp 到伺服器，換掉伺服器上的 `build` 目錄」。

> **部署知識只有這一份正本。** `CLAUDE.md` 的 `yarn deploy` 那一行指到這裡，不另外寫一遍。
> 腳本 `deploy.sh` 與這份手冊一起在版控裡；它的每一步都寫在下面〈腳本每一步做什麼〉，照著手動跑結果相同。

## 0. 全貌

```
本機                                        伺服器 linode-blog
─────────────────────────────────           ───────────────────────────────────────
docker compose exec app                      /var/www/html/blog/
  yarn run build-production  → build/   scp    ├── build.tar.gz      （暫時）
tar -czf build.tar.gz ./build ─────────────▶  ├── build_temp/build/ （暫時，解壓到這裡）
                                              └── build/            （nginx 的 root，整個目錄被換掉）
```

- build 在本機的 docker compose `app` 容器裡做（`vite build --mode production`，輸出 `build/`）。
- 伺服器端由主機上的 nginx 直接出 `/var/www/html/blog/build` 裡的靜態檔，沒有別的程式參與。
- 正式 build 打的後端是 `https://blog-api.learn-or-die.com/api`（來自 `.env.production`，變數表見 `CLAUDE.md`〈環境變數〉）。

## 1. 前置條件

動手前逐條確認。每一條附一道檢查指令，印不出預期結果就先補齊。

| # | 條件 | 怎麼檢查 | 不符合時 |
|---|---|---|---|
| 1 | 要出貨的程式碼已在工作目錄裡（通常是 `main` 最新） | `git status --short` 無輸出；`git log -1 --oneline` 是你要出貨的 commit | 先 commit / pull；工作目錄有未 commit 的改動也會被 build 進去 |
| 2 | 正式環境變數檔 `.env.production` 在 repo 根 | `test -f .env.production && echo ok` | 它被 `.gitignore` 忽略，要從上一個部署的人那裡拿；該有哪些變數見 `CLAUDE.md`〈環境變數〉的 production 欄。**不要把內容貼到任何地方** |
| 3 | 開發環境變數檔 `.env.development` 也在 repo 根 | `test -f .env.development && echo ok` | 它同樣被 `.gitignore` 忽略，而 `docker-compose.yml` 的 `env_file` 指著它、沒有標 `required: false`：少了它 `docker compose up` / `config` 直接印 `Failed to load …/.env.development … no such file or directory`。向上一個部署的人要；`.env.docker.template` 複製改名也能讓 compose 起來，但它只有 API / domain 那七個變數，沒有 Mapbox、WalletConnect 的值 |
| 4 | docker compose 的 `app` 容器**正在跑** | `docker compose ps` 看到 `app` 是 `Up` | `docker compose up -d`（要先過第 3 列）。腳本用的是 `docker compose exec`，容器沒在跑就直接失敗 |
| 5 | ssh 別名 `linode-blog` 可用、免密碼（或 agent 裡有 key） | `ssh linode-blog 'echo ok'` 印 `ok` | 在 `~/.ssh/config` 加 `Host linode-blog`（主機、使用者、key 向擁有伺服器的人要）。scp 與 ssh 共用這個別名 |
| 6 | 伺服器端 `/var/www/html/blog` 對你的登入帳號可寫 | `ssh linode-blog 'test -w /var/www/html/blog && echo ok'` | 要能 `rm -rf` 與 `mv` 那裡的 `build` 目錄 |
| 7 | repo 根**沒有** `.env`、`.env.local`、`.env.production.local` | `ls .env .env.local .env.production.local 2>/dev/null` 無輸出 | Vite 的 production build 也會讀這三個檔，正式值就不只來自 `.env.production`；腳本第 1 步看到它們就停。先移開（例如改名），部署完再放回 |

## 2. 腳本每一步做什麼

`yarn deploy` 執行 `sh ./scripts/deploy.sh`（`package.json` 的 `deploy` script）。
腳本是一條 `&&` 串起來的指令鏈，**任何一步失敗就在那裡停住、後面不跑**；每一步前後各印一行 `start …` / `… success`，看終端機最後一行 `start` 後面沒有對應的 `success`，就是停在那一步。

下表的「路徑」以 `$REPO` 代表本機 checkout 的根（腳本由自己的位置推出：`scripts/` 的上一層，所以 checkout 放在哪裡都行），`$SRV` 代表伺服器上的 `/var/www/html/blog`。

| 步 | 終端機印 | 在哪跑 | 指令 | 做什麼 | 失敗代表什麼 / 留下什麼 |
|---|---|---|---|---|---|
| 1 | `start check env files...` / `check env files success` | 本機 | `cd $REPO`；`.env.production` 要在、`.env` `.env.local` `.env.production.local` 都不能在 | 確認正式 bundle 的值只會來自 `.env.production` | 印 `.env.production 不在 …` ⇒ 前置條件 2；印 `<檔名> 存在:…` ⇒ 前置條件 7。什麼都還沒動 |
| 2 | `start build...` | 本機 | `rm -rf $REPO/build` | 清掉上一次的 build 輸出，確保這次不混到舊檔 | 目錄不存在也靜默通過；會失敗的只有權限問題 |
| 3 | （同上） | 容器 `app` | `docker compose exec app sh -c 'for v in $(env \| grep -o "^VITE_[A-Za-z0-9_]*"); do unset "$v"; done; exec yarn run build-production'` | 先清掉容器環境裡的每一個 `VITE_*`，再跑 `vite build --mode production`，輸出到 `$REPO/build/`（容器把 repo 掛在 `/app`，所以本機看得到）。**為什麼要先清**：Vite 7.1.3 的 `loadEnv` 讓 process.env 裡已有的 `VITE_*`（連空字串）蓋過 `.env.production`，而容器環境來自 compose 的 `env_file: .env.development` —— 不清就會把開發值帶進正式 bundle（見〈5〉第 2 條）。做完第 3 步**先跑下面〈build 出來的東西對不對〉那三道再往下** | `service "app" is not running` ⇒ 前置條件 4。Vite 報錯 ⇒ 程式本身 build 不過，先在本機修。本機 `build/` 可能是空的或半成品，**還沒碰伺服器** |
| 4 | `build success` / `start tar...` | 本機 | `tar -czf build.tar.gz ./build` | 把整個 `build/` 目錄（含目錄本身這一層）打成 `build.tar.gz`，放在 `$REPO` 根 | 磁碟滿或 `build/` 不存在。留下半個 `build.tar.gz`，刪掉重來即可（它在 `.gitignore` 裡） |
| 5 | `tar success` / `start scp...` | 本機 → 伺服器 | `scp $REPO/build.tar.gz linode-blog:$SRV` | 把壓縮檔送到伺服器的 `$SRV/build.tar.gz` | 連不上、key 不對、`$SRV` 不可寫 ⇒ 前置條件 5、6。伺服器上可能留下半個 `build.tar.gz`；線上版本不受影響 |
| 6 | `scp success` / `start deploy...` | 伺服器 | `mkdir -p $SRV/build_temp` | 開暫存目錄 | 權限問題 ⇒ 前置條件 6 |
| 7 | （同上） | 伺服器 | `tar -xzf $SRV/build.tar.gz -C $SRV/build_temp` | 解壓到暫存目錄，得到 `$SRV/build_temp/build/` | 壓縮檔壞掉（通常是第 5 步傳一半）。線上版本仍是舊的；重跑整個腳本即可 |
| 8 | （同上） | 伺服器 | `rm -rf $SRV/build && mv $SRV/build_temp/build $SRV/` | **真正切換的一步**：刪掉線上的 `build/`，把新的搬過去。nginx 的 root 就是這個目錄，所以 `mv` 完下一個請求拿到的就是新版 | `rm` 成功但 `mv` 失敗 ⇒ **線上沒有 `build/`，站會 404**。立刻手動 `ssh linode-blog 'mv $SRV/build_temp/build $SRV/'`；還是不行就走〈4. 回滾〉。這兩個指令之間沒有原子性，`rm` 到 `mv` 之間打進來的請求會 404（通常不到一秒） |
| 9 | `deploy success` / `clean...` | 伺服器 | `rm -rf $SRV/build.tar.gz && rm -rf $SRV/build_temp` | 清掉壓縮檔與暫存目錄 | 失敗只是沒清乾淨，站已經是新版；手動刪掉即可 |
| 10 | `clean success` | — | — | 結束。**本機的 `build.tar.gz` 腳本不刪**，留在 `$REPO` 根（已被 `.gitignore` 忽略） | — |

### build 出來的東西對不對（第 3 步之後、第 4 步之前）

腳本沒有這一步，自己跑。三道都要如預期才繼續 `tar`／`scp`；不對就停，什麼都還沒上線：

```bash
grep -l 'blog-api.learn-or-die.com' build/static/js/*.js   # 預期印出至少一個檔
grep -l 'localhost/api' build/static/js/*.js               # 預期什麼都不印
grep -o 'gtag/js?id=[^"]*' build/index.html                # 預期 id= 後面有 GA 編號（與 .env.production 的 VITE_GA_ID 相同），不是空的
```

第三道抓的是〈5〉第 2 條那種「開發值蓋過正式值」：`index.html` 的 `%VITE_GA_ID%` 由 Vite 代換，正式值沒進來，這裡就會印 `gtag/js?id=`（後面空白）—— 2026-11-10 線上首頁就是這個樣子。第 3 步已先清掉容器的 `VITE_*`，所以這裡印空的，先查 `.env.production` 裡有沒有 `VITE_GA_ID`、第 3 步是不是照上表那一行跑的。

2026-11-11 用票 07 的 worktree（真的 `.env.development` / `.env.production`、同一份 `docker-compose.yml`，容器另外刻意帶著 `VITE_API_URL=http://localhost/api`）照腳本跑到第 3 步：第一道印 1 個檔、第二道 0 個、第三道 `id=` 後面是 `.env.production` 的那個編號。改腳本之前，同一個 worktree 用舊腳本的寫法（不清 `VITE_*`）build 一次，第三道印的是空的 `gtag/js?id=`。

## 3. 手動執行（想逐步跑、或在 build 之後先檢查再上傳時）

把下面的 `$REPO` 換成你的 checkout 絕對路徑，在本機逐行跑；每一行就是上表那一步，意思與失敗處置同上表。

```bash
REPO=/path/to/my-blog-frontend          # 你的 checkout
SRV=/var/www/html/blog

cd "$REPO"
ls .env .env.local .env.production.local 2>/dev/null       # 要沒有輸出（前置條件 7）
rm -rf "$REPO/build"
docker compose exec app sh -c 'for v in $(env | grep -o "^VITE_[A-Za-z0-9_]*"); do unset "$v"; done; exec yarn run build-production'
grep -l 'blog-api.learn-or-die.com' build/static/js/*.js   # 要有命中（見〈build 出來的東西對不對〉）
grep -l 'localhost/api' build/static/js/*.js               # 要沒有命中
grep -o 'gtag/js?id=[^"]*' build/index.html                # id= 後面要有 GA 編號
tar -czf build.tar.gz ./build
scp "$REPO/build.tar.gz" linode-blog:"$SRV"
ssh linode-blog "mkdir -p $SRV/build_temp"
ssh linode-blog "tar -xzf $SRV/build.tar.gz -C $SRV/build_temp"
ssh linode-blog "rm -rf $SRV/build && mv $SRV/build_temp/build $SRV/"
ssh linode-blog "rm -rf $SRV/build.tar.gz && rm -rf $SRV/build_temp"
```

### 部署後驗證

```bash
# 1. 首頁拿得到，而且 index.html 指到的 bundle 是剛 build 的那一個
curl -sI https://blog.learn-or-die.com/ | head -1          # 預期 HTTP/2 200
curl -s https://blog.learn-or-die.com/ | grep -o 'src="[^"]*\.js"'
ls build/static/js/                                         # 檔名（含 hash）要對得上上一行

# 2. 出貨的 bundle 打的是正式 API，不是本機
JS=$(curl -s https://blog.learn-or-die.com/ | grep -o 'src="[^"]*\.js"' | head -1 | sed 's/src="//;s/"$//')
curl -s "https://blog.learn-or-die.com$JS" | grep -c 'blog-api.learn-or-die.com'   # 預期 ≥ 1
curl -s "https://blog.learn-or-die.com$JS" | grep -c 'localhost/api'               # 預期 0

# 3. 線上的 GA 編號不是空的
curl -s https://blog.learn-or-die.com/ | grep -o 'gtag/js?id=[^"]*'                # 預期 id= 後面有編號；2026-11-10 之前線上印的是空的
```

第 2、3 項是〈build 出來的東西對不對〉那三道的線上版：上線前那一道沒跑，這裡是最後一次機會看到；但到這裡才發現，站已經是壞的，要走〈4. 回滾〉。

然後開瀏覽器走一遍首頁、單篇文章、旅遊地圖；用錢包登入一次（登入打的是後端，前端換版不該影響它）。

## 4. 回滾

**伺服器上不保留上一版。** 第 8 步的 `rm -rf build` 把舊版刪掉了，所以回滾不是「切回去」，而是**把舊的 commit 重新部署一次**：

```bash
cd "$REPO"
git log --oneline -10                      # 找到上一版對應的 commit（上一次部署的那個）
git checkout <舊 commit 的 sha>            # 或開一個 worktree，不動現在的分支
yarn deploy                                # 或照〈3. 手動執行〉跑
git checkout main                          # 回到原本的分支
```

要點：

- 腳本不記錄它部署了哪個 commit，所以「上一版」是哪個靠部署的人知道（commit 訊息、tag、或部署前自己記一筆）。**建議每次部署前先記下 `git log -1 --oneline`。**
- 回滾一樣要走 build，所以前置條件 1～7 都要成立；build 失敗的舊 commit 回不去。
- 想要「秒切」的保險：部署前手動在伺服器留一份 `ssh linode-blog 'cp -a /var/www/html/blog/build /var/www/html/blog/build.prev'`，出事時 `ssh linode-blog 'rm -rf /var/www/html/blog/build && mv /var/www/html/blog/build.prev /var/www/html/blog/build'`。**腳本不做這件事**，用了就記得事後把 `build.prev` 刪掉。

## 5. 已知限制

1. **不保留上一版、切換不是原子的**：見第 8 步與〈4. 回滾〉。
2. **build 用開發用容器做，而容器環境會蓋過 `.env.production`，所以第 3 步先清掉容器的 `VITE_*`**。Vite 7.1.3 的 `loadEnv`：執行時 process.env 裡已有的 `VITE_*` 優先於 `.env.<mode>` 檔，連空字串都算已設（2026-11-08 用 worktree 的 `node_modules/vite` 實跑：同一個變數 process.env 設了就回 process.env 的值，沒設才回 `.env.production` 的）。compose 的 `env_file: .env.development` 會把那個檔的值放進容器環境，`environment:` 那七個不帶值的條目則照 host shell 當下的值帶進去；要知道今天容器裡有哪幾個：`docker compose exec app sh -c 'env | grep -o "^VITE_[A-Za-z0-9_]*"'`（只印名字，不印值）。**後果發生過一次**：2026-11-10 線上首頁 `gtag/js?id=` 後面是空的、`gtag('config', "")` —— 舊腳本直接在容器裡 build，`.env.development` 的 `VITE_GA_ID=""` 蓋掉了正式值。第 3 步的 `unset` 只清得掉**環境變數**；同樣會混進正式值的**檔案**（`.env`、`.env.local`、`.env.production.local`）由第 1 步擋。
3. **沒有 CI**：沒有東西替你跑測試；部署前自己跑 `yarn test`（前端今天沒有 lint 指令，見 `CLAUDE.md`）。

## 6. 伺服器端怎麼出靜態檔

以下是 2026-11-07 盤查到的伺服器狀況（票 03 票面）。伺服器設定不在這個 repo 裡，**以伺服器上的實際設定為準**，要確認就跑下面那道指令。

- 主機 nginx（不是容器）的 blog site 收 `learn-or-die.com` 與 `blog.learn-or-die.com`，`root /var/www/html/blog/build`，`try_files … /index.html`（SPA 的所有路由都回 `index.html`，由 React Router 接手）。
- TLS 憑證由 Certbot 管，與部署無關：換 `build/` 不影響憑證。
- 前端出的只有靜態檔；後端 API 是另一個站（`blog-api.learn-or-die.com`），它的部署手冊住在 `my-blog-backend` 的 `deployment/` 目錄。

```bash
# 看 nginx 實際載入的設定裡,blog 這個 site 的三個關鍵指令（可能需要 sudo）
ssh linode-blog "sudo nginx -T 2>/dev/null | grep -n -e 'server_name' -e 'root ' -e 'try_files'"
```

## 相關檔案

- `scripts/deploy.sh` —— 腳本本身（內容對應〈2〉的 10 步）
- `package.json` —— `deploy`、`build-production` 兩個 script 的定義
- `vite.config.js` —— `build.outDir: 'build'`，production 關 sourcemap
- `docker-compose.yml` —— `app` service、`env_file`
- `CLAUDE.md` —— 環境變數表、Docker 說明
- `../my-blog-plans/工作區總覽.md` —— 整個工作區怎麼接、怎麼跑起來
