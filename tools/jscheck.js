/* =========================================================
   jscheck.js — ページを開いて JavaScript のエラーが出ないか確認する
   使い方:  node tools/jscheck.js practice/day5/index.html ...
   ========================================================= */
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');

const EDGE = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
].find((p) => fs.existsSync(p));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class S {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.p = new Map(); this.l = new Map();
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.id && this.p.has(m.id)) {
        const { res, rej } = this.p.get(m.id); this.p.delete(m.id);
        m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
      } else if (m.method) (this.l.get(m.method) || []).forEach((f) => f(m.params));
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((res, rej) => {
      this.p.set(id, { res, rej });
      setTimeout(() => { if (this.p.has(id)) { this.p.delete(id); rej(new Error('timeout ' + method)); } }, 20000);
    });
  }
  on(m, f) { if (!this.l.has(m)) this.l.set(m, []); this.l.get(m).push(f); }
}

async function main() {
  const files = process.argv.slice(2);
  const port = 9335;
  const dir = path.join(os.tmpdir(), 'jsck_' + Date.now());
  const br = spawn(EDGE, ['--headless=new', '--disable-gpu', '--no-first-run',
    '--remote-debugging-port=' + port, '--user-data-dir=' + dir, 'about:blank'], { stdio: 'ignore' });

  let t = null;
  for (let i = 0; i < 60; i++) {
    await sleep(300);
    try {
      const l = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      t = l.find((x) => x.type === 'page'); if (t) break;
    } catch (_) {}
  }
  if (!t) { br.kill(); throw new Error('起動失敗'); }

  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.addEventListener('open', r); ws.addEventListener('error', j); });
  const s = new S(ws);

  let bag = [];
  s.on('Runtime.exceptionThrown', (p) => bag.push('例外: ' + (p.exceptionDetails.exception?.description || p.exceptionDetails.text)));
  s.on('Runtime.consoleAPICalled', (p) => { if (p.type === 'error') bag.push('console.error: ' + p.args.map(a => a.value).join(' ')); });
  s.on('Log.entryAdded', (p) => { if (p.entry.level === 'error') bag.push('読み込み失敗: ' + p.entry.text + ' ' + (p.entry.url || '')); });

  await s.send('Page.enable'); await s.send('Runtime.enable'); await s.send('Log.enable');

  let ng = 0;
  for (const f of files) {
    bag = [];
    const abs = path.resolve(f).replace(/\\/g, '/');
    await s.send('Page.navigate', { url: 'about:blank' });
    await sleep(150);
    await s.send('Page.navigate', { url: 'file:///' + abs });
    await sleep(2200);
    // 置いてあるボタンを全部押してみる
    await s.send('Runtime.evaluate', {
      expression: `document.querySelectorAll('button').forEach(b => { try { b.click(); } catch (e) {} }); 1`,
    });
    await sleep(1800);

    if (bag.length) { ng++; console.log('NG  ' + f); bag.forEach((b) => console.log('      ' + b)); }
    else console.log('OK  ' + f);
  }

  ws.close(); br.kill(); await sleep(300);
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_) {}
  console.log(ng === 0 ? '\nJavaScript のエラーはありません。' : `\n${ng} 件のページで問題が出ました。`);
}
main().catch((e) => { console.error(e); process.exit(1); });
