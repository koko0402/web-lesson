/* =========================================================
   おたんじょうびカード

   使っているのは DAY 6 までの内容だけ。
     ・classList で画面を切り替える
     ・createElement で紙吹雪を作る（配列とfor）
     ・URLの ?name=... で相手の名前を差し替える
   ========================================================= */

const closed = document.getElementById("closed");
const opened = document.getElementById("opened");


/* ---------------------------------------------------------
   URLで名前を変えられるようにする
   例）index.html?name=うさぎ
   --------------------------------------------------------- */
const params = new URLSearchParams(location.search);
const name = params.get("name");
if (name !== null && name !== "") {
  document.getElementById("toName").textContent = name;
}


/* ---------------------------------------------------------
   紙吹雪を降らせる
   --------------------------------------------------------- */
const COLORS = ["#e0748c", "#d9a441", "#7fb0b8", "#8dc08a", "#c48cff"];

function confetti(n) {
  const box = document.getElementById("confetti");

  for (let i = 0; i < n; i++) {
    const p = document.createElement("i");

    p.style.left = Math.random() * 100 + "%";
    p.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
    p.style.animationDuration = (1.8 + Math.random() * 1.6) + "s";
    p.style.animationDelay = (Math.random() * 0.6) + "s";

    box.appendChild(p);

    // 落ちきったら消す（放っておくと増え続けるので）
    setTimeout(function () { p.remove(); }, 4200);
  }
}


/* ---------------------------------------------------------
   あける / 閉じる
   --------------------------------------------------------- */
document.getElementById("open").addEventListener("click", function () {
  closed.classList.add("hidden");
  opened.classList.remove("hidden");
  confetti(60);

  // 音を鳴らしたいときは、同じフォルダに sound.mp3 を置いて
  // 下の2行の // を外してください
  // const audio = new Audio("sound.mp3");
  // audio.play();
});

document.getElementById("again").addEventListener("click", function () {
  opened.classList.add("hidden");
  closed.classList.remove("hidden");
});


/* ---------------------------------------------------------
   改造のヒント

   ・h1 と .msg の文を、渡す相手に合わせて書き換える
   ・?name=◯◯ を付けたURLを送れば、開いた人の名前が出る
   ・紙吹雪の数（confetti の 60）や色（COLORS）を変える
   ・🎂 を別の絵文字や画像にする
   ・「あける」を押すたびにメッセージがランダムに変わるようにする（配列＋Math.random）
   --------------------------------------------------------- */
