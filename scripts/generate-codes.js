#!/usr/bin/env node
/**
 * 命令行批量生成授权码（服务端没启动时也能用）
 * 用法：
 *   node scripts/generate-codes.js --count 20 --prefix LA --test lianai --uses 1 --note "买家A"
 *   node scripts/generate-codes.js --count 100 --test "*"          # 通用码，任选测试
 *   node scripts/generate-codes.js --count 5 --test lianai --uses 0  # 演示码，不限次
 * 输出：打印到终端，并写入 data/codes.json
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const CODES_FILE = path.join(ROOT, 'data', 'codes.json');
const TESTS_FILE = path.join(ROOT, 'config', 'tests.json');
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXY346789';

function arg(name, def) {
  const i = process.argv.indexOf('--' + name);
  if (i === -1) return def;
  const v = process.argv[i + 1];
  return v && !v.startsWith('--') ? v : def;
}

const count = Math.min(500, Math.max(1, parseInt(arg('count', '10'), 10) || 10));
const prefix = String(arg('prefix', 'TEST')).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'TEST';
const testId = String(arg('test', '*')).trim();
const maxUses = arg('uses', '1') === '0' ? 0 : Math.max(1, parseInt(arg('uses', '1'), 10) || 1);
const note = String(arg('note', '')).slice(0, 60);

// 校验测试是否存在
try {
  const cfg = JSON.parse(fs.readFileSync(TESTS_FILE, 'utf8'));
  if (testId !== '*' && !(cfg.tests || []).some((t) => t.id === testId)) {
    console.error('测试不存在：' + testId + '，可用：' + (cfg.tests || []).map((t) => t.id).join(', ') + ' 或 *');
    process.exit(1);
  }
} catch (e) {
  console.error('读取 config/tests.json 失败：' + e.message);
  process.exit(1);
}

let codes = {};
try { codes = JSON.parse(fs.readFileSync(CODES_FILE, 'utf8')); } catch (e) {}

const pick = (n) => {
  let s = '';
  const b = crypto.randomBytes(n);
  for (let i = 0; i < n; i++) s += CODE_CHARS[b[i] % CODE_CHARS.length];
  return s;
};

const out = [];
for (let i = 0; i < count; i++) {
  let c;
  do { c = `${prefix}-${pick(4)}-${pick(4)}`; } while (codes[c]);
  codes[c] = {
    code: c, testId, prefix, maxUses, usedCount: 0, note,
    createdAt: new Date().toISOString(), firstUsedAt: null, lastUsedAt: null, revoked: false
  };
  out.push(c);
}

fs.mkdirSync(path.dirname(CODES_FILE), { recursive: true });
fs.writeFileSync(CODES_FILE, JSON.stringify(codes, null, 2), 'utf8');

console.log('');
out.forEach((c) => console.log(c));
console.log('');
console.log(`已生成 ${out.length} 个授权码｜适用测试：${testId}｜可用次数：${maxUses === 0 ? '不限' : maxUses}${note ? '｜备注：' + note : ''}`);
console.log('交付链接示例：http://localhost:8787/go?code=' + out[0] + '&test=' + (testId === '*' ? 'lianai' : testId));
console.log('（正式用时把 localhost:8787 换成你的域名）');
