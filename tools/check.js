/* =========================================================
   check.js — スライドのはみ出し検査

   1280x720 の枠から中身がはみ出しているスライドを洗い出す。
   使い方:  node tools/check.js slides/day1.html slides/day2.html ...
   ========================================================= */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const EDGE = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
].find((p) => fs.existsSync(p));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class Session {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pending = new Map(); this.listeners = new Map();
    ws.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && this.pending.has(m.id)) {
        const { resolve, reject } = this.pending.get(m.id);
        this.pending.delete(m.id);
        m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
      } else if (m.method) (this.listeners.get(m.method) || []).forEach((f) => f(m.params));
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((res, rej) => {
      this.pending.set(id, { resolve: res, reject: rej });
      setTimeout(() => { if (this.pending.has(id)) { this.pending.delete(id); rej(new Error('timeout ' + method)); } }, 30000);
    });
  }
  on(m, f) { if (!this.listeners.has(m)) this.listeners.set(m, []); this.listeners.get(m).push(f); }
}

/* ページ内で走らせる検査コード */
const PROBE = `(() => {
  const out = [];
  const slides = [...document.querySelectorAll('.slide')];
  const prev = slides.findIndex(s => s.classList.contains('on'));

  // 飾り（マステ・見出しの手描き下線）は意図的に紙からはみ出しているので数えない
  const deco = [...document.querySelectorAll('.tape')];
  deco.forEach(d => d.style.display = 'none');
  const st = document.createElement('style');
  st.textContent = 'h2.t::after{display:none !important}';
  document.head.appendChild(st);

  slides.forEach((s, i) => {
    slides.forEach(x => x.classList.remove('on'));
    s.classList.add('on');
    void s.offsetHeight;
    const over = s.scrollHeight - s.clientHeight;   // 実際に切れている量
    const wide = s.scrollWidth - s.clientWidth;
    if (over > 0 || wide > 0) {
      out.push({ n: i + 1, title: s.dataset.title || '', over, wide });
    }
  });

  st.remove();
  deco.forEach(d => d.style.display = '');
  slides.forEach(x => x.classList.remove('on'));
  if (prev >= 0) slides[prev].classList.add('on');
  return JSON.stringify({ total: slides.length, bad: out });
})()`;

async function main() {
  const files = process.argv.slice(2);
  if (!files.length) { console.error('使い方: node tools/check.js slides/day1.html ...'); process.exit(1); }

  const port = 9334;
  const dir = path.join(os.tmpdir(), 'check_' + Date.now());
  const br = spawn(EDGE, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
    '--remote-debugging-port=' + port, '--user-data-dir=' + dir, 'about:blank'], { stdio: 'ignore' });

  let target = null;
  for (let i = 0; i < 60; i++) {
    await sleep(300);
    try {
      const l = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      target = l.find((t) => t.type === 'page');
      if (target) break;
    } catch (_) {}
  }
  if (!target) { br.kill(); throw new Error('ブラウザ起動に失敗'); }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.addEventListener('open', r); ws.addEventListener('error', j); });
  const s = new Session(ws);
  await s.send('Page.enable');
  await s.send('Emulation.setDeviceMetricsOverride', { width: 1352, height: 792, deviceScaleFactor: 1, mobile: false });

  let problems = 0;
  for (const f of files) {
    const abs = path.resolve(f).replace(/\\/g, '/');
    await s.send('Page.navigate', { url: 'about:blank' });
    await sleep(100);
    const loaded = new Promise((r) => s.on('Page.loadEventFired', r));
    await s.send('Page.navigate', { url: 'file:///' + abs });
    await Promise.race([loaded, sleep(8000)]);
    await sleep(1300);

    const r = await s.send('Runtime.evaluate', { expression: PROBE, returnByValue: true });
    const data = JSON.parse(r.result.value);
    if (!data.bad.length) {
      console.log(`OK   ${path.basename(f)}  (${data.total}枚 すべて枠内)`);
    } else {
      problems += data.bad.length;
      console.log(`はみ出し ${path.basename(f)}  (${data.total}枚中 ${data.bad.length}枚)`);
      data.bad.forEach((b) => {
        const w = b.wide > 2 ? `  横+${b.wide}px` : '';
        console.log(`     #${String(b.n).padStart(2)}  縦+${b.over}px${w}   ${b.title}`);
      });
    }
  }

  ws.close(); br.kill();
  await sleep(300);
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_) {}
  console.log(problems === 0 ? '\nすべて枠内におさまっています。' : `\n合計 ${problems} 枚に修正が必要です。`);
}

main().catch((e) => { console.error(e); process.exit(1); });
