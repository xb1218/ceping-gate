# 部署 SOP · 测评授权码系统

> 首次上线 2026-10-15。本文件记录「从本地项目 → 公网可访问链接」的完整标准流程，
> 换项目时把第 3 节的实参替换掉即可复用。
>
> 线上地址：**https://ceping-gate.app.workbuddy.host/**

---

## 0. 一页速览

| 项目 | 值 |
|---|---|
| 部署通道 | WorkBuddy「发布应用」（内置 sites 能力；对话里说"发布 / 上线 / 部署"即触发） |
| 项目目录 | `/Users/baihuifang/AI测试网页/测评授权码系统` |
| 应用 ID | `wbapp_nJSD0IMKnJryYL84fUMBHb` |
| 线上域名 | `https://ceping-gate.app.workbuddy.host/` |
| 域名构成 | `<domainPrefix>.app.workbuddy.host` —— 后缀由平台固定，前缀在**首次创建应用时**定下，之后重新部署也改不了 |
| 启动命令 | `ISSUE_TOKEN=<签发令牌> PUBLIC_URL=https://ceping-gate.app.workbuddy.host node server.js` |
| 管理入口 | WorkBuddy：设置 → 数据管理 → 应用（可查看链接 / 下线 / 删除） |
| 签发令牌 | 不在本文件（本文件可能进 git 仓库）。本地备份：`data/deploy.env` |

---

## 1. 能发布的前提（平台硬性要求）

平台只暴露**一个公网端口**并做反向代理，所以项目必须满足：

| 要求 | 说明 | 本项目 |
|---|---|---|
| 单一 HTTP 端口 | 服务必须监听环境变量 `PORT`，并绑定 `0.0.0.0` | ✅ `server.js:32,33,689` |
| 有启动入口 | 根目录 `server.js`，或 package.json 里有 `start`/`serve`/`dev` | ✅ 根目录 `server.js` |
| 无外部中间件 | 沙箱不提供数据库 / 缓存 / 消息队列 | ✅ 零依赖，JSON 文件存储 |
| 静态站另说 | 纯静态用 `python3 -m http.server "$PORT" --bind 0.0.0.0`，不要手写 Node 服务 | 不适用 |
| Vite 前端 | 需 `server.host="0.0.0.0"` + `server.allowedHosts: true`，否则反代被拒 | 不适用 |

> 不满足就会被拒（返回 `sites_deploy_unsupported`），此时不要去"改造"成静态占位页硬发。

---

## 2. 通用流程（四步）

### S1 部署前自检（本地）

```bash
cd /Users/baihuifang/AI测试网页/测评授权码系统

# 1) 语法检查
node --check server.js

# 2) 本地起服务（换个不冲突的端口）
PORT=18999 node server.js

# 3) 冒烟：关键链路逐条 curl（另开一个终端）
B=http://127.0.0.1:18999
curl -s $B/healthz
curl -s $B/api/config
curl -s -o /dev/null -w '%{http_code}\n' $B/admin                    # 期望 200
curl -s -o /dev/null -w '%{http_code}\n' $B/api/admin/list           # 期望 401
curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}\n' $B/tests/lianai.html   # 期望 302 -> 壳页

# 4) 关掉本地服务
kill $(lsof -ti :18999)
```

**这一步不能省**：部署后每次改代码都要重新上传，本地先跑通能省掉一整轮"部署—发现报错—再部署"。

### S2 确定部署参数

| 参数 | 怎么给 |
|---|---|
| `directory` | 项目绝对路径（决定发布到哪个应用，链接由它决定） |
| `language` | `node` / `python` / `go` / `static` / `auto` |
| `appName` | 中文短名，进应用列表标题，≤12 字 |
| `domainPrefix` | 小写英文短横线 slug（≤32 字符）。**只在首次创建应用时生效** |
| `startCmd` | 覆盖启动命令，**注入环境变量就靠它**（shell 执行） |
| `userAskedToPublish` | 用户在**本轮消息里**明确说了发布才置 true |

> `startCmd` 是唯一的环境变量注入口。本项目要用它带 `ISSUE_TOKEN` 与 `PUBLIC_URL`。

### S3 执行部署

对话里说"部署 / 发布 / 上线"即可，等价于调用：

```json
{
  "action": "deploy",
  "directory": "/Users/baihuifang/AI测试网页/测评授权码系统",
  "language": "node",
  "appName": "测评授权码系统",
  "domainPrefix": "ceping-gate",
  "startCmd": "ISSUE_TOKEN=<签发令牌> PUBLIC_URL=https://ceping-gate.app.workbuddy.host node server.js",
  "userAskedToPublish": true
}
```

