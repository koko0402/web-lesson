# Webサイトのつくりかた（全9回）

Web初心者の友達に、HTML → CSS → JavaScript → 総合制作 の順で教えるための教材一式。

**まずは [`index.html`](index.html) をブラウザで開いて。** そこから全部たどれる。

---

## 中身

| フォルダ | 内容 |
|---|---|
| `index.html` | もくじ。ここが入口 |
| `slides/` | 授業用スライド（DAY 0〜8、全151枚） |
| `reference/` | 資料。準備手順・公開手順・Firebase・練習問題集・辞典・一覧・チートシートなど |
| `templates/` | コピーして使うスターターファイル3種 |
| `playground/` | さわって試すツール（ブロックで組む・ライブエディタ・CSS見本帳・色のページ・フォントのページ・写真のページ・便利CSS・CSS体験ラボ・レイアウト練習・質問文メーカー・記号タイピング） |
| `examples/` | 作例4つ（おみくじ・割り勘・誕生日カード・リンク集） |
| `practice/` | 実習の完成見本（DAY 1〜6） |
| `final/oshi/` | 応用演習『推しの紹介サイト』（課題ページ・スターター・完成見本） |
| `final/propose/` | 最終作品『プロポーズの言葉を君に捧ぐよ』 |
| `assets/` | 共通のCSS・JS・画像・スクリーンショット |
| `tools/` | 教材を作るときに使ったスクリプト（授業では不要）。`devtools-demo/` は撮影用のダミーページ |

---

## スライドの操作

| キー | 動き |
|---|---|
| `→` / `Space` | 次へ |
| `←` | 前へ |
| `O` | スライド一覧 |
| `F` | 全画面 |
| `Ctrl + P` | PDFに保存（1枚＝1ページで出力される） |
| 画面の右半分／左半分をクリック | 次へ／前へ |

コードブロックにマウスを乗せると「コピー」ボタンが出る。

---

## 資料の使い分け

| いつ | 見るもの |
|---|---|
| **コードを書く前に慣らしたい** | [`playground/block-lab.html`](playground/block-lab.html) ブロックで組む（流れ図＝プログラム。DAY 5 の前に） |
| **とにかく触ってみたい** | [`playground/`](playground/index.html) ライブエディタ／CSS体験ラボ |
| **どんな見た目にできるか知りたい** | [`playground/css-gallery.html`](playground/css-gallery.html) CSS見本帳（これを選ぶとこうなる） |
| **位置・サイズ・フォントを狙って出したい** | [`playground/layout-lab.html`](playground/layout-lab.html) レイアウト練習（全9問） |
| **色を決めたい・値を知りたい** | [`playground/color-lab.html`](playground/color-lab.html) 色のページ（作る・名前140色・3色で試す） |
| **フォントを選びたい・落としたい** | [`playground/font-lab.html`](playground/font-lab.html) フォントのページ（見本・名前・貼るコマンド・配布場所） |
| **よくある書き方を探したい** | [`playground/snippets.html`](playground/snippets.html) あると便利なCSS（まんなか寄せ・はみ出し・スマホ対応など28個） |
| **作ったものを公開したい** | [`reference/publish.html`](reference/publish.html) 公開する（画面の絵つき。GitHub Pages / Firebase Hosting） |
| **みんなで共有する機能が要る** | [`reference/firebase.html`](reference/firebase.html) Firebase の使い方（Firestore・ルール・無料枠） |
| **写真が重い・どの形式か迷う** | [`playground/image-lab.html`](playground/image-lab.html) 写真のページ（ブラウザ内で縮小・webp変換） |
| **講座を始める前** | [`reference/setup.html`](reference/setup.html) 準備手順（渡しておく） |
| **プログラム以前で詰まる** | [`reference/basics.html`](reference/basics.html) 半角全角・拡張子・パス |
| **記号や単語が読めない** | [`reference/symbols.html`](reference/symbols.html) 読み方一覧 |
| **手を動かしたい** | [`reference/exercises.html`](reference/exercises.html) 練習問題／[`templates/`](templates/index.html) 雛形 |
| **こんなの作れる？** | [`examples/`](examples/index.html) 作例集 |
| **思い込みで詰まってそう** | [`reference/myths.html`](reference/myths.html) よくある勘違い |
| **動かない** | [`reference/errors.html`](reference/errors.html) エラー辞典 |
| **手元に置く紙** | [`reference/cheatsheet.html`](reference/cheatsheet.html) 印刷用チートシート |
| **進み具合の確認** | [`reference/checklist.html`](reference/checklist.html) チェックシート |
| **教える側** | [`reference/teaching-guide.html`](reference/teaching-guide.html) 進行メモ |
| **市販の本と併用する** | [`reference/book-map.html`](reference/book-map.html) 本との対応表（Mana『HTML & CSSとWebデザイン入門講座』） |

