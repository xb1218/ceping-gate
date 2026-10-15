/**
 * 测评授权码系统 · 服务端（零依赖）
 * ------------------------------------------------------------------
 * 作用：所有测评页的统一门禁。
 *   1. 批量生成授权码（管理后台 / CLI）
 *   2. 校验授权码，通过后签发「签名 Cookie」
 *   3. 只有持有有效 Cookie 才能访问 /tests/* 下的测评页
 *   4. 首次使用即核销（默认 maxUses=1），转发给别人会提示「已被使用」
 *
 * 运行：node server.js        默认 http://localhost:8787
 * 环境变量：PORT / ISSUE_TOKEN / DATA_DIR / PUBLIC_URL（对外 base，用于生成兑换短链）
 *          / ADMIN_PASSWORD（可选，覆盖下面的管理密码常量）
 * 说明：管理后台（/admin 及 /api/admin/*）公网可访问，需**密码登录**（见 ADMIN_PASSWORD）；
 *       仅 /api/issue（自动发货调用）需配 ISSUE_TOKEN。
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ------------------------------------------------------------------
// 基础配置
// ------------------------------------------------------------------
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const CONFIG_DIR = path.join(ROOT, 'config');
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(ROOT, 'data');
const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '0.0.0.0';

const CODES_FILE = path.join(DATA_DIR, 'codes.json');
const SECRET_FILE = path.join(DATA_DIR, 'secret.key');
const TESTS_FILE = path.join(CONFIG_DIR, 'tests.json');

// 授权码字符集：剔除容易看错的 0/O/1/I/L/2/Z/5/S/B
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXY346789';
const COOKIE_NAME = 'gate_token';
const COOKIE_DISPLAY = 'gate_display';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 天

// ------------------------------------------------------------------
// 小工具
// ------------------------------------------------------------------
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return fallback;
  }
}

function writeJsonAtomic(file, obj) {
  ensureDir(path.dirname(file));
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2), 'utf8');
  fs.renameSync(tmp, file);
}

const b64url = (buf) => Buffer.from(buf).toString('base64url');
const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');

function getSecret() {
  ensureDir(DATA_DIR);
  if (fs.existsSync(SECRET_FILE)) return fs.readFileSync(SECRET_FILE, 'utf8').trim();
  const s = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(SECRET_FILE, s, 'utf8');
  return s;
}
const SECRET = getSecret();

// 即时签发令牌：供自动发货工具（阿奇索接口发货）在下单后调用本服务现场生成码。
// 仅 /api/issue 使用，且只在公网访问时需要；本机直连免令牌。
// 未设置则公网签发被锁定（返回 401），避免「谁都能刷码」。
const ISSUE_TOKEN = process.env.ISSUE_TOKEN || '';

// ------------------------------------------------------------------
// 管理后台登录（密码常量 + 签名会话 Cookie）
// ------------------------------------------------------------------
// 密码直接写死在服务端常量里（可被环境变量覆盖）。改这里即可换密码，旧会话立即失效。
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'jy120218';
const ADMIN_COOKIE = 'admin_session';
const ADMIN_SESSION_AGE = 7 * 24 * 60 * 60; // 登录后 7 天内免重复输入

// 会话签名密钥由密码派生：同一份代码在任何实例上一致，不依赖 data/ 目录，也免疫重新部署
const ADMIN_KEY = crypto.createHash('sha256').update('admin-session:' + ADMIN_PASSWORD).digest();

function signAdminSession() {
  const body = b64url(JSON.stringify({ a: 'admin', e: Date.now() + ADMIN_SESSION_AGE * 1000 }));
  const sig = crypto.createHmac('sha256', ADMIN_KEY).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function isAdmin(req) {
  const token = parseCookies(req)[ADMIN_COOKIE];
  if (!token) return false;
  const i = token.lastIndexOf('.');
  if (i <= 0) return false;
  const body = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expect = crypto.createHmac('sha256', ADMIN_KEY).update(body).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expect);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return p && p.a === 'admin' && p.e > Date.now();
  } catch (e) {
    return false;
  }
}

// 恒定时间比较密码（避免按字符比较泄漏时序）
function passwordOk(input) {
  const a = crypto.createHash('sha256').update(String(input || '')).digest();
  const b = crypto.createHash('sha256').update(ADMIN_PASSWORD).digest();
  return crypto.timingSafeEqual(a, b);
}

// ------------------------------------------------------------------
// 数据层：授权码库（内存缓存 + 原子落盘）
// ------------------------------------------------------------------
let codes = readJson(CODES_FILE, {}); // { [code]: {...} }
let dirty = false;

function saveCodes() {
  if (!dirty) return;
  writeJsonAtomic(CODES_FILE, codes);
  dirty = false;
}
setInterval(saveCodes, 2000).unref();
process.on('exit', saveCodes);
process.on('SIGINT', () => { saveCodes(); process.exit(0); });
process.on('SIGTERM', () => { saveCodes(); process.exit(0); });

function loadTests() {
  const cfg = readJson(TESTS_FILE, { tests: [] });
  return Array.isArray(cfg.tests) ? cfg.tests : [];
}
function findTest(id) {
  return loadTests().find((t) => t.id === id) || null;
}

// 码的状态
function codeStatus(rec) {
  if (!rec) return 'missing';
  if (rec.revoked) return 'revoked';
  if (rec.maxUses > 0 && rec.usedCount >= rec.maxUses) return 'exhausted';
  if (rec.usedCount > 0) return 'active';
  return 'unused';
}

function genCode(prefix, count) {
  const chars = CODE_CHARS;
  const pick = (n) => {
    let s = '';
    const b = crypto.randomBytes(n);
    for (let i = 0; i < n; i++) s += chars[b[i] % chars.length];
    return s;
  };
  for (let guard = 0; guard < 5000; guard++) {
    const c = `${prefix}-${pick(4)}-${pick(4)}`;
    if (!codes[c]) return c;
  }
  return `${prefix}-${pick(4)}-${pick(4)}-${pick(2)}`;
}

// ------------------------------------------------------------------
// Cookie 签发与校验
// ------------------------------------------------------------------
function sign(payloadObj) {
  const body = b64url(JSON.stringify(payloadObj));
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function unsign(token) {
  if (!token || typeof token !== 'string') return null;
  const i = token.lastIndexOf('.');
  if (i <= 0) return null;
  const body = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expect = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  // 恒定时间比较
  const a = Buffer.from(sig);
  const b = Buffer.from(expect);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch (e) {
    return null;
  }
}

function issueCookies(res, testId, code, note) {
  const exp = Date.now() + COOKIE_MAX_AGE * 1000;
  const token = sign({ t: testId, c: sha256(code), e: exp });
  const display = b64url(JSON.stringify({
    test: testId,
    tail: String(code).slice(-4),
    note: note || ''
  }));
  const cookie = (k, v, httpOnly) =>
    `${k}=${v}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${httpOnly ? '; HttpOnly' : ''}`;
  res.setHeader('Set-Cookie', [cookie(COOKIE_NAME, token, true), cookie(COOKIE_DISPLAY, display, false)]);
}

function parseCookies(req) {
  const out = {};
  const raw = req.headers.cookie || '';
  raw.split(';').forEach((p) => {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}

// 判断本次请求是否有权访问某个 testId
function authorizedFor(req, testId) {
  const c = parseCookies(req)[COOKIE_NAME];
  const p = unsign(c);
  if (!p) return false;
  if (!p.e || p.e < Date.now()) return false;
  return p.t === testId;
}

// 「同一个浏览器在用同一张码」判定。
// 签发 Cookie 时把码的哈希存进了 c 字段，所以这里能确认：这枚有效 Cookie 就是
// 用这张码、在这个测试上签发的 —— 是本人在返回上一页 / 重复点开链接，而不是转发给了别人。
// 用途：这种重复进入不再消耗使用次数（一次性码用完后，买家一按返回就卡在「已被使用」）。
function isSameDeviceCode(req, testId, code) {
  const p = unsign(parseCookies(req)[COOKIE_NAME]);
  return !!(p && p.e > Date.now() && p.t === testId && p.c === sha256(code));
}

// 判断请求是否来自本机直连（用于本地免令牌管理）
// 经过公网代理（带 X-Forwarded-For）一律视为远程，必须令牌。
function isLocalRequest(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) return false; // 有代理头 = 公网，需要令牌
  const remote = (req.socket && req.socket.remoteAddress) || '';
  return remote === '127.0.0.1' || remote === '::1' || remote === '::ffff:127.0.0.1';
}

// 管理接口需登录态（密码登录后签发的签名 Cookie）。
function requireAdmin(req, res) {
  if (isAdmin(req)) return true;
  sendJson(res, 401, { ok: false, message: '未登录或登录已失效' });
  return false;
}

// ------------------------------------------------------------------
// HTTP 辅助
// ------------------------------------------------------------------
function sendJson(res, code, obj) {
  const s = JSON.stringify(obj);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(s);
}

function sendHtml(res, code, html) {
  res.writeHead(code, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

function readBody(req, limit = 64 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(new Error('body too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch (e) { reject(new Error('invalid json')); }
    });
    req.on('error', reject);
  });
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

function serveStatic(res, filePath, notFoundRedirect) {
  fs.readFile(filePath, (err, buf) => {
    if (err) {
      if (notFoundRedirect) {
        res.writeHead(302, { Location: notFoundRedirect });
        res.end();
      } else {
        sendHtml(res, 404, '<h1>404</h1>');
      }
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(buf);
  });
}

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// ------------------------------------------------------------------
// 业务：校验授权码
// ------------------------------------------------------------------
// 归一化：只做大写 + 去空白。
// 注意：不要做 O→0 / L→1 这类字符替换——随机段字符集已剔除易混字符，
// 而前缀是自定义的（如默认的 "LA" 就含 L），替换会导致正确输入也匹配不上。
function normalizeCode(raw) {
  return String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/[\s\u3000]/g, '');
}

async function handleVerify(req, res, body) {
  const code = normalizeCode(body.code);
  const testId = String(body.test || '').trim();
  if (!code) return sendJson(res, 400, { ok: false, reason: 'empty', message: '请输入授权码' });
  if (!testId) return sendJson(res, 400, { ok: false, reason: 'no_test', message: '缺少测试标识' });

  const test = findTest(testId);
  if (!test) return sendJson(res, 404, { ok: false, reason: 'no_test', message: '测试不存在' });
  if (test.status !== 'online') {
    return sendJson(res, 403, { ok: false, reason: 'offline', message: '该测试暂未上架' });
  }

  const rec = codes[code];
  if (!rec) {
    return sendJson(res, 200, { ok: false, reason: 'not_found', message: '授权码不存在，请检查后重试' });
  }
  if (rec.revoked) {
    return sendJson(res, 200, { ok: false, reason: 'revoked', message: '该授权码已被作废' });
  }
  if (rec.testId !== '*' && rec.testId !== testId) {
    const bound = findTest(rec.testId);
    return sendJson(res, 200, {
      ok: false,
      reason: 'wrong_test',
      message: `该授权码适用于「${bound ? bound.name : rec.testId}」，不能用于本测试`,
      testId: rec.testId
    });
  }
  // 同机复用：这一枚有效 Cookie 就是本码在本测试上签发的 → 是买家自己回来，不消耗次数。
  const reentry = isSameDeviceCode(req, testId, code);

  const st = codeStatus(rec);
  if (st === 'exhausted' && !reentry) {
    return sendJson(res, 200, {
      ok: false,
      reason: 'exhausted',
      message: '该授权码已被使用过，无法重复进入',
      note: rec.note || ''
    });
  }

  // 通过：核销 + 发 Cookie（同机复用只刷新 Cookie，不重复计数）
  if (!reentry) {
    rec.usedCount = (rec.usedCount || 0) + 1;
    if (!rec.firstUsedAt) rec.firstUsedAt = new Date().toISOString();
    rec.lastUsedAt = new Date().toISOString();
    dirty = true;
    saveCodes();
  }

  issueCookies(res, testId, code, rec.note);
  if (reentry) log(`同机复用放行 尾号${String(code).slice(-4)} → ${testId}`);

  return sendJson(res, 200, {
    ok: true,
    reentry,
    redirect: `/tests/${testId}`,
    testId,
    testName: test.name,
    remaining: rec.maxUses > 0 ? Math.max(0, rec.maxUses - rec.usedCount) : -1,
    note: rec.note || ''
  });
}

// ------------------------------------------------------------------
// 管理 API
// ------------------------------------------------------------------
function checkAdmin(req) {
  // 路由层已用 requireAdmin 拦住未登录请求，这里再做一次兜底。
  return isAdmin(req);
}

// 登录限流：同一来源 10 分钟内错 8 次即锁定，防止公网爆破
const loginFails = new Map(); // ip -> { n, t }
const LOGIN_MAX_FAILS = 8;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;

function clientIp(req) {
  const xff = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return xff || (req.socket && req.socket.remoteAddress) || 'unknown';
}

async function handleAdminLogin(req, res, body) {
  const ip = clientIp(req);
  const rec = loginFails.get(ip);
  const fresh = rec && Date.now() - rec.t < LOGIN_WINDOW_MS ? rec : null;
  if (fresh && fresh.n >= LOGIN_MAX_FAILS) {
    return sendJson(res, 429, { ok: false, message: '密码错误次数过多，请 10 分钟后再试' });
  }
  if (!passwordOk(body.password)) {
    const n = fresh ? fresh.n + 1 : 1;
    loginFails.set(ip, { n, t: Date.now() });
    log(`管理登录失败 ip=${ip}（第 ${n} 次）`);
    return sendJson(res, 401, { ok: false, message: '密码不正确' });
  }
  loginFails.delete(ip);
  res.setHeader(
    'Set-Cookie',
    `${ADMIN_COOKIE}=${signAdminSession()}; Path=/; Max-Age=${ADMIN_SESSION_AGE}; SameSite=Lax; HttpOnly`
  );
  log(`管理登录成功 ip=${ip}`);
  return sendJson(res, 200, { ok: true, message: '登录成功' });
}

function handleAdminLogout(req, res) {
  res.setHeader('Set-Cookie', `${ADMIN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly`);
  return sendJson(res, 200, { ok: true, message: '已退出登录' });
}

// 即时签发校验：本机直连免令牌；公网需带 x-issue-token（= ISSUE_TOKEN）
function checkIssue(req, body) {
  if (isLocalRequest(req)) return true;
  const h = req.headers['x-issue-token'] || '';
  const b = body && body.token ? String(body.token) : '';
  return (h && h === ISSUE_TOKEN) || (b && b === ISSUE_TOKEN);
}

async function handleAdminGenerate(req, res, body) {
  if (!checkAdmin(req, body)) return sendJson(res, 401, { ok: false, message: '管理令牌不正确' });
  const count = Math.min(500, Math.max(1, parseInt(body.count, 10) || 1));
  const testId = String(body.testId || '*').trim();
  if (testId !== '*' && !findTest(testId)) {
    return sendJson(res, 400, { ok: false, message: '测试不存在' });
  }
  const maxUses = body.maxUses === 0 ? 0 : Math.max(1, parseInt(body.maxUses, 10) || 1);
  const prefix = String(body.prefix || 'TEST').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'TEST';
  const note = String(body.note || '').slice(0, 60);

  const out = [];
  for (let i = 0; i < count; i++) {
    const c = genCode(prefix);
    codes[c] = {
      code: c,
      testId,
      prefix,
      maxUses,
      usedCount: 0,
      note,
      createdAt: new Date().toISOString(),
      firstUsedAt: null,
      lastUsedAt: null,
      revoked: false
    };
    out.push(c);
  }
  dirty = true;
  saveCodes();
  log(`生成 ${out.length} 个授权码 testId=${testId} maxUses=${maxUses}`);
  return sendJson(res, 200, { ok: true, codes: out });
}

// 即时签发：下单后由自动发货工具调用，现场生成一个（或多个）码并返回兑换短链。
// 零库存：不依赖预生成码池，永不出现「码不够发不出货」。
async function handleIssue(req, res, body) {
  if (!checkIssue(req, body)) return sendJson(res, 401, { ok: false, message: '签发令牌不正确' });
  const testId = String(body.testId || '*').trim();
  if (testId !== '*' && !findTest(testId)) {
    return sendJson(res, 400, { ok: false, message: '测试不存在' });
  }
  const count = Math.min(50, Math.max(1, parseInt(body.count, 10) || 1));
  const maxUses = body.maxUses === 0 ? 0 : Math.max(1, parseInt(body.maxUses, 10) || 1);
  const defPrefix = testId === '*' ? 'ALL' : (findTest(testId) ? findTest(testId).id.slice(0, 4).toUpperCase() : 'TEST');
  const prefix = String(body.prefix || defPrefix).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'TEST';
  const note = String(body.note || '').slice(0, 60);
  const host = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${PORT}`;
  const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim() || 'https';
  // 对外 base：反向代理不透传原始域名时（Host 变成沙箱内部名），用 PUBLIC_URL 指定公网域名
  const base = process.env.PUBLIC_URL ? process.env.PUBLIC_URL.replace(/\/+$/, '') : `${proto}://${host}`;

  const out = [];
  for (let i = 0; i < count; i++) {
    const c = genCode(prefix);
    codes[c] = {
      code: c, testId, prefix, maxUses, usedCount: 0,
      note, createdAt: new Date().toISOString(), firstUsedAt: null, lastUsedAt: null, revoked: false
    };
    // 指定测试：直接给「一键进测试」的直链（买家点一下即核销进入，零输入）
    // 通用码(*)：给 /go 短链（壳页带码，让用户自选测试）
    const direct = testId === '*'
      ? `${base}/go?code=${encodeURIComponent(c)}&test=*`
      : `${base}/tests/${encodeURIComponent(testId)}.html?c=${encodeURIComponent(c)}`;
    out.push({ code: c, redeemUrl: direct });
  }
  dirty = true;
  saveCodes();
  log(`即时签发 ${out.length} 个 testId=${testId} note=${note || '-'}`);
  return sendJson(res, 200, { ok: true, testId, count: out.length, codes: out });
}

function handleAdminList(req, res, url) {
  const filter = url.searchParams.get('test') || '';
  const rows = Object.values(codes)
    .filter((r) => !filter || r.testId === filter)
    .map((r) => ({
      code: r.code,
      testId: r.testId,
      maxUses: r.maxUses,
      usedCount: r.usedCount || 0,
      status: codeStatus(r),
      note: r.note || '',
      createdAt: r.createdAt,
      firstUsedAt: r.firstUsedAt
    }))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const stats = {
    total: rows.length,
    unused: rows.filter((r) => r.status === 'unused').length,
    active: rows.filter((r) => r.status === 'active').length,
    exhausted: rows.filter((r) => r.status === 'exhausted').length,
    revoked: rows.filter((r) => r.status === 'revoked').length
  };
  return sendJson(res, 200, { ok: true, stats, rows });
}

async function handleAdminRevoke(req, res, body) {
  if (!checkAdmin(req, body)) return sendJson(res, 401, { ok: false, message: '管理令牌不正确' });
  const code = normalizeCode(body.code);
  const rec = codes[code];
  if (!rec) return sendJson(res, 404, { ok: false, message: '授权码不存在' });
  rec.revoked = true;
  dirty = true;
  saveCodes();
  return sendJson(res, 200, { ok: true, message: `已作废 ${code}` });
}

// ------------------------------------------------------------------
// 路由
// ------------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const p = decodeURIComponent(url.pathname);

    // 健康检查
    if (p === '/healthz') return sendJson(res, 200, { ok: true, uptime: process.uptime() });

    // 公开配置（壳页用：有哪些测试）
    if (p === '/api/config') {
      const tests = loadTests()
        .filter((t) => t.status === 'online')
        .map((t) => ({ id: t.id, name: t.name, subtitle: t.subtitle || '', price: t.price || 0 }));
      return sendJson(res, 200, { ok: true, tests });
    }

    // 校验授权码
    if (p === '/api/verify' && req.method === 'POST') {
      const body = await readBody(req);
      return handleVerify(req, res, body);
    }

    // 管理登录 / 退出（公开：登录动作本身不能要求已登录）
    if (p === '/api/admin/login' && req.method === 'POST') {
      const body = await readBody(req);
      return handleAdminLogin(req, res, body);
    }
    if (p === '/api/admin/logout' && req.method === 'POST') {
      return handleAdminLogout(req, res);
    }

    // 其余管理 API：需要密码登录后的会话 Cookie
    if (p.startsWith('/api/admin/')) {
      if (!requireAdmin(req, res)) return;
    }
    if (p === '/api/admin/tests') {
      const tests = loadTests().map((t) => ({
        id: t.id, name: t.name, subtitle: t.subtitle || '', price: t.price || 0, status: t.status || 'offline'
      }));
      return sendJson(res, 200, { ok: true, tests });
    }
    if (p === '/api/admin/generate' && req.method === 'POST') {
      const body = await readBody(req);
      return handleAdminGenerate(req, res, body);
    }
    // 即时签发（下单后由自动发货工具调用，现场生成码 + 返回兑换短链）
    if (p === '/api/issue' && req.method === 'POST') {
      const body = await readBody(req);
      return handleIssue(req, res, body);
    }
    if (p === '/api/admin/list') return handleAdminList(req, res, url);
    if (p === '/api/admin/revoke' && req.method === 'POST') {
      const body = await readBody(req);
      return handleAdminRevoke(req, res, body);
    }

    // 壳页与管理后台
    if (p === '/' || p === '/index.html') {
      return serveStatic(res, path.join(PUBLIC_DIR, 'index.html'));
    }
    if (p === '/admin' || p === '/admin.html') {
      // 页面本身公开（只是登录框），列表/生成等数据接口一律要求登录态
      return serveStatic(res, path.join(PUBLIC_DIR, 'admin.html'));
    }
    if (p === '/gate-client.js') {
      return serveStatic(res, path.join(PUBLIC_DIR, 'gate-client.js'));
    }

    // 兼容入口：/go?code=XXX&test=lianai
    if (p === '/go') {
      const q = `?code=${encodeURIComponent(url.searchParams.get('code') || '')}&test=${encodeURIComponent(url.searchParams.get('test') || '')}`;
      res.writeHead(302, { Location: '/' + q });
      return res.end();
    }

    // 测评页：门禁
    if (p.startsWith('/tests/')) {
      const rel = p.slice('/tests/'.length);
      const testId = rel.replace(/\.html?$/i, '');
      const test = findTest(testId);

      // 预览模式（自测用，不消耗授权码）
      const preview = url.searchParams.get('preview');
      if (preview && process.env.PREVIEW_TOKEN && preview === process.env.PREVIEW_TOKEN) {
        return serveStatic(res, path.join(PUBLIC_DIR, 'tests', test ? test.file : rel));
      }
      // 链接自带授权码：服务端直接校验，通过则发 Cookie 并放行
      const c = normalizeCode(url.searchParams.get('c'));
      if (c) {
        const rec = codes[c];
        const st = codeStatus(rec);
        const online = test && test.status === 'online';
        const okRec = rec && !rec.revoked && st !== 'exhausted' &&
          (rec.testId === '*' || rec.testId === testId) && online;
        if (okRec) {
          rec.usedCount = (rec.usedCount || 0) + 1;
          if (!rec.firstUsedAt) rec.firstUsedAt = new Date().toISOString();
          rec.lastUsedAt = new Date().toISOString();
          dirty = true; saveCodes();
          issueCookies(res, testId, c, rec.note);
          return serveStatic(res, path.join(PUBLIC_DIR, 'tests', test.file));
        }
        // 码已用光，但本机 Cookie 就是它签发的 → 买家重复点开同一条链接，直接放行
        if (rec && !rec.revoked && online && isSameDeviceCode(req, testId, c)) {
          issueCookies(res, testId, c, rec.note);
          log(`同机复用放行 尾号${String(c).slice(-4)} → ${testId}`);
          return serveStatic(res, path.join(PUBLIC_DIR, 'tests', test.file));
        }
        const reason = !rec ? 'not_found' : rec.revoked ? 'revoked'
          : st === 'exhausted' ? 'exhausted'
          : (rec.testId !== '*' && rec.testId !== testId) ? 'wrong_test' : 'offline';
        const q = `?code=${encodeURIComponent(c)}&test=${encodeURIComponent(testId)}&err=${reason}`;
        res.writeHead(302, { Location: '/' + q });
        return res.end();
      }

      if (test && authorizedFor(req, testId)) {
        return serveStatic(res, path.join(PUBLIC_DIR, 'tests', test.file),
          `/?need=1&test=${encodeURIComponent(testId)}`);
      }
      const q = test ? `?need=1&test=${encodeURIComponent(testId)}` : '/';
      res.writeHead(302, { Location: '/' + q });
      return res.end();
    }

    // 其它静态资源（public 下其它文件）
    if (p.includes('..')) return sendHtml(res, 400, '<h1>400</h1>');
    const safe = path.normalize(p).replace(/^(\.\.[/\\])+/, '');
    const fp = path.join(PUBLIC_DIR, safe);
    if (fp.startsWith(PUBLIC_DIR) && fs.existsSync(fp) && fs.statSync(fp).isFile()) {
      return serveStatic(res, fp);
    }

    sendHtml(res, 404, '<h1>404</h1><p><a href="/">返回入口</a></p>');
  } catch (err) {
    log('ERROR', err.message);
    if (!res.headersSent) sendJson(res, 500, { ok: false, message: '服务器错误：' + err.message });
  }
});

server.listen(PORT, HOST, () => {
  log('==========================================');
  log('  测评授权码系统已启动');
  log(`  入口页  http://localhost:${PORT}/`);
  log(`  管理页  http://localhost:${PORT}/admin  （密码登录；公网同一入口）`);
  if (ISSUE_TOKEN) {
    log('  发货签发令牌(ISSUE_TOKEN) 已设置 → 公网自动发货可用');
  } else {
    log('  发货签发令牌未设置 → /api/issue 仅本机可用；公网发货请先设 ISSUE_TOKEN');
  }
  log('==========================================');
});
