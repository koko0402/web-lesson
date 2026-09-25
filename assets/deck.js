/* ============================================================
   web-lesson / deck.js
   ・<script type="text/plain" class="code"> をコードブロックに変換
   ・簡易シンタックスハイライト（html / css / js）
   ・スライド送り（← → Space / O で一覧 / F で全画面）
   ============================================================ */
(function () {
  'use strict';

  /* ---------- コードブロック ---------- */
  var esc = function (s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  function dedent(src) {
    var lines = src.replace(/\t/g, '  ').split('\n');
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    var min = Infinity;
    lines.forEach(function (l) {
      if (!l.trim()) return;
      min = Math.min(min, l.match(/^ */)[0].length);
    });
    if (!isFinite(min)) min = 0;
    return lines.map(function (l) { return l.slice(min); }).join('\n');
  }

  /* トークン走査。生成済みマークアップを再走査しないので壊れない */
  function scan(text, re, paint) {
    var out = '', last = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(text)) !== null) {
      if (m.index === re.lastIndex) { re.lastIndex++; continue; }
      out += text.slice(last, m.index);
      out += paint(m);
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
      if (m[4]) return span('c-num', m[4]);
      if (m[5]) return span('c-num', m[5]);
      if (m[6]) return span('c-prp', m[6]);
      if (m[7]) return span('c-sel', m[7]);
      return m[0];
    });
  }

  var KW = ('const|let|var|function|return|if|else|for|while|do|of|in|new|class|this|true|false|null|' +
            'undefined|switch|case|break|continue|try|catch|finally|throw|typeof|await|async|delete|' +
            'document|window|console|Math|JSON|localStorage').split('|').join('|');

  function hlJS(t) {
    var re = new RegExp(
      '(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)' +
      '|(`[^`]*`|"[^"]*"|\'[^\']*\')' +
      '|\\b(' + KW + ')\\b' +
      '|\\b(\\d+(?:\\.\\d+)?)\\b' +
      '|([A-Za-z_$][\\w$]*)(?=\\s*\\()', 'g');
    return scan(t, re, function (m) {
      if (m[1]) return span('c-com', m[1]);
      if (m[2]) return span('c-str', m[2]);
      if (m[3]) return span('c-key', m[3]);
      if (m[4]) return span('c-num', m[4]);
      if (m[5]) return span('c-fn', m[5]);
      return m[0];
    });
  }

  function highlight(raw, lang) {
    var t = esc(raw);
    if (lang === 'html') return hlHTML(t);
    if (lang === 'css') return hlCSS(t);
    if (lang === 'js') return hlJS(t);
    return t;
  }

  /* クリップボードにコピー。
     file:// で開いたときは navigator.clipboard が使えないことがあるので、
     昔ながらの textarea + execCommand を予備として持っておく */
  function copyText(text, btn) {
    var done = function (ok) {
      btn.textContent = ok ? 'コピーした！' : 'コピーできません';
      setTimeout(function () { btn.textContent = 'コピー'; }, 1400);
    };
    var fallback = function () {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        done(ok);
      } catch (e) { done(false); }
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    } else {
      fallback();
    }
  }

  function buildCode() {
    var nodes = document.querySelectorAll('script.code');
    Array.prototype.forEach.call(nodes, function (n) {
      // 教材で </script> を見せたい場合、HTML側では <\/script> と書いてある。
      // 表示するときは本来の形に戻す。
      var raw = dedent(n.textContent).split('<\\/').join('</');
      var pre = document.createElement('pre');
      pre.className = 'code ' + (n.dataset.size || '');
      if (n.dataset.file) pre.dataset.file = n.dataset.file;
      pre.innerHTML = highlight(raw, n.dataset.lang || 'txt');
      var btn = document.createElement('button');
      btn.className = 'copy'; btn.type = 'button'; btn.textContent = 'コピー';
      btn.addEventListener('click', function () {
        copyText(raw, btn);
      });
      pre.appendChild(btn);
      n.parentNode.replaceChild(pre, n);
    });
  }

  /* ---------- スライド ---------- */
  var slides, cur = 0, deck, stage;

  function fit() {
    if (!deck) return;
    /* 木の机が必ず少し見えるように、上下左右 36px ぶんの余白込みで縮尺を決める */
    var s = Math.min(window.innerWidth / (1280 + 72), window.innerHeight / (720 + 72));
    deck.style.transform = 'scale(' + s + ')';
  }

  function show(i) {
    cur = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach(function (s, k) { s.classList.toggle('on', k === cur); });
    var bar = document.querySelector('.bar-top');
    if (bar) bar.style.width = ((cur + 1) / slides.length * 100) + '%';
    var no = document.querySelector('.nav .no');
    if (no) no.textContent = (cur + 1) + ' / ' + slides.length;
    var tt = document.querySelector('.nav .ttl');
    if (tt) tt.textContent = slides[cur].dataset.title || '';
    if (location.hash !== '#' + (cur + 1)) history.replaceState(null, '', '#' + (cur + 1));
  }

  function buildNav() {
    var bar = document.createElement('div'); bar.className = 'bar-top';
    var nav = document.createElement('div'); nav.className = 'nav';
    nav.innerHTML =
      '<button data-a="prev">◀</button><button data-a="next">▶</button>' +
      '<span class="no"></span><span class="ttl"></span>' +
      '<button data-a="ov">一覧 (O)</button><button data-a="full">全画面 (F)</button>' +
      '<button data-a="print">PDF (Ctrl+P)</button>';
    var ov = document.createElement('div'); ov.className = 'overview';
    slides.forEach(function (s, i) {
      var d = document.createElement('div'); d.className = 'ov-item';
      d.innerHTML = '<div class="n">' + String(i + 1).padStart(2, '0') + '</div>' +
                    '<div class="h">' + (s.dataset.title || '') + '</div>';
      d.addEventListener('click', function () { ov.classList.remove('on'); show(i); });
      ov.appendChild(d);
    });
    document.body.appendChild(bar);
    document.body.appendChild(nav);
    document.body.appendChild(ov);

    nav.addEventListener('click', function (e) {
      var a = e.target.dataset && e.target.dataset.a;
      if (a === 'prev') show(cur - 1);
      if (a === 'next') show(cur + 1);
      if (a === 'ov') ov.classList.toggle('on');
      if (a === 'full') toggleFull();
      if (a === 'print') window.print();
    });
  }

  function toggleFull() {
    // 全画面はブラウザの許可が要るので、断られても落ちないようにしておく
    try {
      if (document.fullscreenElement) {
        var p = document.exitFullscreen();
        if (p && p.catch) p.catch(function () {});
      } else {
        var q = document.documentElement.requestFullscreen();
        if (q && q.catch) q.catch(function () {});
      }
    } catch (e) { /* 何もしない */ }
  }

  function init() {
    buildCode();
    stage = document.querySelector('.stage');
    deck = document.querySelector('.deck');
    slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
    if (!slides.length) return;
    buildNav();
    fit();
    window.addEventListener('resize', fit);
    var start = parseInt(location.hash.slice(1), 10);
    show(isFinite(start) && start > 0 ? start - 1 : 0);

    document.addEventListener('keydown', function (e) {
      var ov = document.querySelector('.overview');
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { show(cur + 1); e.preventDefault(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { show(cur - 1); e.preventDefault(); }
      else if (e.key === 'Home') show(0);
      else if (e.key === 'End') show(slides.length - 1);
      else if (e.key === 'o' || e.key === 'O') ov.classList.toggle('on');
      else if (e.key === 'f' || e.key === 'F') toggleFull();
      else if (e.key === 'Escape') ov.classList.remove('on');
    });
    document.addEventListener('click', function (e) {
      if (e.target.closest('.nav') || e.target.closest('.overview') || e.target.closest('.code')) return;
      if (e.clientX > window.innerWidth * 0.5) show(cur + 1); else show(cur - 1);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
