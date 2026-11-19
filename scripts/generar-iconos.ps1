# Genera los iconos de la app a partir de logo1.png (cuadrado, 1254x1254).
# El logo es un cuadrado redondeado con borde burdeos sobre fondo negro: las
# esquinas negras se pintan del burdeos del borde para que no asomen cuando
# el iPhone recorta el icono con sus propias esquinas.
# Solo usa .NET (System.Drawing), que viene con Windows.
#
# Uso:  powershell -File scripts\generar-iconos.ps1
# Deja:
#   app\apple-icon.png    (180 px, icono del iPhone al "Añadir a inicio")
#   app\icon.png          (64 px, pestaña del navegador)
#   public\icono-192.png y public\icono-512.png (manifiesto, Android)
#   public\logo.png       (256 px, el que sale en la barra de arriba)
param([string]$Origen = "logo1.png")
Add-Type -AssemblyName System.Drawing
$raiz = Split-Path -Parent $PSScriptRoot
$src = [System.Drawing.Bitmap]::FromFile((Join-Path $raiz $Origen))
$bmp = New-Object System.Drawing.Bitmap $src.Width, $src.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp); $g.DrawImage($src, 0, 0, $src.Width, $src.Height); $g.Dispose(); $src.Dispose()

$rect = New-Object System.Drawing.Rectangle 0, 0, $bmp.Width, $bmp.Height
$datos = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$bytes = New-Object byte[] ($datos.Stride * $bmp.Height)
[System.Runtime.InteropServices.Marshal]::Copy($datos.Scan0, $bytes, 0, $bytes.Length)
# Burdeos del borde del logo (BGRA)
$B = 0x1E; $G = 0x0A; $R = 0x7F
for ($i = 0; $i -lt $bytes.Length; $i += 4) {
  if (([int]$bytes[$i] + $bytes[$i + 1] + $bytes[$i + 2]) -lt 90) {
    $bytes[$i] = $B; $bytes[$i + 1] = $G; $bytes[$i + 2] = $R; $bytes[$i + 3] = 255
  }
}
[System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $datos.Scan0, $bytes.Length)
$bmp.UnlockBits($datos)

function Guardar($tam, $ruta) {
  $o = New-Object System.Drawing.Bitmap $tam, $tam
  $g2 = [System.Drawing.Graphics]::FromImage($o)
  $g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g2.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g2.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $g2.DrawImage($bmp, 0, 0, $tam, $tam)
  $g2.Dispose()
  $o.Save((Join-Path $raiz $ruta), [System.Drawing.Imaging.ImageFormat]::Png)
  $o.Dispose()
  Write-Output "$ruta ($tam px)"
}
New-Item -ItemType Directory -Force (Join-Path $raiz "public") | Out-Null
Guardar 180 "app\apple-icon.png"
Guardar 64 "app\icon.png"
Guardar 192 "public\icono-192.png"
Guardar 512 "public\icono-512.png"
Guardar 256 "public\logo.png"
$bmp.Dispose()
