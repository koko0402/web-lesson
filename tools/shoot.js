/* =========================================================
   shoot.js — 教材用スクリーンショット撮影ツール

   ヘッドレスの Edge を CDP(Chrome DevTools Protocol) で操作して、
   「ボタンを押したあとの画面」まで撮れるようにしたもの。

   使い方:  node tools/shoot.js jobs.json
   jobs.json は [{ url, out, w, h, dpr, wait, actions:[js...] }, ...]
   ========================================================= */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const EDGE_CANDIDATES = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function findBrowser() {
  for (const p of EDGE_CANDIDATES) if (fs.existsSync(p)) return p;
  throw new Error('Edge / Chrome が見つかりません');
}

/* ---- CDP の最小クライアント ---- */
class Session {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.listeners = new Map();
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      } else if (msg.method) {
        (this.listeners.get(msg.method) || []).forEach((fn) => fn(msg.params));
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pending.has(id)) { this.pending.delete(id); reject(new Error('timeout: ' + method)); }
      }, 30000);
    });
  }
  on(method, fn) {
    if (!this.listeners.has(method)) this.listeners.set(method, []);
    this.listeners.get(method).push(fn);
  }
}

async function main() {
  const jobsFile = process.argv[2];
  if (!jobsFile) { console.error('使い方: node tools/shoot.js jobs.json'); process.exit(1); }
  const jobs = JSON.parse(fs.readFileSync(jobsFile, 'utf8'));

  /* 固定ポートだと、前に起動したブラウザがまだ生きていたときに
     そっちへつないでしまい、前回の状態（IndexedDB など）が残る。
     毎回ちがうポートにして、必ず新しいブラウザを使う。 */
  const port = 9000 + Math.floor(Math.random() * 300);
  const userDir = path.join(os.tmpdir(), 'shoot_' + Date.now());
  const browser = spawn(findBrowser(), [
    '--headless=new', '--disable-gpu', '--hide-scrollbars',
    '--no-first-run', '--no-default-browser-check', '--disable-extensions',
    '--remote-debugging-port=' + port,
    '--user-data-dir=' + userDir,
    'about:blank',
  ], { stdio: 'ignore' });

  // 起動待ち
  let target = null;
  for (let i = 0; i < 60; i++) {
    await sleep(300);
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      target = list.find((t) => t.type === 'page');
      if (target) break;
    } catch (_) { /* まだ起動していない */ }
  }
  if (!target) { browser.kill(); throw new Error('ブラウザの起動に失敗しました'); }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.addEventListener('open', res);
    ws.addEventListener('error', rej);
  });
  const s = new Session(ws);

  await s.send('Page.enable');
  await s.send('Runtime.enable');

  let ok = 0, ng = 0;
  for (const job of jobs) {
    const w = job.w || 1280, h = job.h || 800, dpr = job.dpr || 2;
    try {
      await s.send('Emulation.setDeviceMetricsOverride', {
        width: w, height: h, deviceScaleFactor: dpr, mobile: !!job.mobile,
      });

      // #1 → #7 のようにハッシュだけ違う移動はリロードが起きないので、
      // いったん about:blank を挟んで必ず読み込み直させる
      await s.send('Page.navigate', { url: 'about:blank' });
      await sleep(120);

      const loaded = new Promise((res) => s.on('Page.loadEventFired', res));
      await s.send('Page.navigate', { url: job.url });
      await Promise.race([loaded, sleep(8000)]);
      await sleep(job.wait || 900);

      for (const act of job.actions || []) {
        await s.send('Runtime.evaluate', { expression: act, awaitPromise: true });
        await sleep(act.__wait || 450);
      }
      if (job.after) await sleep(job.after);

      const shot = await s.send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: !!job.full,
      });
      fs.mkdirSync(path.dirname(job.out), { recursive: true });
      fs.writeFileSync(job.out, Buffer.from(shot.data, 'base64'));
      console.log('OK  ' + path.basename(job.out));
      ok++;
    } catch (e) {
      console.log('NG  ' + path.basename(job.out) + '  ' + e.message);
      ng++;
    }
  }

  ws.close();
  browser.kill();
  await sleep(400);
  try { fs.rmSync(userDir, { recursive: true, force: true }); } catch (_) {}
  console.log(`\n完了: 成功 ${ok} / 失敗 ${ng}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
