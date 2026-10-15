/**
 * gate-client.js —— 测评页接入契约（每个测评页只需加一行）
 * ------------------------------------------------------------------
 * 用法：在测评页 </body> 前加
 *     <script src="/gate-client.js"></script>
 *
 * 它做三件事：
 *   1. 从 URL 的 ?c= 或 Cookie 里取出授权码尾号与备注
 *   2. 在右下角渲染半透明水印（截图溯源 / 维权举证用）
 *   3. 检测到没有门禁时，提示「请从授权码入口进入」（不阻塞页面）
 *
 * 注意：这个文件只负责展示，不负责校验——校验在服务端做。
 *      任何人删掉本地这个 script 也进不来（/tests/* 被服务端挡着）。
 */
(function () {
  'use strict';

  function getCookie(name) {
    const m = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  }

  function readInfo() {
    var info = { test: '', tail: '', note: '' };
    // 1) URL 优先
    var c = new URLSearchParams(location.search).get('c');
    if (c) {
      info.tail = String(c).replace(/-/g, '').slice(-4).toUpperCase();
      try {
        var d = JSON.parse(atob(getCookie('gate_display').replace(/-/g, '+').replace(/_/g, '/')));
        if (d) { info.note = d.note || ''; info.test = d.test || ''; }
      } catch (e) {}
      return info;
    }
    // 2) Cookie
    try {
      var raw = getCookie('gate_display');
      if (raw) {
        var d2 = JSON.parse(atob(raw.replace(/-/g, '+').replace(/_/g, '/')));
        if (d2) { info.tail = d2.tail || ''; info.note = d2.note || ''; info.test = d2.test || ''; }
      }
    } catch (e) {}
    return info;
  }

  function hasGate() {
    return !!getCookie('gate_token') || !!new URLSearchParams(location.search).get('c');
  }

  function mountWatermark(info) {
    if (document.getElementById('__gate_wm__')) return;
    var style = document.createElement('style');
    style.textContent =
      '#__gate_wm__{position:fixed;right:10px;bottom:8px;z-index:99999;pointer-events:none;' +
      'font:11px/1.5 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;' +
      'color:rgba(120,110,150,.42);text-align:right;letter-spacing:.02em;user-select:none}' +
      '#__gate_wm__ b{font-weight:600;color:rgba(120,110,150,.55)}';
    document.head.appendChild(style);

    var el = document.createElement('div');
    el.id = '__gate_wm__';
    var text = info.note
      ? '授权 · ' + info.note + ' · 尾号 <b>' + info.tail + '</b>'
      : '授权 · 尾号 <b>' + info.tail + '</b>';
    el.innerHTML = text;
    document.body.appendChild(el);
  }

  function mountNotice() {
    if (document.getElementById('__gate_notice__')) return;
    var style = document.createElement('style');
    style.textContent =
      '#__gate_notice__{position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:99999;' +
      'background:#2b2440;color:#fff;font:12px/1.6 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;' +
      'padding:7px 14px;border-radius:999px;box-shadow:0 6px 20px rgba(43,36,64,.25);white-space:nowrap}' +
      '#__gate_notice__ a{color:#c9b8ff;margin-left:8px}';
    document.head.appendChild(style);
    var el = document.createElement('div');
    el.id = '__gate_notice__';
    el.innerHTML = '请从授权码入口进入 <a href="/">获取入口</a>';
    document.body.appendChild(el);
    setTimeout(function () { el.style.opacity = '.75'; }, 4000);
  }

  function boot() {
    var info = readInfo();
    if (hasGate()) {
      try { localStorage.setItem('__gate_info__', JSON.stringify(info)); } catch (e) {}
      mountWatermark(info);
    } else {
      try {
        var saved = JSON.parse(localStorage.getItem('__gate_info__') || 'null');
        if (saved && saved.tail) { mountWatermark(saved); return; }
      } catch (e) {}
      mountNotice();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
