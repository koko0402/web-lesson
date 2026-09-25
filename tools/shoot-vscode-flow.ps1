# =========================================================
# 「ファイルを作る → 書く → 保存する」の操作スクショを連番で撮る
#
#  shoot-vscode.ps1 との違い:
#   ・1回の起動で複数枚撮る（キー操作をはさみながら）
#   ・専用プロファイルに keybindings.json も置くので
#     「新しいファイル」をキーボードから呼べる
#   ・オートクローズ／補完を切ってあるので打ち込みが暴れない
#
#  使い方:  powershell -ExecutionPolicy Bypass -File tools/shoot-vscode-flow.ps1
#
#  ※ 実行中は前面のウィンドウにキーを送ります。PCを触らないでください。
# =========================================================
param(
  [string]$OutDir = "$PSScriptRoot\..\assets\shots",
  [int]$WaitSec = 14
)

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class WinApi2 {
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int c);
  [DllImport("user32.dll")] public static extern bool MoveWindow(IntPtr h, int x, int y, int w, int t, bool repaint);
}
"@

$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$OutDir = (Resolve-Path $OutDir).Path

# ---------- 専用プロファイルを用意する ----------
function New-Profile {
  $tmp = Join-Path $env:TEMP ("vscflow_" + [System.Guid]::NewGuid().ToString("N").Substring(0,8))
  [System.IO.Directory]::CreateDirectory((Join-Path $tmp "User")) | Out-Null

  # 撮影用の設定。補完・オートクローズは切る（キー送信が化けるため）
@'
{
  "workbench.startupEditor": "none",
  "workbench.tips.enabled": false,
  "workbench.colorTheme": "Default Dark Modern",
  "window.commandCenter": false,
  "chat.commandCenter.enabled": false,
  "update.showReleaseNotes": false,
  "telemetry.telemetryLevel": "off",
  "editor.fontSize": 15,
  "editor.lineHeight": 1.7,
  "editor.minimap.enabled": false,
  "editor.renderWhitespace": "none",
  "explorer.compactFolders": false,
  "explorer.confirmDelete": false,
  "breadcrumbs.enabled": false,
  "workbench.activityBar.location": "default",
  "editor.autoClosingBrackets": "never",
  "editor.autoClosingQuotes": "never",
  "editor.quickSuggestions": false,
  "editor.suggestOnTriggerCharacters": false,
  "editor.acceptSuggestionOnEnter": "off",
  "editor.tabCompletion": "off",
  "editor.parameterHints.enabled": false,
  "html.autoClosingTags": false,
  "emmet.showExpandedAbbreviation": "never",
  "editor.lightbulb.enabled": "off",
  "workbench.secondarySideBar.defaultVisibility": "hidden",
  "chat.experimental.offerSetup": false,
  "workbench.statusBar.visible": true
}
'@ | Out-File -FilePath "$tmp\User\settings.json" -Encoding utf8

  # エクスプローラーの「新しいファイル」を Ctrl+Alt+N で呼べるようにする
@'
[
  { "key": "ctrl+alt+n", "command": "explorer.newFile" },
  { "key": "ctrl+alt+b", "command": "workbench.action.closeAuxiliaryBar" }
]
'@ | Out-File -FilePath "$tmp\User\keybindings.json" -Encoding utf8

  return $tmp
}

# ---------- VSCode を起動して前面に出す ----------
function Start-Code {
  param([string]$Profile, [string]$Folder, [string]$OpenFile = "")

  $a = @("--new-window", "--user-data-dir", $Profile, "--extensions-dir", "$Profile\ext",
         "--disable-workspace-trust", "--skip-release-notes", $Folder)
  if ($OpenFile -ne "") { $a += $OpenFile }

  $code = Get-Command code -ErrorAction SilentlyContinue
  if ($null -eq $code) { throw "code コマンドが見つかりません" }

  Start-Process -FilePath $code.Source -ArgumentList $a -WindowStyle Normal
  Start-Sleep -Seconds $WaitSec

  $p = Get-Process -Name "Code" -ErrorAction SilentlyContinue |
       Where-Object { $_.MainWindowTitle -ne "" } |
       Sort-Object StartTime -Descending | Select-Object -First 1
  if ($null -eq $p) { throw "VSCode のウィンドウが見つかりません" }

  $h = $p.MainWindowHandle
  [WinApi2]::ShowWindow($h, 9) | Out-Null

  # 画面からはみ出すとタスクバーや壁紙が写り込むので、作業領域にぴったり収める
  $wa = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea
  [WinApi2]::MoveWindow($h, $wa.X, $wa.Y, $wa.Width, $wa.Height, $true) | Out-Null
  [WinApi2]::SetForegroundWindow($h) | Out-Null
  Start-Sleep -Seconds 3

  for ($i = 0; $i -lt 3; $i++) {
    [WinApi2]::SetForegroundWindow($h) | Out-Null
    [System.Windows.Forms.SendKeys]::SendWait("{ESC}")
    Start-Sleep -Milliseconds 700
  }

  # 右側の Chat パネルを閉じる
  [WinApi2]::SetForegroundWindow($h) | Out-Null
  [System.Windows.Forms.SendKeys]::SendWait("%^b")
  Start-Sleep -Seconds 2
  return $p
}

