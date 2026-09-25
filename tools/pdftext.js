/* =========================================================
   pdftext.js — PDF から文字を取り出す（PowerPoint 書き出しPDF向け）

   フォントごとの ToUnicode CMap を読んで、
   コンテンツストリームの Tj / TJ を文字に戻す。

   使い方:  node tools/pdftext.js "path/to/file.pdf"
   ========================================================= */
const fs = require('zlib') && require('fs');
const zlib = require('zlib');

function inflate(buf) {
  for (const fn of [zlib.inflateSync, zlib.inflateRawSync]) {
    try { return fn(buf); } catch (_) {}
  }
  return null;
}

/* ---- オブジェクトを拾う ---- */
function parseObjects(raw) {
  const objs = new Map();
  const re = /(\d+)\s+(\d+)\s+obj\b/g;
  let m;
  const starts = [];
  while ((m = re.exec(raw)) !== null) starts.push({ num: +m[1], at: m.index, bodyAt: re.lastIndex });
  for (let i = 0; i < starts.length; i++) {
    const end = raw.indexOf('endobj', starts[i].bodyAt);
    const stop = end === -1 ? (starts[i + 1] ? starts[i + 1].at : raw.length) : end;
    objs.set(starts[i].num, { dict: raw.slice(starts[i].bodyAt, stop), start: starts[i].bodyAt, stop });
  }
  return objs;
}

/* ---- そのオブジェクトの stream をバイト列で取り出す ---- */
function streamOf(buf, raw, o) {
  const i = raw.indexOf('stream', o.start);
  if (i === -1 || i > o.stop) return null;
  let s = i + 6;
  if (raw[s] === '\r') s++;
  if (raw[s] === '\n') s++;
  const e = raw.indexOf('endstream', s);
  if (e === -1) return null;
  const bytes = buf.slice(s, e);
  if (/\/FlateDecode/.test(o.dict)) return inflate(bytes);
  return bytes;
}

/* ---- ToUnicode CMap を読む ---- */
function parseCMap(text) {
  const map = new Map();
  const hex = (h) => {
    let s = '';
    for (let i = 0; i < h.length; i += 4) s += String.fromCharCode(parseInt(h.substr(i, 4), 16));
    return s;
  };
  let m;
  const bfc = /beginbfchar([\s\S]*?)endbfchar/g;
  while ((m = bfc.exec(text)) !== null) {
    const re = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g; let p;
    while ((p = re.exec(m[1])) !== null) map.set(parseInt(p[1], 16), hex(p[2]));
  }
  const bfr = /beginbfrange([\s\S]*?)endbfrange/g;
  while ((m = bfr.exec(text)) !== null) {
    const re = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g; let p;
    while ((p = re.exec(m[1])) !== null) {
      const lo = parseInt(p[1], 16), hi = parseInt(p[2], 16), dst = parseInt(p[3], 16);
      for (let c = lo; c <= hi && c - lo < 65535; c++) map.set(c, String.fromCharCode(dst + (c - lo)));
    }
  }
  return map;
}

/* ---- コンテンツストリームから文字を組み立てる ---- */
function extract(content, fontMaps, fontOfName) {
  let out = '';
  let cur = null;
  const re = /\/([A-Za-z0-9_.-]+)\s+[\d.]+\s+Tf|\((?:\\.|[^\\()])*\)\s*Tj|<([0-9A-Fa-f\s]+)>\s*Tj|\[([\s\S]*?)\]\s*TJ|\bTD\b|\bTd\b|\bT\*\b|\bET\b/g;
  let m;
  const decodeHex = (h) => {
    h = h.replace(/\s+/g, '');
    let s = '';
    const map = cur ? fontMaps.get(cur) : null;
    for (let i = 0; i < h.length; i += 4) {
      const code = parseInt(h.substr(i, 4), 16);
      s += map && map.has(code) ? map.get(code) : '';
    }
    return s;
  };
  const decodeLit = (lit) => {
    const body = lit.replace(/^\(|\)$/g, '');
    let s = '';
    for (let i = 0; i < body.length; i++) {
      let ch = body[i];
      if (ch === '\\') { i++; ch = body[i]; }
      s += ch;
    }
    return s;
  };
  while ((m = re.exec(content)) !== null) {
    const t = m[0];
    if (m[1]) { cur = fontOfName.get(m[1]) ?? null; continue; }
    if (m[2] !== undefined) { out += decodeHex(m[2]); continue; }
    if (m[3] !== undefined) {
      const re2 = /<([0-9A-Fa-f\s]+)>|\((?:\\.|[^\\()])*\)/g; let p;
      while ((p = re2.exec(m[3])) !== null) {
        out += p[1] !== undefined ? decodeHex(p[1]) : decodeLit(p[0]);
      }
      continue;
    }
    if (/^\(/.test(t)) { out += decodeLit(t.replace(/\s*Tj$/, '')); continue; }
    if (/^(TD|Td|T\*|ET)$/.test(t)) { out += '\n'; }
  }
  return out;
}

function main() {
  const file = process.argv[2];
  const buf = fs.readFileSync(file);
  const raw = buf.toString('latin1');
  const objs = parseObjects(raw);

  // ToUnicode を持つフォントオブジェクトを集める
  const fontMaps = new Map();       // フォントobj番号 -> CMap
  for (const [num, o] of objs) {
    const m = o.dict.match(/\/ToUnicode\s+(\d+)\s+0\s+R/);
    if (!m) continue;
    const tu = objs.get(+m[1]);
    if (!tu) continue;
    const s = streamOf(buf, raw, tu);
    if (s) fontMaps.set(num, parseCMap(s.toString('latin1')));
  }

  // ページごとに Resources の /Font から  名前 -> obj番号  を作る
  const pages = [];
  for (const [num, o] of objs) {
    if (!/\/Type\s*\/Page\b/.test(o.dict)) continue;
    const fontOfName = new Map();
    let res = o.dict;
    const rref = o.dict.match(/\/Resources\s+(\d+)\s+0\s+R/);
    if (rref && objs.has(+rref[1])) res = objs.get(+rref[1]).dict;
    const fm = res.match(/\/Font\s*<<([\s\S]*?)>>/);
    if (fm) {
      const re = /\/([A-Za-z0-9_.-]+)\s+(\d+)\s+0\s+R/g; let p;
      while ((p = re.exec(fm[1])) !== null) fontOfName.set(p[1], +p[2]);
    }
    // コンテンツ
    let ids = [];
    const c1 = o.dict.match(/\/Contents\s+(\d+)\s+0\s+R/);
    const c2 = o.dict.match(/\/Contents\s*\[([\s\S]*?)\]/);
    if (c1) ids = [+c1[1]];
    else if (c2) ids = [...c2[1].matchAll(/(\d+)\s+0\s+R/g)].map((x) => +x[1]);
    let content = '';
    for (const id of ids) {
      const co = objs.get(id);
      if (!co) continue;
      const s = streamOf(buf, raw, co);
      if (s) content += s.toString('latin1') + '\n';
    }
    pages.push({ num, content, fontOfName });
  }

  pages.forEach((p, i) => {
    const text = extract(p.content, fontMaps, p.fontOfName)
      .replace(/\n{3,}/g, '\n\n')
      .split('\n').map((l) => l.trim()).filter(Boolean).join('\n');
    console.log(`\n========== ページ ${i + 1} ==========`);
    console.log(text);
  });
}
main();
