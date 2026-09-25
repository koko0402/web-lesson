/* ============================================================
   web-lesson / ref.js — 資料ページ用
   ・表の行をしぼり込む検索
   ・<script class="code"> をコードブロックに変換（deck.js と同じ）
   ============================================================ */
(function () {
  'use strict';

  /* ---------- コードブロック ---------- */
  var esc = function (s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };

  function dedent(src) {
    var lines = src.replace(/\t/g, '  ').split('\n');
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    var min = Infinity;
    lines.forEach(function (l) { if (l.trim()) min = Math.min(min, l.match(/^ */)[0].length); });
    if (!isFinite(min)) min = 0;
    return lines.map(function (l) { return l.slice(min); }).join('\n');
  }

  function scan(text, re, paint) {
    var out = '', last = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(text)) !== null) {
      if (m.index === re.lastIndex) { re.lastIndex++; continue; }
      out += text.slice(last, m.index) + paint(m);
      last = m.index + m[0].length;
    }
    return out + text.slice(last);
  }
  var span = function (c, t) { return '<span class="' + c + '">' + t + '</span>'; };

  function hlHTML(t) {
    var re = /(&lt;!--[\s\S]*?--&gt;)|(&lt;\/?)([A-Za-z][\w-]*)|("[^"]*"|'[^']*')|([A-Za-z-]+)(?=\s*=)|(\/?&gt;)/g;
    return scan(t, re, function (m) {
      if (m[1]) return span('c-com', m[1]);
      if (m[3]) return span('c-brk', m[2]) + span('c-tag', m[3]);
      if (m[4]) return span('c-str', m[4]);
      if (m[5]) return span('c-atr', m[5]);
      if (m[6]) return span('c-brk', m[6]);
      return m[0];
    });
  }
  function hlCSS(t) {
    var re = /(\/\*[\s\S]*?\*\/)|("[^"]*"|'[^']*')|(@[\w-]+)|(#[0-9a-fA-F]{3,8}\b)|(-?\d*\.?\d+(?:px|rem|em|%|s|ms|vh|vw|deg|fr|ch)?\b)|([-a-zA-Z]+)(?=\s*:)|([.#:][\w-]+)/g;
    return scan(t, re, function (m) {
      if (m[1]) return span('c-com', m[1]);
      if (m[2]) return span('c-str', m[2]);
      if (m[3]) return span('c-at', m[3]);
      if (m[4] || m[5]) return span('c-num', m[4] || m[5]);
      if (m[6]) return span('c-prp', m[6]);
      if (m[7]) return span('c-sel', m[7]);
      return m[0];
    });
  }
  var KW = 'const|let|var|function|return|if|else|for|while|do|of|in|new|class|this|true|false|null|' +
           'undefined|switch|case|break|continue|try|catch|finally|throw|typeof|await|async|delete|' +
           'document|window|console|Math|JSON|localStorage';
  function hlJS(t) {
    var re = new RegExp('(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)|(`[^`]*`|"[^"]*"|\'[^\']*\')|\\b(' + KW +
                        ')\\b|\\b(\\d+(?:\\.\\d+)?)\\b|([A-Za-z_$][\\w$]*)(?=\\s*\\()', 'g');
    return scan(t, re, function (m) {
      if (m[1]) return span('c-com', m[1]);
      if (m[2]) return span('c-str', m[2]);
      if (m[3]) return span('c-key', m[3]);
      if (m[4]) return span('c-num', m[4]);
      if (m[5]) return span('c-fn', m[5]);
      return m[0];
    });
  }

  function buildCode() {
    Array.prototype.forEach.call(document.querySelectorAll('script.code'), function (n) {
      var raw = dedent(n.textContent).split('<\\/').join('</');
      var lang = n.dataset.lang || 'txt';
      var t = esc(raw);
      var html = lang === 'html' ? hlHTML(t) : lang === 'css' ? hlCSS(t) : lang === 'js' ? hlJS(t) : t;
      var pre = document.createElement('pre');
      pre.className = 'code';
      pre.innerHTML = html;
      n.parentNode.replaceChild(pre, n);
    });
  }

  /* ---------- しぼり込み検索 ---------- */
  function setupSearch() {
    var box = document.querySelector('.search input');
    if (!box) return;
    var hit = document.querySelector('.search .hit');
    var rows = Array.prototype.slice.call(document.querySelectorAll('table tr'));
    var body = rows.filter(function (r) { return !r.querySelector('th'); });

    function apply() {
      var q = box.value.trim().toLowerCase();
      var n = 0;
      body.forEach(function (r) {
        var show = !q || r.textContent.toLowerCase().indexOf(q) !== -1;
        r.classList.toggle('hidden', !show);
        if (show) n++;
      });
      // 中身が全部消えたセクションは見出しごと隠す
      Array.prototype.forEach.call(document.querySelectorAll('section[data-sec]'), function (sec) {
        var any = Array.prototype.some.call(sec.querySelectorAll('table tr'), function (r) {
          return !r.querySelector('th') && !r.classList.contains('hidden');
        });
        sec.style.display = (!q || any) ? '' : 'none';
      });
      if (hit) hit.textContent = q ? n + ' 件' : body.length + ' 件';
    }

    box.addEventListener('input', apply);
    apply();
  }

  function init() { buildCode(); setupSearch(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
