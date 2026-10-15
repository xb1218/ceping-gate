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

  // base64url → 对象。两个坑：
  //   1) 服务端用 base64url 编码，结尾的 = 填充被去掉了，直接丢给 atob 会抛异常；
  //   2) atob 返回的是按 Latin-1 解读的串，里面的中文（UTF-8 字节）会变成乱码，
  //      所以要再按 UTF-8 解一遍，否则备注会显示成「ä¹°å®¶å¼ ä¸」这种。
  function decodeDisplay(raw) {
    if (!raw) return null;
    try {
      var s = String(raw).replace(/-/g, '+').replace(/_/g, '/');
      var pad = s.length % 4;
      if (pad) s += '===='.slice(pad);
      var bin = atob(s);
      var pct = '';
      for (var i = 0; i < bin.length; i++) {
        pct += '%' + ('00' + bin.charCodeAt(i).toString(16)).slice(-2);
      }
      var text;
      try { text = decodeURIComponent(pct); } catch (e) { text = bin; }
      return JSON.parse(text);
    } catch (e) {
      return null;
    }
  }

  function readInfo() {
    var info = { test: '', tail: '', note: '' };
    // 1) URL 优先
    var c = new URLSearchParams(location.search).get('c');
    if (c) {
      info.tail = String(c).replace(/-/g, '').slice(-4).toUpperCase();
      var dUrl = decodeDisplay(getCookie('gate_display'));
      if (dUrl) { info.note = dUrl.note || ''; info.test = dUrl.test || ''; }
      return info;
    }
    // 2) Cookie
    var d2 = decodeDisplay(getCookie('gate_display'));
    if (d2) { info.tail = d2.tail || ''; info.note = d2.note || ''; info.test = d2.test || ''; }
    return info;
  }

  // 是否从授权入口进来？
  // ⚠️ gate_token 是 HttpOnly 的，JS 读不到（故意如此，防止被脚本偷走）。
  //    之前这里只看 gate_token，于是「从授权页自动跳进测评页」这条路径
  //    （URL 上不带 ?c=，授权页用 location.replace 进来的）永远判定为没门禁，
  //    从而误弹「请从授权码入口进入」。
  //    改看 gate_display：它和 gate_token 在同一个响应里一起下发、不带 HttpOnly，
  //    正好可以作为「已授权」的标记。
  function hasGate() {
    return !!getCookie('gate_display') ||
      !!getCookie('gate_token') ||
      !!new URLSearchParams(location.search).get('c');
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