返回里带公网链接。若是已发布过的目录，**同一应用被覆盖，链接不变**。

### S4 部署后验收（必做）

见第 5 节清单，逐条 curl 通过才算完成。

---

## 3. 本项目实参：环境变量清单

| 变量 | 作用 | 不设的后果 | 本项目取值 |
|---|---|---|---|
| `PORT` | 监听端口 | — | 平台自动注入，不用管 |
| `ISSUE_TOKEN` | `/api/issue` 自动发货令牌 | 公网发码被锁死（401） | 见 `data/deploy.env` |
| `PUBLIC_URL` | 对外 base，拼兑换短链 | 短链退回沙箱内部域名（`3000-xxx.e2b.sh1...`） | `https://ceping-gate.app.workbuddy.host` |
| `ADMIN_PASSWORD` | 管理后台密码 | — | 代码常量默认 `jy120218`，无需注入 |
| `DATA_DIR` | 数据目录 | — | 默认 `./data` |
| `HOST` | 绑定地址 | — | 默认 `0.0.0.0`（必须） |

**管理后台不需要任何环境变量**：会话签名密钥由 `ADMIN_PASSWORD` 派生，所以重新部署后照样能登录。

---

## 4. 平台六条隐藏规则（踩坑记录）

1. **上传遵循 `.gitignore`** —— `data/` 被忽略，所以放在 `data/` 里的任何文件（令牌文件、预置数据）都不会上传到线上。
   → 令牌类配置只能走 `startCmd` 环境变量；线上运行期产生的数据也在沙箱里，**重新部署即丢失**。
2. **反向代理不透传原始 Host** —— `/api/issue` 拿 `req.headers.host` 拼出来的短链会是沙箱内部域名。
   → 必须用 `PUBLIC_URL` 显式固定对外域名（已加进 `server.js:495`，env 不设时保持原行为）。
3. **自定义请求头会透传** —— `x-issue-token` 走 header 或走 body `token` 都能生效（两种都实测过）。
4. **只暴露一个端口** —— 内部起的第二个端口外部访问不到；不要设计"前端 3000 + 后端 8080"的双端口结构，服务端要同时托管前端静态文件。
5. **无数据库/缓存/队列** —— 需要 MySQL/Redis 的项目会被直接拒绝。持久化只能靠文件（且如上，文件在重新部署时会丢）或改用云服务/外部存储。
6. **微信内置浏览器被入口层拦截** —— 请求头里带 `MicroMessenger` 就返回 `403` + 一个「请在浏览器中打开」的页面，**在到达你的应用之前就被挡了**（只有 `/healthz` 例外）。
   → 微信 / 企业微信里直接点发布链接打不开，必须"在浏览器打开"。详见第 8 节。

---

## 5. 上线验收清单

```bash
B=https://ceping-gate.app.workbuddy.host
J=/tmp/ck.txt; rm -f $J
```

| # | 检查 | 命令 | 期望 |
|---|---|---|---|
| 1 | 健康检查 | `curl -s $B/healthz` | `{"code":200,...,"Pod alive"}` |
| 2 | 配置接口 | `curl -s $B/api/config` | 只返回**已上架**的测试 |
| 3 | 壳页可打开 | `curl -o /dev/null -w '%{http_code}' $B/` | `200` |
| 4 | 门禁生效 | `curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}' $B/tests/lianai.html` | `302` → 壳页 `?need=1` |
| 5 | 管理页可打开 | `curl -o /dev/null -w '%{http_code}' $B/admin` | `200`（只是登录框） |
| 6 | 未登录被拒 | `curl -o /dev/null -w '%{http_code}' $B/api/admin/list` | `401` |
| 7 | 密码登录 | `curl -s -c $J -X POST $B/api/admin/login -H 'Content-Type: application/json' -d '{"password":"jy120218"}'` | `{"ok":true}` |
| 8 | 会话稳定 | `for i in 1 2 3 4 5; do curl -s -b $J -o /dev/null -w '%{http_code} ' $B/api/admin/list; done` | 5 个 `200`（多实例需全部命中） |
| 9 | 生成码 | `curl -s -b $J -X POST $B/api/admin/generate -H 'Content-Type: application/json' -d '{"prefix":"LA","count":1,"testId":"lianai","maxUses":1,"note":"验收"}'` | 返回 `codes[]` |
| 10 | 列表分类 | `curl -s -b $J $B/api/admin/list` | 能按 `testId` 分「通用 / 各测评」 |
| 11 | 自动发货 | `curl -s -X POST $B/api/issue -H 'Content-Type: application/json' -H 'x-issue-token: <令牌>' -d '{"testId":"lianai","note":"验收"}'` | 返回 `redeemUrl`，且域名是**公网域名** |
| 12 | 错令牌被拒 | 同上但令牌填 `wrong` | `401` |
| 13 | 兑换链路 | `curl -s -o /dev/null -w '%{http_code}' "<redeemUrl>"` | `200` 且是真实测评页 |

