# =========================================================
# スクショの一部を切り出す
#
#  スライドに全画面のスクショを並べると、肝心のところが小さすぎて読めない。
#  「エクスプローラーの左上だけ」「タブのところだけ」のように切り出して使う。
#
#  使い方:  powershell -ExecutionPolicy Bypass -File tools/crop.ps1
# =========================================================
Add-Type -AssemblyName System.Drawing

$shots = Join-Path $PSScriptRoot "..\assets\shots"
$shots = (Resolve-Path $shots).Path

# 元ファイル, 出力名, X, Y, 幅, 高さ
$jobs = @(
  @("flow-1-empty.png",    "flow-c1-empty.png",     55, 36, 302, 100),
  @("flow-2-newicon.png",  "flow-c2-newicon.png",   55, 36, 302, 100),
  @("flow-3-filename.png", "flow-c3-filename.png",  55, 36, 302, 100),
  @("flow-5-dirty.png",    "flow-c4-dirty.png",    356, 30, 136,  40),
  @("flow-6-saved.png",    "flow-c5-saved.png",    356, 30, 136,  40),
  @("vscode-js.png",       "day5-3files.png",       55, 36, 302, 145),

  # DevTools（F12）。パネルのところだけを切り出す
  @("devtools-console.png",  "dt-console.png",       802, 85, 556, 220),
  @("devtools-error.png",    "dt-error.png",         802, 85, 556, 220),
  @("devtools-elements.png", "dt-elements.png",      802, 85, 556, 400),
  @("devtools-storage.png",  "dt-storage.png",       802, 85, 556, 420)
)

foreach ($j in $jobs) {
  $src = Join-Path $shots $j[0]
  $dst = Join-Path $shots $j[1]
  if (-not (Test-Path $src)) { Write-Host ("NG  元がない: " + $j[0]); continue }

  $img = [System.Drawing.Image]::FromFile($src)
  $rect = New-Object System.Drawing.Rectangle($j[2], $j[3], $j[4], $j[5])
  $bmp = New-Object System.Drawing.Bitmap($j[4], $j[5])
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $j[4], $j[5])), $rect, [System.Drawing.GraphicsUnit]::Pixel)
  $bmp.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose(); $img.Dispose()
  Write-Host ("OK  " + $j[1] + "  (" + $j[4] + " x " + $j[5] + ")")
}
