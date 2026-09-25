/* =========================================================
   DAY 6 ／ JavaScript 2回目：配列・オブジェクト・状態・保存

   今日の合言葉：
     「データを直す → 画面を作り直す」
   画面を直接いじるのではなく、必ずデータの方を直します。
   ========================================================= */


/* =========================================================
   ① 配列から一覧を作る
   ========================================================= */

// 配列 ＝ 順番に並んだ箱。[ ] で書く
let likes = ["夜のコンビニ", "雨の音", "全部乗せ", "帰り道"];

const likeList = document.getElementById("likeList");

// 「配列を見て、画面を作り直す」関数。以後この形が何度も出てきます
function drawLikes() {
  likeList.innerHTML = "";          // いったん空にする（これを忘れると増え続ける）

  // forEach ＝ 配列の中身を1つずつ取り出して処理する
  likes.forEach(function (item, index) {
    const li = document.createElement("li");     // <li> を新しく作る
    li.textContent = (index + 1) + ". " + item;  // 中身を入れる
    likeList.appendChild(li);                    // 画面にくっつける
  });
}

drawLikes();   // 最初に1回呼んでおく

const more = ["冷房25℃", "名前を呼ばれること", "何もない土曜日", "自販機の音"];
let moreIndex = 0;

document.getElementById("btnAddLike").addEventListener("click", function () {
  if (moreIndex < more.length) {
    likes.push(more[moreIndex]);   // push ＝ 配列の末尾に足す
    moreIndex++;
    drawLikes();                   // データを直したら、必ず描き直す
  }
});


/* =========================================================
   ② ルーレット（配列からランダムに1つ）
   ========================================================= */

const foods = ["からあげ", "ラーメン", "カレー", "オムライス", "焼肉", "そば", "たこ焼き"];

const rouletteBox = document.getElementById("rouletteBox");

document.getElementById("btnRoulette").addEventListener("click", function () {
  rouletteBox.classList.add("spinning");

  // setTimeout ＝ 「◯ミリ秒後にこれをやって」という予約
  let ticks = 0;
  const timer = setInterval(function () {
    // パラパラ切り替えて、まわっている感じを出す
    rouletteBox.textContent = foods[Math.floor(Math.random() * foods.length)];
    ticks++;

    if (ticks > 12) {
      clearInterval(timer);                 // 予約をやめる
      rouletteBox.classList.remove("spinning");
      const hit = foods[Math.floor(Math.random() * foods.length)];
      rouletteBox.textContent = "今日は " + hit;
    }
  }, 80);
});


/* =========================================================
   ③ 状態（オブジェクト）でまとめて管理する
   ========================================================= */

// オブジェクト ＝ 名前つきの箱。{ } で書く
const state = {
  hunger: 50,   // 満腹度
  mood:   50,   // 機嫌
  power:  50    // 体力
};

// 0〜100 からはみ出さないようにする関数
function clamp(n) {
  if (n > 100) return 100;
  if (n < 0)   return 0;
  return n;
}

// state を見て画面を作り直す
function drawState() {
  document.getElementById("hunger").textContent = state.hunger;
  document.getElementById("mood").textContent   = state.mood;
  document.getElementById("power").textContent  = state.power;
  document.getElementById("moodBar").style.width = state.mood + "%";

  const msg = document.getElementById("stateMsg");
  if (state.hunger < 20) {
    msg.textContent = "お腹がすいて無言になりました。";
  } else if (state.mood > 80) {
    msg.textContent = "上機嫌です。今なら何を言っても笑います。";
  } else if (state.power < 20) {
    msg.textContent = "眠そうです。";
  } else {
    msg.textContent = "";
  }
}

drawState();

document.getElementById("btnEat").addEventListener("click", function () {
  state.hunger = clamp(state.hunger + 25);
  state.mood   = clamp(state.mood + 10);
  state.power  = clamp(state.power - 5);
  drawState();
});

document.getElementById("btnPlay").addEventListener("click", function () {
  state.mood   = clamp(state.mood + 20);
  state.power  = clamp(state.power - 20);
  state.hunger = clamp(state.hunger - 15);
  drawState();
});

document.getElementById("btnSleep").addEventListener("click", function () {
  state.power  = clamp(state.power + 40);
  state.hunger = clamp(state.hunger - 20);
  drawState();
});


/* =========================================================
   ④ localStorage ＝ ブラウザに保存する
   ========================================================= */

let todos = [];

// 保存されているものを読み込む（無ければ空の配列）
const saved = localStorage.getItem("day6-todos");
if (saved !== null) {
  todos = JSON.parse(saved);      // 文字列 → 配列に戻す
}

function saveTodos() {
  // 配列はそのまま保存できないので、いったん文字列にする
  localStorage.setItem("day6-todos", JSON.stringify(todos));
}

const todoList = document.getElementById("todoList");

function drawTodos() {
  todoList.innerHTML = "";

  todos.forEach(function (todo, index) {
    const li = document.createElement("li");
    li.className = todo.done ? "done" : "";
    li.textContent = todo.text;

    // クリックで「済み」を切り替える
    li.addEventListener("click", function () {
      todos[index].done = !todos[index].done;   // ! ＝ 逆にする
      saveTodos();
      drawTodos();
    });

    todoList.appendChild(li);
  });
}

drawTodos();

const todoInput = document.getElementById("todoInput");

function addTodo() {
  const text = todoInput.value.trim();   // trim ＝ 前後の空白を消す
  if (text === "") return;               // 空なら何もしない

  todos.push({ text: text, done: false });
  todoInput.value = "";
  saveTodos();
  drawTodos();
}

document.getElementById("btnAddTodo").addEventListener("click", addTodo);

// Enter キーでも追加できるように
todoInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") addTodo();
});

document.getElementById("btnClearTodo").addEventListener("click", function () {
  todos = [];
  saveTodos();
  drawTodos();
});