# ---------- ウィンドウを撮る ----------
function Save-Shot {
  param([System.Diagnostics.Process]$Proc, [string]$Name)

  $h = $Proc.MainWindowHandle
  [WinApi2]::SetForegroundWindow($h) | Out-Null
  Start-Sleep -Milliseconds 900

  $r = New-Object WinApi2+RECT
  [WinApi2]::GetWindowRect($h, [ref]$r) | Out-Null
  $w = $r.R - $r.L
  $t = $r.B - $r.T

  $bmp = New-Object System.Drawing.Bitmap($w, $t)
  $g   = [System.Drawing.Graphics]::FromImage($bmp)
  $g.CopyFromScreen($r.L, $r.T, 0, 0, $bmp.Size)
  $path = Join-Path $OutDir $Name
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
  Write-Host ("  撮影  " + $Name + "  (" + $w + " x " + $t + ")")
}

function Send-Key {
  param([System.Diagnostics.Process]$Proc, [string]$Keys, [int]$Ms = 900)
  [WinApi2]::SetForegroundWindow($Proc.MainWindowHandle) | Out-Null
  Start-Sleep -Milliseconds 300
  [System.Windows.Forms.SendKeys]::SendWait($Keys)
  Start-Sleep -Milliseconds $Ms
}

function Stop-Code {
  param([System.Diagnostics.Process]$Proc, [string]$Profile)
  Stop-Process -Id $Proc.Id -Force -ErrorAction SilentlyContinue
  Start-Sleep -Seconds 2
  try { Remove-Item -Recurse -Force $Profile -ErrorAction Stop } catch {}
}

# =========================================================
#  第1幕 ── 空のフォルダから index.html を作る
# =========================================================
$work = Join-Path $env:TEMP ("day1_" + [System.Guid]::NewGuid().ToString("N").Substring(0,6))
New-Item -ItemType Directory -Force -Path $work | Out-Null
# 見た目をそろえるためフォルダ名は day1 に
$work = Join-Path $work "day1"
New-Item -ItemType Directory -Force -Path $work | Out-Null

Write-Host "第1幕: 空のフォルダ → 新しいファイル"
$prof = New-Profile
$p = Start-Code -Profile $prof -Folder $work

Save-Shot -Proc $p -Name "flow-1-empty.png"

# エクスプローラーにフォーカスすると「新しいファイル」などのアイコンが現れる。
# ここが初心者のいちばん見つけられない場所なので、1枚単独で撮る。
Send-Key -Proc $p -Keys "^+e" -Ms 1400
Save-Shot -Proc $p -Name "flow-2-newicon.png"

Send-Key -Proc $p -Keys "%^n" -Ms 1400          # 新しいファイル（Ctrl+Alt+N）
Send-Key -Proc $p -Keys "index.html" -Ms 1200   # まだ Enter は押さない
Save-Shot -Proc $p -Name "flow-3-filename.png"

Send-Key -Proc $p -Keys "{ENTER}" -Ms 2500      # 作成してエディタが開く
Save-Shot -Proc $p -Name "flow-4-created.png"

Stop-Code -Proc $p -Profile $prof

# =========================================================
#  第2幕 ── 書いた直後（未保存）と、保存したあと
# =========================================================
$file = Join-Path $work "index.html"
$body = @'
<h1>はじめてのページ</h1>
<p>今日から Web を作ります。</p>
'@
# Out-File -Encoding utf8 は PS5.1 だと BOM が付き、ステータスバーが
# "UTF-8 with BOM" になってしまうので、BOM なしで書く
[System.IO.File]::WriteAllText($file, $body, (New-Object System.Text.UTF8Encoding($false)))

Write-Host "第2幕: 未保存 → 保存"
$prof2 = New-Profile
$p2 = Start-Code -Profile $prof2 -Folder $work -OpenFile $file

# エディタの末尾に移動して、見た目に影響しない1文字を足す＝未保存状態を作る
Send-Key -Proc $p2 -Keys "^{END}" -Ms 700
Send-Key -Proc $p2 -Keys " " -Ms 1200
Save-Shot -Proc $p2 -Name "flow-5-dirty.png"

Send-Key -Proc $p2 -Keys "^s" -Ms 2000
Save-Shot -Proc $p2 -Name "flow-6-saved.png"

Stop-Code -Proc $p2 -Profile $prof2

try { Remove-Item -Recurse -Force (Split-Path $work) -ErrorAction Stop } catch {}

Write-Host ""
Write-Host "完了。出力先: $OutDir"
