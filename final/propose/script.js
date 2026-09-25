/* =========================================================
   たった今考えたプロポーズの言葉を君に捧ぐよ（練習版）/ script.js

   DAY 1〜6 で覚えたものだけで出来ている。
     ・配列        … 定型文と単語カードの一覧
     ・オブジェクト … game（今の状況をぜんぶ入れた箱）
     ・関数        … 処理に名前をつける
     ・if / for    … 条件と繰り返し
     ・DOM操作     … 画面を作り直す
     ・Math.random … 手札を配る

   考え方は1つだけ：
     「game を書き換える → draw◯◯() で画面を作り直す」

   ※ 実物のカードの文言は使っていない。仕組みだけ真似た自作のことば。
   ========================================================= */


/* =========================================================
   1. データ：言いまわし（定型文カード）
      {1} {2} のところに、手札のことばが入る
   ========================================================= */

const TEMPLATES = [
  "{1}な君に、{2}を捧ぐよ。",
  "君の{1}は、{2}みたいだ。",
  "{1}でも{2}でも、ぼくは君を選ぶ。",
  "ぼくの{1}を、ぜんぶ{2}に捧ぐ。",
  "世界が{1}になっても、{2}だけは変わらない。",
  "{1}のとなりで、{2}を数えていたい。",
];


/* =========================================================
   2. データ：単語カード
      テーマごとに分けてある。増やしたいときはここに足すだけ
   ========================================================= */

const WORDS = {
  ふつう:   ["星空", "やさしさ", "朝ごはん", "手のひら", "帰り道", "いつもの声",
             "日曜日", "ぬるいお茶", "傘のなか", "静かな朝"],
  ダーク:   ["沈黙", "執念", "最後の一本", "留守番電話", "消えない足あと",
             "冷めたスープ", "明けない夜", "ふさがらない傷", "底なし", "未読のまま"],
  あまあま: ["ハチミツ", "ほっぺた", "二度寝", "とけそうな声", "ぎゅっと",
             "砂糖ふたつ", "ふわふわ", "にゃんこ", "いちご", "ひざまくら"],
  うすい:   ["まあまあ", "そこそこ", "特になし", "普通に", "空気",
             "だいたい", "一応", "気のせい", "無難", "そのへん"],
  アゲ:     ["優勝", "圧倒的", "アガる", "最高記録", "ぶち上げ",
             "限界突破", "沸点", "満場一致", "全部乗せ", "無敵"],
  渋め:     ["背中", "男気", "一本筋", "渋み", "昭和",
             "古傷", "焼き鳥", "無口", "たたずまい", "年季"],
};


/* =========================================================
   3. 今の状況（この箱を書き換えていく）
   ========================================================= */

const game = {
  players: [],    // { name, rings }
  parent: 0,      // 親が何番目か
  builder: 0,     // いま文を作っている人が何番目か
  round: 1,
  entries: [],    // { who, text }
  hand: [],       // いまの人の手札（ことばの配列）
  tmpl: 0,        // 選んでいる言いまわし
  slots: [],      // 穴に入れたことば ["", ""]
};


/* =========================================================
   4. 小道具
   ========================================================= */

const $ = (id) => document.getElementById(id);

/** 画面を切り替える */
function show(id) {
  const all = document.querySelectorAll(".screen");
  for (let i = 0; i < all.length; i++) {
    all[i].classList.remove("is-on");
  }
  $(id).classList.add("is-on");
  window.scrollTo(0, 0);
}

/** 0 から max-1 までの数をひとつ */
function rnd(max) {
  return Math.floor(Math.random() * max);
}

/** 全テーマの単語をひとつの配列にまとめる */
function allWords() {
  const list = [];
  const keys = Object.keys(WORDS);
  for (let i = 0; i < keys.length; i++) {
    const set = WORDS[keys[i]];
    for (let j = 0; j < set.length; j++) {
      list.push(set[j]);
    }
  }
  return list;
}

/** 手札を6枚くばる（同じことばが2枚こないようにする） */
function dealHand() {
  const pool = allWords();
  const hand = [];
  while (hand.length < 6) {
    const w = pool[rnd(pool.length)];
    let already = false;
    for (let i = 0; i < hand.length; i++) {
      if (hand[i] === w) already = true;
    }
    if (!already) hand.push(w);
  }
  return hand;
}

/** 定型文の {1} {2} を、入れたことばに置きかえる */
function fill(tmpl, slots) {
  let t = tmpl;
  t = t.replace("{1}", slots[0] === "" ? "　◯◯　" : slots[0]);
  t = t.replace("{2}", slots[1] === "" ? "　◯◯　" : slots[1]);
  return t;
}


/* =========================================================
   5. タイトル画面
   ========================================================= */

/** 人数に合わせて、名前の入力欄を並べ直す */
function drawNameFields() {
  const n = Number($("playerCount").value);
  let html = "";
  for (let i = 0; i < n; i++) {
    html += '<input type="text" class="name-input" maxlength="6" placeholder="プレイヤー'
          + (i + 1) + '">';
  }
  $("nameFields").innerHTML = html;
}

$("playerCount").addEventListener("change", drawNameFields);
drawNameFields();

$("startBtn").addEventListener("click", function () {
  const inputs = document.querySelectorAll(".name-input");
  game.players = [];
  for (let i = 0; i < inputs.length; i++) {
    const name = inputs[i].value.trim();
    game.players.push({
      name: name === "" ? "プレイヤー" + (i + 1) : name,
      rings: 3,
    });
  }
  game.parent = 0;
  game.round = 1;
  startRound();
});


/* =========================================================
   6. 1回戦のはじまり
   ========================================================= */

