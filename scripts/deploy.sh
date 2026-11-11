#!/bin/bash
# 把前端推上正式環境。每一步做什麼、失敗代表什麼、怎麼回滾:同目錄 README.md。
#
# 本機 checkout 的位置由腳本自己的位置推出來(scripts/ 的上一層),不寫死。
# build 時清掉容器環境裡的每一個 VITE_*:compose 用 env_file 把 .env.development 注進 app 容器,
# 而 Vite 的 loadEnv 讓 process.env 裡的 VITE_*(含空字串)蓋過 .env.production。
REPO="$(cd "$(dirname "$0")/.." && pwd)" || exit 1
SRV=/var/www/html/blog

echo "start check env files..." &&
  cd "$REPO" &&
  { test -f .env.production || { echo ".env.production 不在 $REPO:正式值的唯一來源缺了。" >&2; exit 1; }; } &&
  for f in .env .env.local .env.production.local; do
    if [ -e "$f" ]; then
      echo "$f 存在:Vite 正式 build 也會讀它,值就不只來自 .env.production。先移開再部署。" >&2
      exit 1
    fi
  done &&
  echo "check env files success" &&
  echo "start build..." &&
  rm -rf "$REPO/build" &&
  docker compose exec app sh -c 'for v in $(env | grep -o "^VITE_[A-Za-z0-9_]*"); do unset "$v"; done; exec yarn run build-production' &&
  echo "build success" &&
  echo "start tar..." &&
  tar -czf build.tar.gz ./build &&
  echo "tar success" &&
  echo "start scp..." &&
  scp "$REPO/build.tar.gz" linode-blog:"$SRV" &&
  echo "scp success" &&
  echo "start deploy..." &&
  ssh linode-blog "mkdir -p $SRV/build_temp" &&
  ssh linode-blog "tar -xzf $SRV/build.tar.gz -C $SRV/build_temp" &&
  ssh linode-blog "rm -rf $SRV/build && mv $SRV/build_temp/build $SRV/" &&
  echo "deploy success" &&
  echo "clean..." &&
  ssh linode-blog "rm -rf $SRV/build.tar.gz && rm -rf $SRV/build_temp" &&
  echo "clean success"