---

## カリキュラム

| 回 | テーマ | 実習 |
|---|---|---|
| DAY 0 | はじめに・道具をそろえる | `practice/day0` |
| DAY 1 | HTMLだけでサイトを作る | `practice/day1` |
| DAY 2 | ページを増やす・表・フォーム | `practice/day2` |
| DAY 3 | CSS ① 色・文字・余白 | `practice/day3` |
| DAY 4 | CSS ② 並べる・動かす | `practice/day4` |
| — | **応用演習『推しの紹介サイト』** | `final/oshi` |
| DAY 5 | JavaScript ① 動きの基本 | `practice/day5` |
| DAY 6 | JavaScript ② データを扱う | `practice/day6` |
| DAY 7 | 総合制作『プロポーズの言葉を君に捧ぐよ』 | `final/propose` |
| DAY 8 | 直す・公開する・これから | — |

DAY 1〜6 は **1つのサイト（自己紹介ページ「トリセツ」）を育てていく** 構成。
毎回、前回のフォルダをコピーして続きから作る。

---

## 教える側へのメモ

- **1回あたり60〜90分**を想定している。スライドは前半が説明、後半（章扉のあと）が実習。
- 各回の宿題として [`reference/exercises.html`](reference/exercises.html) の練習問題を出している。
  **ヒントと答えは折りたたみ**なので、先に自分で書かせてから開かせて。
  デバッグ問題（わざとバグらせたコードを直す）も入れてある。
- スライドの実習パートに入ったら、**必ず手を動かす時間を取って。** 説明を最後まで聞かせてから作らせると、まとめて忘れる。
- `practice/` の見本は、**先に自分で書かせてから**開かせて。
- **DAY 4 が終わったら [`final/oshi/`](final/oshi/index.html) の応用演習を出して。** ここが「見本を写す」から
  「白紙から作る」への切り替え点。画像は初回までに用意させておくと、授業中に探す時間が消える。
- 市販の入門書と併用するなら [`reference/book-map.html`](reference/book-map.html) を見て。
  **章まるごとでは宿題に出せない**（本の CHAPTER 2 に DAY 2 の範囲が混ざっているため）。節で区切って出す。
- DAY 7 がこの講座の山場。文法ではなく **作り方の手順** を教える回なので、時間を多めに。
  資料の [`reference/workflow.html`](reference/workflow.html) が対応するまとめ（印刷して配れる）。
- つまずいたときは [`reference/errors.html`](reference/errors.html) を一緒に開くのが早い。
- **時間配分・詰まりポイント・声かけ例**は [`reference/teaching-guide.html`](reference/teaching-guide.html) にまとめた。
- 初回までに [`reference/setup.html`](reference/setup.html) を渡して環境構築を済ませてもらうと、DAY 0 が1回分浮く。
- 説明で伝わらないときは [`playground/css-lab.html`](playground/css-lab.html) を開いて
  **スライダーを動かして見せて**ください。padding と margin の違いなどは、言葉より一発。
- DAY 5 でいきなり手が止まるようなら、[`playground/block-lab.html`](playground/block-lab.html) を先に。
  **ブロックを積むだけ**で流れ図とプログラムが同時にできるので、
  「打ち間違い」と戦わずに「上から順に実行される」だけを先に体で覚えられる。

---

## 素材について

- `assets/char/` のキャラクター画像（ななもん・りあん・うさぎ）は**自作**。
  この教材といっしょに公開して問題ない。
- 背景の木目（`assets/wood.jpg`）はフリー素材。
  配布元がクレジット表記を求めている場合は、ここに書き足すこと。
- スクリーンショット（`assets/shots/`）は、この教材に含まれる実習ファイルを
  実際にブラウザ／VSCode で開いて撮影したものだ。

---

## 教材を作り直したいとき（`tools/`）

実習ファイルを書き換えたら、スクリーンショットも撮り直せる。