function startRound() {
  game.entries = [];
  // 親のつぎの人から作りはじめる
  game.builder = (game.parent + 1) % game.players.length;
  goPass();
}

/** 「次の人にわたして」の画面 */
function goPass() {
  $("passName").textContent = game.players[game.builder].name;
  $("passSub").textContent  = "の番です";
  show("passScreen");
}

$("passBtn").addEventListener("click", function () {
  // 新しい手札を配って、作る画面へ
  game.hand  = dealHand();
  game.tmpl  = 0;
  game.slots = ["", ""];
  drawBuild();
  show("buildScreen");
});


/* =========================================================
   7. 文を作る画面
   ========================================================= */

function drawBuild() {
  $("barRound").textContent  = game.round + "回戦";
  $("barParent").textContent = game.players[game.parent].name;
  $("barMe").textContent     = game.players[game.builder].name;

  // 言いまわしのボタン
  let t = "";
  for (let i = 0; i < TEMPLATES.length; i++) {
    const on = (i === game.tmpl) ? " is-on" : "";
    t += '<button type="button" class="tmpl' + on + '" data-tmpl="' + i + '">'
       + (i + 1) + "</button>";
  }
  $("tmplList").innerHTML = t;

  // 組み立て中の文
  $("sentence").textContent = fill(TEMPLATES[game.tmpl], game.slots);

  // 手札（すでに使ったことばは薄くする）
  let h = "";
  for (let i = 0; i < game.hand.length; i++) {
    const w = game.hand[i];
    const used = (w === game.slots[0] || w === game.slots[1]);
    h += '<button type="button" class="card' + (used ? " is-used" : "") + '" data-word="'
       + w + '">' + w + "</button>";
  }
  $("hand").innerHTML = h;

  // 2つとも埋まったら決定できる
  $("doneBtn").disabled = (game.slots[0] === "" || game.slots[1] === "");
}

/* 言いまわしを選ぶ */
$("tmplList").addEventListener("click", function (e) {
  const b = e.target.closest("[data-tmpl]");
  if (!b) return;
  game.tmpl = Number(b.dataset.tmpl);
  drawBuild();
});

/* 手札のことばを、空いているほうの穴に入れる */
$("hand").addEventListener("click", function (e) {
  const b = e.target.closest("[data-word]");
  if (!b) return;
  const w = b.dataset.word;

  if (w === game.slots[0]) { game.slots[0] = ""; drawBuild(); return; }
  if (w === game.slots[1]) { game.slots[1] = ""; drawBuild(); return; }

  if (game.slots[0] === "")      game.slots[0] = w;
  else if (game.slots[1] === "") game.slots[1] = w;
  drawBuild();
});

$("clearBtn").addEventListener("click", function () {
  game.slots = ["", ""];
  drawBuild();
});

$("doneBtn").addEventListener("click", function () {
  game.entries.push({
    who:  game.builder,
    text: fill(TEMPLATES[game.tmpl], game.slots),
  });

  // つぎの人へ。親は飛ばす
  let next = (game.builder + 1) % game.players.length;
  if (next === game.parent) next = (next + 1) % game.players.length;

  // ひとまわりしたら発表へ
  if (game.entries.length >= game.players.length - 1) {
    drawShow();
    show("showScreen");
  } else {
    game.builder = next;
    goPass();
  }
});


/* =========================================================
   8. 発表 ── 親が選ぶ
   ========================================================= */

function drawShow() {
  $("barRound2").textContent  = game.round + "回戦";
  $("barParent2").textContent = game.players[game.parent].name;
  $("showParent").textContent = game.players[game.parent].name;

  let h = "";
  for (let i = 0; i < game.entries.length; i++) {
    const e = game.entries[i];
    h += '<button type="button" class="entry" data-pick="' + i + '">'
       +   '<span class="entry-name">' + game.players[e.who].name + "</span>"
       +   '<span class="entry-text">' + e.text + "</span>"
       + "</button>";
  }
  $("entries").innerHTML = h;
}

$("entries").addEventListener("click", function (e) {
  const b = e.target.closest("[data-pick]");
  if (!b) return;
  pick(Number(b.dataset.pick));
});


/* =========================================================
   9. 選ばれた ── 指輪をひとつ渡す
   ========================================================= */

function pick(i) {
  const e = game.entries[i];
  const p = game.players[e.who];
  p.rings = p.rings - 1;

  $("roundName").textContent = p.name;
  $("roundText").textContent = e.text;
  $("roundRing").textContent = "指輪をひとつ渡した（のこり " + p.rings + "）";
  drawRings("ringBoard");
  show("roundScreen");
}

/** 全員の指輪のようすを描く */
function drawRings(boxId) {
  let h = "";
  for (let i = 0; i < game.players.length; i++) {
    const p = game.players[i];
    let rings = "";
    for (let r = 0; r < 3; r++) {
      rings += '<span class="ring' + (r < p.rings ? "" : " is-gone") + '">◯</span>';
    }
    h += '<div class="ring-row"><span class="ring-name">' + p.name + "</span>"
       + '<span class="ring-set">' + rings + "</span></div>";
  }
  $(boxId).innerHTML = h;
}

$("nextBtn").addEventListener("click", function () {
  // 指輪を渡しきった人がいたら終わり
  for (let i = 0; i < game.players.length; i++) {
    if (game.players[i].rings <= 0) {
      $("winName").textContent = game.players[i].name;
      drawRings("winBoard");
      show("winScreen");
      return;
    }
  }
  // つぎの回。親を送る
  game.parent = (game.parent + 1) % game.players.length;
  game.round  = game.round + 1;
  startRound();
});

$("againBtn").addEventListener("click", function () {
  show("titleScreen");
});
