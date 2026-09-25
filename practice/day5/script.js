/* =========================================================
   DAY 5 ／ JavaScript 1回目
   「取ってくる → 何かする → 書き戻す」の3ステップだけです。
   ========================================================= */


/* ---------------------------------------------------------
   ① 押したら文字が変わる
   --------------------------------------------------------- */

// (1) HTML の中から、id="btnHello" の部品を取ってくる
const btnHello = document.getElementById("btnHello");
const hello    = document.getElementById("hello");

// (2) 「クリックされたら、この中身を実行して」と予約する
btnHello.addEventListener("click", function () {
  // (3) 文字を書き換える
  hello.textContent = "押されました！ こんにちは。";
});


/* ---------------------------------------------------------
   ② 数を数える（変数）
   --------------------------------------------------------- */

// let ＝ あとで中身を変えられる箱
let count = 0;

const countEl  = document.getElementById("count");
const countMsg = document.getElementById("countMsg");

document.getElementById("btnPlus").addEventListener("click", function () {
  count = count + 1;               // count += 1 とも書ける
  countEl.textContent = count;

  // if ＝ もし〜なら
  if (count >= 10) {
    countMsg.textContent = "食べすぎです。";
  } else if (count >= 5) {
    countMsg.textContent = "いいペースですね。";
  } else {
    countMsg.textContent = "";
  }
});

document.getElementById("btnReset").addEventListener("click", function () {
  count = 0;
  countEl.textContent = count;
  countMsg.textContent = "";
});


/* ---------------------------------------------------------
   ③ 入力を受け取る
   --------------------------------------------------------- */

document.getElementById("btnGreet").addEventListener("click", function () {
  // input の中身は .value で取り出す（.textContent ではない）
  const name = document.getElementById("nameInput").value;

  if (name === "") {
    document.getElementById("greet").textContent = "なまえが空っぽです。";
  } else {
    // バッククォート `` で囲むと、${ } の中に変数を埋め込めます
    document.getElementById("greet").textContent = `こんにちは、${name} さん。`;
  }
});


/* ---------------------------------------------------------
   ④ ランダムと条件分岐
   --------------------------------------------------------- */

// 関数 ＝ よく使う処理に名前をつけたもの
function rollDice() {
  // Math.random() は 0 以上 1 未満の小数。6倍して切り捨てて +1 で 1〜6
  return Math.floor(Math.random() * 6) + 1;
}

document.getElementById("btnDice").addEventListener("click", function () {
  const dice = rollDice();
  const el = document.getElementById("diceResult");

  if (dice === 6) {
    el.textContent = `${dice} ／ 絶好調。何を言っても笑います。`;
  } else if (dice >= 4) {
    el.textContent = `${dice} ／ ふつう。ごはんに誘えば来ます。`;
  } else if (dice >= 2) {
    el.textContent = `${dice} ／ 眠い。話は短めに。`;
  } else {
    el.textContent = `${dice} ／ 燃料切れ。まず食べさせてください。`;
  }

  // F12 の Console に出るメモ。デバッグの基本です
  console.log("出た目:", dice);
});


/* ---------------------------------------------------------
   ⑤ 見た目を切り替える（classList）
   --------------------------------------------------------- */

const btnDark = document.getElementById("btnDark");

btnDark.addEventListener("click", function () {
  // toggle ＝ 付いてなければ付ける、付いていれば外す
  document.body.classList.toggle("dark");

  // contains ＝ そのクラスが付いているか調べる
  if (document.body.classList.contains("dark")) {
    btnDark.textContent = "昼モードに戻す";
  } else {
    btnDark.textContent = "夜モードにする";
  }
});