> 第 11 项要特别看域名：如果返回里出现 `sandbox.cloudstudio.club`，说明 `PUBLIC_URL` 没注入成功。

**当前线上状态（2026-10-15 复核）**：1 ✅ / 2 ✅ 仅 `lianai` / 3 ✅ / 4 ✅ 302→壳页 / 5 ✅ 200 / 6 ✅ 401。

---

## 6. 日常运维

| 动作 | 做法 | 注意 |
|---|---|---|
| 改代码后同步线上 | 改完文件 → 说"更新发布" | 链接不变；**会重置线上码库** |
| 临时不让人访问 | 说"下线这个应用" | 链接失效，应用与配置保留 |
| 彻底删除应用 | 设置 → 数据管理 → 应用 → 删除 | 数据不可恢复 |

> ⚠️ **最重要的一条**：`data/` 不上传，所以**每次重新部署 = 线上授权码全部丢失、退回空库**。
> 正式开卖后不要随手重新部署。要长期保存码库，就得迁到第 7 节的自有服务器。

---

## 7. 想把域名里的 `workbuddy` 去掉

内置发布通道的域名后缀 `app.workbuddy.host` **由平台固定**，部署参数里没有自定义域名项，设置面板也只有"查看/上线/下线/删除"，因此**在这个通道上做不到**。三条替代路径：

| 方案 | 域名长什么样 | 成本 | 代价 |
|---|---|---|---|
| A. 自有域名 + 自有服务器（VPS） | `ceping.你的域名.com` | 域名 ~50 元/年 + 服务器 ~40-100 元/月 | 需备案（国内服务器）+ 自己装 nginx/pm2，但**数据留在自己手里** |
| B. 自有域名 + 内网穿透 | `ceping.你的域名.com` | 域名费用（Cloudflare Tunnel 免费） | 你这台 Mac 必须常开；适合验证期与小规模 |
| C. 换第三方托管（Render / Railway / Fly.io） | `ceping.onrender.com` 之类 | 免费额度或 ~5-7 美元/月 | 几乎零改写（同样认 `PORT`），但要解决磁盘持久化（挂载盘或换云数据库） |

三条路都**不用改前端页面**，服务端也基本不用改：它已经认 `PORT`、读环境变量。
需要迁移的只有两样东西：`config/tests.json`（跟着代码走）和 `data/codes.json`（码库，得单独搬）。

**迁移检查单**

1. 买域名 → 解析到目标服务器（A/CNAME）
2. 服务器上跑 `node server.js`，用 pm2 守护（`pm2 start server.js --name ceping`）
3. 设环境变量：`PORT` / `ISSUE_TOKEN` / `PUBLIC_URL=https://新域名`（`ADMIN_PASSWORD` 无需要）
4. nginx 反代到本地端口 + 免费 HTTPS 证书（certbot）
5. 搬码库：把线上 `data/codes.json` 导出后放到新服务器的 `data/`（**重新部署前先导出，否则丢**）
6. 按第 5 节 13 条清单重新验收一遍
7. 验收通过后再下线旧链接

---

## 8. 微信里打不开链接？（影响卖货，必读）

### 现象与结论

在微信里点 `https://ceping-gate.app.workbuddy.host/...` 会看到一页 **「请在浏览器中打开 · 当前应用不支持在微信内打开，请复制链接后在浏览器（Safari / Chrome 等）中访问」**。

**这不是我们代码的问题，是平台的入口层策略。** 2026-10-15 实测（带各种 UA 直接请求首页）：

| 来源 | UA 关键特征 | 结果 |
|---|---|---|
| 微信 | 含 `MicroMessenger` | **403** |
| 企业微信 | 含 `MicroMessenger` + `wxwork` | **403** |
| Safari / Chrome | 无 | 200 |
| QQ / 支付宝 / 抖音 / 小红书 / 微博 / 钉钉 | 无 `MicroMessenger` | 200 |
| 微信 UA 请求 `/healthz` | 含 `MicroMessenger` | 200（平台只放行健康检查） |

