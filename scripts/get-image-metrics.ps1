param(
  [Parameter(Mandatory = $true, ValueFromRemainingArguments = $true)]
  [string[]]$Paths
)

Add-Type -AssemblyName System.Drawing

function Get-Luminance {
  param([System.Drawing.Color]$Color)

  return (0.2126 * $Color.R) + (0.7152 * $Color.G) + (0.0722 * $Color.B)
}

function Get-ImageMetrics {
  param([string]$Path)

  $bitmap = [System.Drawing.Bitmap]::FromFile($Path)

  try {
    $width = $bitmap.Width
    $height = $bitmap.Height
    $stepX = [Math]::Max([int][Math]::Floor($width / 24), 1)
    $stepY = [Math]::Max([int][Math]::Floor($height / 24), 1)
    $sum = 0.0
    $sum2 = 0.0
    $edgeTotal = 0.0
    $colorTotal = 0.0
    $count = 0

    for ($x = 0; $x -lt $width; $x += $stepX) {
      for ($y = 0; $y -lt $height; $y += $stepY) {
        $pixel = $bitmap.GetPixel($x, $y)
        $luminance = Get-Luminance -Color $pixel
        $sum += $luminance
        $sum2 += ($luminance * $luminance)

        $rg = [Math]::Abs($pixel.R - $pixel.G)
        $yb = [Math]::Abs((0.5 * ($pixel.R + $pixel.G)) - $pixel.B)
        $colorTotal += [Math]::Sqrt(($rg * $rg) + ($yb * $yb))

        if ($x -ge $stepX -and $y -ge $stepY) {
          $left = $bitmap.GetPixel($x - $stepX, $y)
          $up = $bitmap.GetPixel($x, $y - $stepY)
          $leftLum = Get-Luminance -Color $left
          $upLum = Get-Luminance -Color $up
          $edgeTotal += [Math]::Abs($luminance - $leftLum) + [Math]::Abs($luminance - $upLum)
        }

        $count += 1
      }
    }

    $averageBrightness = if ($count -gt 0) { $sum / $count } else { 0 }
    $variance = if ($count -gt 0) { ($sum2 / $count) - ($averageBrightness * $averageBrightness) } else { 0 }
    if ($variance -lt 0) { $variance = 0 }
    $contrastDeviation = [Math]::Sqrt($variance)
    $edgeStrength = if ($count -gt 0) { $edgeTotal / $count } else { 0 }
    $colorfulness = if ($count -gt 0) { $colorTotal / $count } else { 0 }

    $hashValues = New-Object System.Collections.Generic.List[Double]
    for ($xi = 0; $xi -lt 8; $xi += 1) {
      for ($yi = 0; $yi -lt 8; $yi += 1) {
        $sampleX = [Math]::Min([int](($xi + 0.5) * $width / 8), $width - 1)
        $sampleY = [Math]::Min([int](($yi + 0.5) * $height / 8), $height - 1)
        $hashValues.Add((Get-Luminance -Color $bitmap.GetPixel($sampleX, $sampleY)))
      }
    }

    $hashAverage = ($hashValues | Measure-Object -Average).Average
    $perceptualHash = -join ($hashValues | ForEach-Object { if ($_ -ge $hashAverage) { '1' } else { '0' } })

    [pscustomobject]@{
      path = $Path
      width = $width
      height = $height
      averageBrightness = [Math]::Round($averageBrightness, 2)
      contrastDeviation = [Math]::Round($contrastDeviation, 2)
      edgeStrength = [Math]::Round($edgeStrength, 2)
      colorfulness = [Math]::Round($colorfulness, 2)
      perceptualHash = $perceptualHash
      sampleCount = $count
      format = $bitmap.RawFormat.ToString()
    }
  }
  finally {
    $bitmap.Dispose()
  }
}

$results = foreach ($path in $Paths) {
  if (-not (Test-Path -LiteralPath $path)) {
    continue
  }

  try {
    Get-ImageMetrics -Path $path
  }
  catch {
    [pscustomobject]@{
      path = $path
      error = $_.Exception.Message
    }
  }
}

$results | ConvertTo-Json -Depth 5 -Compress