```bash
# ブラウザのスクショを撮る（jobs.json に対象を書いておく）
node tools/shoot.js jobs.json

# スライドが1280x720の枠からはみ出していないか検査する
node tools/check.js slides/day1.html slides/day2.html
```

VSCode の画面を撮るスクリプトもある。どちらもクリーンなプロファイルで
新しいウィンドウを開くので、ふだんの設定や開いていたファイルは写らない。

```powershell
# VSCode を1枚だけ撮る
powershell -ExecutionPolicy Bypass -File tools/shoot-vscode.ps1 -Folder <フォルダ> -Out <出力先>

# 「ファイルを作る → 書く → 保存する」の操作を連番で6枚撮る
powershell -ExecutionPolicy Bypass -File tools/shoot-vscode-flow.ps1

# 撮ったスクショの一部を切り出す（切り出す範囲はスクリプト内の表）
powershell -ExecutionPolicy Bypass -File tools/crop.ps1
```

ブラウザと **F12（DevTools）の実画面** を撮るスクリプトもある。

```powershell
# DevTools を開いた状態のブラウザを撮る
powershell -ExecutionPolicy Bypass -File tools/shoot-browser.ps1 `
  -Url "http://127.0.0.1:8899/index.html" -Out "../assets/shots/devtools-console.png" -Keys "^]^]"
```

`-Keys` は DevTools のパネル移動（`^]` で次のパネル）。撮影用のダミーページは
`tools/devtools-demo/`（授業では使わない）。`?mode=error` を付けるとわざとエラーを出す。
`file://` だと余計な赤いエラーが出るので、**ローカルサーバー経由で開く**こと。

`^]` を並べても届かないパネル（Application など）は、DevTools の
**コマンドメニュー**（`Ctrl+Shift+P`）から名前で開く。
一気に送ると間に合わないので `-KeySteps` に分けて渡す（1つごとに間が空く）。

```powershell
# Application → Local storage を開いて撮る
#   PowerShell の配列を渡すので、-File ではなく & で呼ぶこと
& .\tools\shoot-browser.ps1 `
  -Url "http://127.0.0.1:8899/tools/devtools-demo/storage.html" `
  -Out "..\assets\shots\devtools-storage.png" `
  -KeySteps '^+p','Application','{ENTER}','{DOWN 5}','{RIGHT}','{DOWN}','{ESC}'
```

`{DOWN 5}` で左の一覧を Local storage まで下げ、`{RIGHT}` で開き、
`{DOWN}` でアドレスを選ぶ（ここで中身の表が出る）。最後の `{ESC}` は下の Console を閉じるため。

```powershell
cd tools/devtools-demo
python -m http.server 8899
```

> **InPrivate で起動している。** ふつうに起動すると Edge が Windows のアカウントで
> 勝手にサインインし、「同期しています」のダイアログに**メールアドレスが写り込む**。
> スクショを撮り直すときは、この指定を外さないこと。

`shoot-vscode-flow.ps1` は**実行中、前面のウィンドウにキーを送る。**
1分ほどかかるので、その間はPCを触らないで。
出力は `flow-1`〜`flow-6`（全画面）と、`crop.ps1` が作る `flow-c1`〜`flow-c5`（切り出し済み）。
DAY 0 の「ファイルを作って、保存するまで」のスライドが後者を使っている。

> PowerShell 5.1 は BOM なし UTF-8 のスクリプトを cp932 として読むため、
> 日本語コメントの行末で改行が消えて構文エラーになる。
> `tools/*.ps1` を編集するときは **UTF-8 (BOM付き)** で保存して。

Node.js と Microsoft Edge（または Chrome）が必要。

---

## 前の教材から引き継いだもの

以前の授業スライド（HP制作 1〜3回目）を読み、次の点を取り入れた。

- **問題 → ヒント → 答え** の反復。いちばん効いていた仕組みなので、
  [`reference/exercises.html`](reference/exercises.html) として独立させた。
- **わざとバグらせたコードを直させる**デバッグ問題（じゃんけんの空入力バグなど）。
- **Emmet を積極的に使う**（`ul>li*6` や `table>(tr>th*2)+(tr>td*2)*3` まで）。DAY 1 に1枚追加。
- **音を鳴らす／なめらかスクロール／ダイアログ** の小ネタ。DAY 5 に1枚追加。
- **「まず構想を練ってから作る」** という進め方。DAY 7 と `workflow.html` の骨格になっている。

学校名・生徒向けの発表評価など、特定の場に紐づく内容は入れていない。
