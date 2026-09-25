/* =========================================================
   devtools-demo / script.js

   スライド用に「Console にちょうどいい中身が出ている状態」を作るための
   ダミーページ。授業では使わない。tools/shoot-browser.ps1 から開かれる。

   ?mode=error を付けると、わざとエラーを出す。
   ========================================================= */

const out = document.getElementById("out");

console.log("script.js を読みこんだ");
console.log("ボタンの数 =", document.querySelectorAll("button").length);

document.getElementById("btnHello").addEventListener("click", function () {
  out.textContent = "押されました！ こんにちは。";
  console.log("あいさつボタンが押された");
});

let count = 0;
document.getElementById("btnCount").addEventListener("click", function () {
  count = count + 1;
  out.textContent = count + " 回おされた";
  console.log("count =", count);
});

/* localStorage の中身を見せるのは ?mode=storage のときだけ。
   file:// で開くと保存できず、関係のない赤いエラーが出てしまうため */
if (location.search.indexOf("storage") !== -1) {
  const visits = Number(localStorage.getItem("visits") || 0) + 1;
  localStorage.setItem("visits", visits);
  localStorage.setItem("name", "ユウ");
  localStorage.setItem("best", "48");
  console.log("ひらいた回数 =", visits);
}

/* ?mode=error のときだけ、わざと間違える */
if (location.search.indexOf("error") !== -1) {
  // ← id を打ちまちがえた想定。null に .textContent を書こうとして落ちる
  const typo = document.getElementById("outo");
  typo.textContent = "ここでエラーになる";
}
