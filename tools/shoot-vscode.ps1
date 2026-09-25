# =========================================================
# VSCode の実画面を撮る
#  ・専用の空プロファイル（--user-data-dir / --extensions-dir）で起動するので
#    ふだんの設定・拡張機能・開いていたファイルは一切写りません
#  ・撮るのは VSCode のウィンドウ内だけ（デスクトップ全体は撮りません）
# =========================================================
param(
  [Parameter(Mandatory=$true)][string]$Folder,
  [Parameter(Mandatory=$true)][string]$Out,
  [string]$OpenFile = "",
  [int]$WaitSec = 14
)

Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class WinApi {
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int c);
  [DllImport("user32.dll")] public static extern bool MoveWindow(IntPtr h, int x, int y, int w, int t, bool repaint);
}
"@

$tmp  = Join-Path $env:TEMP ("vsc_shot_" + [System.Guid]::NewGuid().ToString("N").Substring(0,8))

# 教材用に見やすい設定をあらかじめ書いておく（ウェルカム画面も抑止）
[System.IO.Directory]::CreateDirectory((Join-Path $tmp "User")) | Out-Null
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
  "breadcrumbs.enabled": false,
  "workbench.activityBar.location": "default"
}
'@ | Out-File -FilePath "$tmp\User\settings.json" -Encoding utf8

$args = @("--new-window", "--user-data-dir", $tmp, "--extensions-dir", "$tmp\ext",
          "--disable-workspace-trust", "--skip-release-notes", $Folder)
if ($OpenFile -ne "") { $args += $OpenFile }

$code = (Get-Command code -ErrorAction SilentlyContinue)
if ($null -eq $code) { Write-Host "NG  code コマンドが見つかりません"; exit 1 }

Start-Process -FilePath $code.Source -ArgumentList $args -WindowStyle Normal
Start-Sleep -Seconds $WaitSec

$p = Get-Process -Name "Code" -ErrorAction SilentlyContinue |
     Where-Object { $_.MainWindowTitle -ne "" } |
     Sort-Object StartTime -Descending | Select-Object -First 1

if ($null -eq $p) { Write-Host "NG  VSCode のウィンドウが見つかりません"; exit 1 }

$h = $p.MainWindowHandle
[WinApi]::ShowWindow($h, 9) | Out-Null          # 復元
[WinApi]::MoveWindow($h, 60, 40, 1440, 900, $true) | Out-Null
[WinApi]::SetForegroundWindow($h) | Out-Null
Start-Sleep -Seconds 3

# 初回に出るダイアログ類を Esc で閉じる
Add-Type -AssemblyName System.Windows.Forms
for ($i = 0; $i -lt 3; $i++) {
  [WinApi]::SetForegroundWindow($h) | Out-Null
  [System.Windows.Forms.SendKeys]::SendWait("{ESC}")
  Start-Sleep -Milliseconds 700
}
Start-Sleep -Seconds 3

$r = New-Object WinApi+RECT
[WinApi]::GetWindowRect($h, [ref]$r) | Out-Null
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

if (Test-Path $Out) { Write-Host "OK  $Out" } else { Write-Host "NG  $Out" }
