#!/bin/bash
# 一键启动（双击运行）
cd "$(dirname "$0")"

# 兼容：优先用系统 node，其次用常见安装路径
NODE_BIN="node"
if ! command -v node >/dev/null 2>&1; then
  for p in /usr/local/bin/node /opt/homebrew/bin/node "$HOME/.nvm/versions/node"/*/bin/node; do
    if [ -x "$p" ]; then NODE_BIN="$p"; break; fi
  done
fi

if ! command -v "$NODE_BIN" >/dev/null 2>&1 && [ ! -x "$NODE_BIN" ]; then
  echo "没有检测到 Node.js，请先安装：https://nodejs.org （选 LTS 版，一路下一步）"
  read -r -p "按回车退出…"
  exit 1
fi

echo "正在启动，启动后会自动打开管理后台…"
# 延迟打开后台，等服务起来
( sleep 1.5; open "http://localhost:8787/admin" >/dev/null 2>&1 ) &

exec "$NODE_BIN" server.js
