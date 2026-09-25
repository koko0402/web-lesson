/* =========================================================
   スターター用 JavaScript

   考え方はいつも同じ：
     ① 取ってくる  →  ② 何かする  →  ③ 書き戻す

   データを持つときは：
     データを直す  →  描き直す関数を呼ぶ
   ========================================================= */


/* ---------------------------------------------------------
   ① ボタンを押したら文字が変わる
   --------------------------------------------------------- */

const btn = document.getElementById("btn");
const out = document.getElementById("out");

btn.addEventListener("click", function () {
  out.textContent = "押されました！";
});


/* ---------------------------------------------------------
   ② 配列から一覧を作る
   --------------------------------------------------------- */

// ここがデータ。増やしたいものはここに書く
let items = ["ひとつめ", "ふたつめ"];

const list = document.getElementById("list");

// データを見て、画面を作り直す関数
function draw() {
  list.innerHTML = "";                    // いったん空にする（忘れると増え続ける）

  items.forEach(function (text, index) {
    const li = document.createElement("li");
    li.textContent = (index + 1) + ". " + text;
    list.appendChild(li);
  });
}

draw();   // 最初に1回呼んでおく

document.getElementById("btnAdd").addEventListener("click", function () {
  items.push("あたらしい項目");   // ① データを直して
  draw();                         // ② 描き直す
});


/* ---------------------------------------------------------
   よく使う道具（コメントを外して使ってください）
   --------------------------------------------------------- */

// 1〜6 のランダムな数
// const dice = Math.floor(Math.random() * 6) + 1;

// 入力欄の中身を取る（数値として使うなら Number() を通す）
// const name = document.getElementById("input").value;

// クラスを付け外しして見た目を変える
// document.body.classList.toggle("dark");

// 0.5秒後に1回だけ実行
// setTimeout(function () { }, 500);

// 保存する / 読み込む
// localStorage.setItem("myKey", JSON.stringify(items));
// const saved = localStorage.getItem("myKey");
// if (saved !== null) items = JSON.parse(saved);

// F12 の Console に出す（デバッグの基本）
// console.log("ここまで来た", items);
