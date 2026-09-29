# =========================================================
# ブラウザ＋DevTools（F12）の実画面を撮る
#
#  ・専用の空プロファイルで起動するので、ふだんの履歴や拡張は写らない
#  ・--auto-open-devtools-for-tabs で、開いた瞬間から F12 が出ている
#  ・撮るのはブラウザのウィンドウ内だけ
#
#  使い方:
#    powershell -ExecutionPolicy Bypass -File tools/shoot-browser.ps1 `
#      -Url "file:///.../index.html" -Out "..\assets\shots\devtools-console.png" -Keys "^]"
#
#  ※ 実行中は前面のウィンドウにキーを送る。PCを触らないこと。
# =========================================================
param(
  [Parameter(Mandatory=$true)][string]$Url,
  [Parameter(Mandatory=$true)][string]$Out,
  [string]$Keys = "",          # DevTools のパネル切り替えなど（^] で次のパネル）
  [string[]]$KeySteps = @(),   # 1つ送るたびに間を置きたいとき（コマンドメニューなど）
  [int]$StepWaitMs = 1400,     # KeySteps の 1つ 1つのあいだの待ち時間
  [int]$WaitSec = 9
)

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class WinApi3 {
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int c);
  [DllImport("user32.dll")] public static extern bool MoveWindow(IntPtr h, int x, int y, int w, int t, bool repaint);
}
"@

$ErrorActionPreference = "Stop"

$cands = @(
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Google\Chrome\Application\chrome.exe"
)
$exe = $null
foreach ($c in $cands) { if (Test-Path $c) { $exe = $c; break } }
if ($null -eq $exe) { Write-Host "NG  ブラウザが見つかりません"; exit 1 }

$tmp = Join-Path $env:TEMP ("br_shot_" + [System.Guid]::NewGuid().ToString("N").Substring(0,8))

# InPrivate / シークレットで開く。
#   これをやらないと Edge が Windows のアカウントで勝手にサインインし、
#   「同期しています」のダイアログに<メールアドレスが出てしまう>。
#   教材のスクショに個人情報を写さないための必須指定。
$private = if ($exe -like "*msedge*") { "--inprivate" } else { "--incognito" }

$args = @(
  "--user-data-dir=$tmp",
  $private,
  "--no-first-run", "--no-default-browser-check",
  "--disable-sync", "--disable-signin-promo",
  "--disable-extensions", "--disable-features=Translate,msEdgeSplitScreen",
  "--auto-open-devtools-for-tabs",
  "--new-window", $Url
)

Start-Process -FilePath $exe -ArgumentList $args -WindowStyle Normal
Start-Sleep -Seconds $WaitSec

$p = Get-Process -Name "msedge","chrome" -ErrorAction SilentlyContinue |
     Where-Object { $_.MainWindowTitle -ne "" } |
     Sort-Object StartTime -Descending | Select-Object -First 1
if ($null -eq $p) { Write-Host "NG  ウィンドウが見つかりません"; exit 1 }

$h = $p.MainWindowHandle
[WinApi3]::ShowWindow($h, 9) | Out-Null

# 画面の作業領域にぴったり収める（はみ出すと壁紙が写る）
$wa = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea
[WinApi3]::MoveWindow($h, $wa.X, $wa.Y, $wa.Width, $wa.Height, $true) | Out-Null
[WinApi3]::SetForegroundWindow($h) | Out-Null
Start-Sleep -Seconds 3

# 初回に出るダイアログ類を Esc で閉じる
for ($i = 0; $i -lt 3; $i++) {
  [WinApi3]::SetForegroundWindow($h) | Out-Null
  [System.Windows.Forms.SendKeys]::SendWait("{ESC}")
  Start-Sleep -Milliseconds 600
}

# DevTools は --auto-open-devtools-for-tabs で最初から開いている。
# （F12 を送ると Edge が「開きますか？」の確認を出すので使わない）
# 開いた直後は Welcome タブなので、パネル移動は -Keys で渡す（^] = 次へ）
Start-Sleep -Seconds 2

if ($Keys -ne "") {
  [WinApi3]::SetForegroundWindow($h) | Out-Null
  Start-Sleep -Milliseconds 500
  [System.Windows.Forms.SendKeys]::SendWait($Keys)
  Start-Sleep -Seconds 2
}

# 一気に送ると間に合わない操作（例：Ctrl+Shift+P でコマンドメニューを開き、
# パネル名を打って Enter）は -KeySteps に分けて渡す。1つごとに間を置いて送る。
foreach ($step in $KeySteps) {
  [WinApi3]::SetForegroundWindow($h) | Out-Null
  Start-Sleep -Milliseconds 300
  [System.Windows.Forms.SendKeys]::SendWait($step)
  Start-Sleep -Milliseconds $StepWaitMs
}

[WinApi3]::SetForegroundWindow($h) | Out-Null
Start-Sleep -Milliseconds 900

$r = New-Object WinApi3+RECT
[WinApi3]::GetWindowRect($h, [ref]$r) | Out-Null
$w = $r.R - $r.L
$t = $r.B - $r.T

$bmp = New-Object System.Drawing.Bitmap($w, $t)
$g   = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen($r.L, $r.T, 0, 0, $bmp.Size)
New-Item -ItemType Directory -Force -Path (Split-Path $Out) | Out-Null
$bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()

Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
try { Remove-Item -Recurse -Force $tmp -ErrorAction Stop } catch {}

if (Test-Path $Out) { Write-Host ("OK  " + (Split-Path $Out -Leaf) + "  (" + $w + " x " + $t + ")") }
else { Write-Host "NG  $Out" }