判定**只看 UA 关键字**：把 `MicroMessenger` 塞进 PC 浏览器 UA 也会 403；换成非 HTML 的 `Accept` 头照样 403。
`server.js` 里没有任何微信相关逻辑（`grep -i micromessenger server.js` = 0 处），请求在我们的服务之前就被拦掉了。

社区也有人观察到同一现象，推测是 `*.app.workbuddy.host` 这种域名形式被微信判定有风险。

### 对生意的影响

这条链路是「买家在微信里点链接 → 输码 → 进测评」。**微信内打不开 = 转化路径断在第一跳**，买家要"复制链接 → 切到 Safari/Chrome → 粘贴"，流失会很明显。

### 应对

**立刻能做（零成本）**：给买家一句话引导 ——「微信里点右上角 `···` → 在浏览器打开」；平台那个 403 页面本身也带一个「复制链接」按钮。

**真正解决（推荐，见第 7 节）**：换到**自己的域名**。自有域名不在平台的拦截名单里，微信可正常打开。两条路：
- **B 方案（快、便宜）**：自有域名 + Cloudflare Tunnel 指向你这台 Mac。只需一个域名（约 50 元/年），当天就能用；代价是 Mac 要常开。
- **A 方案（稳、正规）**：自有域名 + VPS。境外/中国香港服务器免备案，微信能打开（未备案域名微信顶部可能显示「非微信官方网页」提示条，属正常现象）；国内服务器体验最好，但要先完成 ICP 备案（约 2-3 周）。

> ⚠️ 一个别踩的坑：**没有"换域名之外的捷径"**。拦截发生在平台入口、按 UA 判定，所以在应用里加跳转、加 iframe、换短链都没用 —— 短链最终仍会落到被拦的域名上。把静态快照放进"资料库"再分享（`workbuddy.link/p/xxx`）虽然微信能打开，但本项目依赖服务端做门禁校验和自动发货，**静态快照会丢掉防抄能力**，不能用于正式售卖。

---

## 9. 换一个项目部署时的最小改动

1. 确认它满足第 1 节的前提（单端口 + 认 `PORT` + 绑 `0.0.0.0`）
2. 本地按 S1 自检跑通
3. 起一个新的 `domainPrefix`（首次创建才生效）
4. 有敏感配置就走 `startCmd` 注入，**不要放文件**（`.gitignore` 会让文件消失）
5. 有对外域名需求就加一个 `PUBLIC_URL` 之类的开关
6. 部署后按第 5 节验收

---

## 附：链接能用多久？（2026-10-15 查证）

**结论：链接不会自动过期，只要你不主动"下线"、不删除应用，就一直有效。**

依据：官方文档里链接只在两种情况失效 —— ① 你在分享面板点「下线」；② 你删除应用。更新发布后「访问链接保持不变，已经分享出去的链接会直接打开新版本」。平台没有"到期自动回收"的设定，链接是绑在你账号下的应用上的，跟会员是否续费无关。

但要注意区分两件事，**很多文章把它们混在一起讲**：

| | 本项目（**未开云服务**） | 如果将来开启云服务（数据库/登录/文件存储） |
|---|---|---|
| 资源点 | **不消耗** | 消耗（数据落库、文件存储、访问峰值、模型调用） |
| 云服务应用名额 | **不占用** | 占用：免费版 10 个 / 标准 30 / 高级 50 / 旗舰 99 |
| 每应用每月资源点 | — | 免费 5000 / 标准 25000 / 高级 50000 / 旗舰 150000 |
| 会员到期或额度耗尽 | **无影响** | 云服务暂停，**数据保留 15 天，逾期永久删除** |

本项目用的是自己的 JSON 文件存储 + 自己签发的 Cookie 会话，**没有走平台云服务**，所以落在"不消耗资源点、不占名额、不随会员到期暂停"这一类。市面上"数据只保留 15 天"的说法针对的是**开了云服务的应用**，别套到自己头上。

### 真正要防的不是"过期"，而是"数据没落地"

链接长期有效 ≠ 数据长期安全。码库 `data/codes.json` 存在沙箱容器里，而 `data/` 不随部署上传，所以：

- **每次重新部署 = 线上码库清零**（已实测确认）；
- 容器重建/迁移时，运行期产生的数据同样不会自带过去。

所以：

- **验证期**：用这个通道完全够，零成本、链接稳定，放心用。
- **准备正式开卖**：按第 7 节迁到自有服务器，把码库握在自己手里。真正决定"能用多久"的不是链接，而是数据在哪。
