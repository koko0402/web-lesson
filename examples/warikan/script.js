/* =========================================================
   割り勘けいさん

   使っているのは DAY 5 までの内容だけ。
     ・入力欄の値を取る（.value）
     ・数値に変換する（Number）
     ・計算して書き戻す（textContent）
     ・入力が変わるたびに計算し直す（input イベント）
   ========================================================= */

// ---- 部品を取ってくる ----
const totalEl  = document.getElementById("total");
const peopleEl = document.getElementById("people");
const roundEl  = document.getElementById("round");

const eachEl  = document.getElementById("each");
const sumEl   = document.getElementById("sum");
const diffEl  = document.getElementById("diff");
const diffLab = document.getElementById("diffLabel");
const noteEl  = document.getElementById("note");


// ---- 計算して画面に出す ----
function calc() {
  const total  = Number(totalEl.value);    // 入力欄は文字列なので数値に直す
  const people = Number(peopleEl.value);
  const unit   = Number(roundEl.value);    // 丸める単位（100円単位など）

  // 人数が0以下だと割り算できないので、そこで止める
  if (people <= 0) {
    noteEl.textContent = "人数は1人以上にしてください。";
    return;
  }

  // 1人あたり。unit で切り上げて丸める
  //   例：2560円 を 100円単位 → 2600円
  const raw  = total / people;
  const each = Math.ceil(raw / unit) * unit;

  const sum  = each * people;   // 実際に集まるお金
  const diff = sum - total;     // 多く集まったぶん

  eachEl.textContent = each.toLocaleString();   // 3桁ごとにカンマを入れる
  sumEl.textContent  = sum.toLocaleString();
  diffEl.textContent = Math.abs(diff).toLocaleString();

  if (diff > 0) {
    diffLab.textContent = "余り";
    noteEl.textContent = "余った " + diff.toLocaleString() + " 円は幹事のぶんに回せます。";
  } else {
    diffLab.textContent = "差額";
    noteEl.textContent = "ぴったりです。";
  }
}


// ---- 入力が変わるたびに計算し直す ----
totalEl.addEventListener("input", calc);
peopleEl.addEventListener("input", calc);
roundEl.addEventListener("change", calc);

calc();   // 最初に1回


/* ---------------------------------------------------------
   改造のヒント

   ・「幹事だけ安くする」…… 幹事のぶんだけ別に計算する
   ・「多め徴収」…… 一律 +200円 のチェックボックスを足す
   ・「1人ずつ違う金額」…… 人数ぶんの入力欄を配列から作る（DAY 6）
   --------------------------------------------------------- */
