/* =========================================================
   今日のおみくじ

   使っているのは DAY 6 までの内容だけ。
     ・オブジェクトの配列（結果と一言をセットで持つ）
     ・ランダムに1つ選ぶ
     ・setTimeout で「回している」演出
     ・localStorage で回数を覚えておく
   ========================================================= */

// ---- データ。ここを書き換えれば中身が変わります ----
const KUJI = [
  { name: "大吉", msg: "何をやってもうまくいく日。宝くじは買わなくていい。" },
  { name: "中吉", msg: "そこそこ良い。期待しすぎない方が結果は良い。" },
  { name: "小吉", msg: "小さい良いことが1つある。見逃さないように。" },
  { name: "吉",   msg: "ふつう。ふつうがいちばん難しい。" },
  { name: "末吉", msg: "後半に良くなる。前半は耐える。" },
  { name: "凶",   msg: "今日は何も決めないほうがいい。寝るのが最善。" }
];

// ---- 部品 ----
const btn    = document.getElementById("btn");
const result = document.getElementById("result");
const msg    = document.getElementById("msg");
const countEl = document.getElementById("count");

// ---- 引いた回数（前回の続きから） ----
let count = 0;
const saved = localStorage.getItem("omikuji-count");
if (saved !== null) count = Number(saved);
countEl.textContent = count;


btn.addEventListener("click", function () {
  btn.disabled = true;          // 回している間は押せなくする
  result.classList.remove("pop");
  msg.textContent = "";

  // パラパラ切り替えて、回っている感じを出す
  let ticks = 0;
  const timer = setInterval(function () {
    const r = KUJI[Math.floor(Math.random() * KUJI.length)];
    result.textContent = r.name;
    ticks++;

    if (ticks >= 12) {
      clearInterval(timer);       // 止める（忘れると永遠に回る）

      // ここで本当の結果を決める
      const hit = KUJI[Math.floor(Math.random() * KUJI.length)];
      result.textContent = hit.name;
      msg.textContent = hit.msg;

      void result.offsetWidth;    // アニメを付け直すためのおまじない
      result.classList.add("pop");

      count++;
      countEl.textContent = count;
      localStorage.setItem("omikuji-count", count);

      btn.disabled = false;
      btn.textContent = "もういちど";
    }
  }, 70);
});


/* ---------------------------------------------------------
   改造のヒント

   ・KUJI の中身を、自分たちのネタに全部書き換える
   ・「1日1回しか引けない」…… 日付を localStorage に保存して比べる
   ・出た結果によって背景色を変える（classList）
   ・音を鳴らす …… const a = new Audio("sound.mp3"); a.play();
   --------------------------------------------------------- */
