/* =========================================================
   thin.js — 強調を間引く

   蛍光マーカー(.mk)と太字が多すぎると、
   「全部が大事」＝「何も大事じゃない」になる。

   ルール
     ・1つの付箋／段落に .mk は最大1つ。2つ目以降は外す
     ・付箋の中の <b> は、先頭の見出し以外は最大1つ
   使い方: node tools/thin.js [--apply]
   ========================================================= */
const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) {
      if (!/node_modules|assets|tools/.test(p)) walk(p);
    } else if (f.endsWith('.html')) files.push(p);
  }
})('.');

/* あるブロックの中の .mk を1つだけ残す */
function thinMk(block) {
  let n = 0;
  return block.replace(/<span class="mk(?: g)?">([\s\S]*?)<\/span>/g, function (all, inner) {
    n++;
    return n === 1 ? all : inner;   // 2つ目以降はタグを外して中身だけ残す
  });
}

/* 付箋の中の <b>：先頭の見出しは残し、以降は1つまで */
function thinB(block) {
  let n = 0;
  return block.replace(/<b>([\s\S]*?)<\/b>/g, function (all, inner) {
    n++;
    if (n <= 2) return all;         // 1つ目＝見出し、2つ目まではOK
    return inner;
  });
}

let mkBefore = 0, mkAfter = 0, bBefore = 0, bAfter = 0, touched = 0;

for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  mkBefore += (src.match(/class="mk/g) || []).length;
  bBefore  += (src.match(/<b>/g) || []).length;

  // 付箋ごとに処理
  let out = src.replace(/(<div class="fusen[^"]*"[^>]*>)([\s\S]*?)(<\/div>)/g,
    (all, open, body, close) => open + thinB(thinMk(body)) + close);

  // 段落・リスト項目ごとに .mk を1つに
  out = out.replace(/(<p[^>]*>)([\s\S]*?)(<\/p>)/g,
    (all, open, body, close) => open + thinMk(body) + close);
  out = out.replace(/(<li[^>]*>)([\s\S]*?)(<\/li>)/g,
    (all, open, body, close) => open + thinMk(body) + close);

  mkAfter += (out.match(/class="mk/g) || []).length;
  bAfter  += (out.match(/<b>/g) || []).length;

  if (out !== src) {
    touched++;
    if (APPLY) fs.writeFileSync(f, out);
  }
}

console.log('対象ファイル : ' + files.length + '（変更あり ' + touched + '）');
console.log('蛍光マーカー : ' + mkBefore + ' → ' + mkAfter);
console.log('太字         : ' + bBefore + ' → ' + bAfter);
console.log(APPLY ? '\n書き込みました。' : '\n（下見のみ。実行するには --apply）');
