# 测评授权码系统

所有测评 HTML 的统一门禁。**一个壳页接管全部测评**：用户拿授权码进来 → 服务端校验 → 通过才放行到对应测评页 → 首次使用即核销，转发给别人会提示「已被使用」。

零 npm 依赖（只用 Node 内置模块），不需要 `npm install`，断网可跑。

---

## 一、启动

**双击 `一键启动.command`**（macOS）。首次运行如提示「无法打开，因为无法验证开发者」，右键 → 打开，或在终端执行一次：

```bash
chmod +x 一键启动.command
```

启动后终端会打印：

```
入口页  http://localhost:8787/
管理页  http://localhost:8787/admin
管理令牌 xxxxxxxx
```

浏览器会自动打开管理后台。**管理令牌只打印一次**，同时也存在 `data/admin.token` 里。

其它方式：

```bash
node server.js                # 或 ./start.sh
PORT=9000 node server.js      # 换端口
```

---

## 二、三个页面

| 地址 | 用途 |
|---|---|
| `/` | **壳页**。用户输入授权码 → 选测试 → 跳转。这也是自动发货要发的链接落地页 |
| `/admin` | 管理后台。批量生成码、看状态、作废、复制 |
| `/tests/<id>.html` | 测评页本体。**没有有效 Cookie 打不开**，会被弹回壳页 |

**自动发货用的两种链接形式**（手动模式 / 理解原理时用）：

```
http://你的域名/go?code=LA-A3K9-QM4X&test=lianai      # 推荐，短、可读
http://你的域名/tests/lianai.html?c=LA-A3K9-QM4X      # 直达，效果相同
```

> 推荐用**接口发货**：让发货工具下单后调 `POST /api/issue` 现场生成码并直接拿到上面的兑换直链，无需手工备码池。详见第五节。

---

## 三、接入一个新的测评（3 步）

1. 把测评 HTML 放进 `public/tests/`，文件名用英文，如 `xinli.html`；
2. 在 `config/tests.json` 里登记：

```json
{ "id": "xinli", "name": "心理年龄", "subtitle": "你的心理年龄是几岁？",
  "file": "xinli.html", "price": 1.99, "status": "online" }
```

3. 在测评页 `</body>` 前加**一行**：

```html
<script src="/gate-client.js"></script>
```

加完之后：用户必须从壳页或带码链接进来；页面右下角会出现半透明水印（授权码尾号 + 你生成的备注），截图可溯源。

> `status` 填 `offline` 时该测试不出现在壳页里，码也验不过——用来做「准备好但还没上架」的品。

---

## 四、授权码规则

- 格式 `前缀-XXXX-XXXX`，字符集剔除了 `0 O 1 I L 2 Z 5 S B` 这类容易看错的字符；
- **默认一次性**（`maxUses=1`）：第一个打开的人用掉，第二个打开提示「已被使用」；
- `maxUses=0` 表示不限次数，只用于自己测试，别发给买家；
- `testId` 填 `*` 是通用码，用户进壳页后自己选测试；填具体 id 则锁定只能进那一个；
- `备注` 会显示成水印，建议填买家昵称或订单号，维权时是证据。

---

## 五、API

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/verify` | `{code, test}` 校验，通过则下发签名 Cookie |
| GET | `/api/config` | 壳页用：已上架测试列表 |
| POST | `/api/admin/generate` | 批量生成，body `{prefix,count,testId,maxUses,note}` |
| GET | `/api/admin/list?token=` | 全部码 + 统计 |
| POST | `/api/admin/revoke` | 作废单个码 |
| GET | `/api/admin/tests` | 全部测试（含未上架） |
| POST | `/api/issue` | **下单后现场生成码**（接口发货用），body `{testId,note,maxUses}`，返回 `{code, redeemUrl}` |
| GET | `/healthz` | 健康检查 |

管理接口鉴权：请求头 `x-admin-token: <令牌>`，或 body / query 里带 `token`。
`/api/issue` 鉴权：请求头 `x-issue-token: <令牌>`（默认复用 ADMIN_TOKEN，可用 `ISSUE_TOKEN` 环境变量单独覆盖）。**本机直连两者都免令牌**；公网访问必须带对应令牌。

### 推荐：下单后现场生成（接口发货，零库存）

不用预生成码池，也不会「码不够发不出货」。把自动发货工具（阿奇索等）配成**接口发货**模式，让它每笔订单付款后调用：

```http
POST https://你的域名/api/issue
Content-Type: application/json
x-issue-token: 你的签发令牌

{ "testId": "lianai", "note": "订单号SH20261015-001" }
```

返回：

```json
{ "ok": true, "testId": "lianai", "count": 1,
  "codes": [ { "code": "LIAN-R6JJ-MHY7",
               "redeemUrl": "https://你的域名/tests/lianai.html?c=LIAN-R6JJ-MHY7" } ] }
```

把 `redeemUrl` 当成发货内容发出去即可——买家点一下直接进测试（零输入）。`testId` 固定填该商品对应的测试 id（见 `config/tests.json`）。通用码用 `testId: "*"`，此时返回 `/go?code=...&test=*` 短链（壳页自选测试）。

> 仍想用「卡密池」模式也行：在 `/admin` 批量生成 → 复制 → 导入发货工具的卡密库。但 JIT 接口发货免库存、更省心，新项目建议直接用。

---

## 六、数据文件

| 文件 | 内容 | 能删吗 |
|---|---|---|
| `data/codes.json` | 授权码库 | 删了等于清空所有码 |
| `data/secret.key` | Cookie 签名密钥 | 删了全部已发 Cookie 失效，用户要重新验证 |
| `data/admin.token` | 管理令牌 | 删了重启会重新生成一个新的 |
| `config/tests.json` | 测试注册表 | 改它就是上下架 |

想清空重来：停服务 → 删 `data/codes.json` → 启动。

---

## 七、部署到公网

**授权码校验必须在服务端做**，所以 Netlify Drop / 纯静态托管做不了（页面能被直接扒走）。三条路：

1. **验证期最快——本地服务 + 内网穿透**，5 分钟出公网 HTTPS 链接：
   ```bash
   node server.js
   ngrok http 8787          # 或：cloudflared tunnel --url http://localhost:8787
   ```
   把生成的 `https://xxx.ngrok.io` 填进阿奇索的链接里即可。免费版域名每次重启会变，适合测流程。
2. **长期主力——一台 VPS**（腾讯云/阿里云轻量，约 40-100 元/月）：
   ```bash
   node server.js &                    # 或装 pm2 守护
   # 再用 nginx 反代到 8787，绑域名 + HTTPS 证书
   ```
3. **想继续用 Vercel**：把 `server.js` 的路由改写成 Vercel Serverless Functions（`api/*.js`），存储换成 Vercel KV 或任意云数据库。页面本身不用改。

---

## 八、常见问题

**忘了管理令牌？` 删 `data/admin.token`，重启服务，终端会打印新的。

**想改端口？` `PORT=9000 node server.js`。

**买家说「已被使用」但他第一次打开？` 先看 `/admin` 里这个码的状态和首次使用时间。常见原因是链接被平台或群聊预加载扫过（微信/QQ 会提前抓取链接），这种情况把 `maxUses` 调到 2-3，或改用壳页链接 `/go?code=...`（不会被预抓）。

**测评页直接改本地 JS 能绕过吗？` 不能。`/tests/*` 由服务端挡着，删掉页面里的 `gate-client.js` 只是没了水印，页面照样打不开。
