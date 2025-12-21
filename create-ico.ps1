Add-Type -AssemblyName System.Drawing

# Paths
$buildDir = Join-Path $PSScriptRoot "build"
$icoPath = Join-Path $buildDir "icon.ico"

# Load PNGs
$sizes = @(256, 128, 64, 32, 16)
$bitmaps = @()

foreach ($size in $sizes) {
    $pngPath = Join-Path $buildDir "icon-$size.png"
    if (Test-Path $pngPath) {
        $bitmaps += [System.Drawing.Bitmap]::new($pngPath)
        Write-Host "Loaded icon-$size.png" -ForegroundColor Green
    }
}

if ($bitmaps.Count -eq 0) {
    Write-Host "No PNG files found!" -ForegroundColor Red
    exit 1
}

# Create ICO file
$iconStream = [System.IO.FileStream]::new($icoPath, [System.IO.FileMode]::Create)
$iconWriter = [System.IO.BinaryWriter]::new($iconStream)

# ICO header
$iconWriter.Write([UInt16]0)  # Reserved
$iconWriter.Write([UInt16]1)  # Type: 1 = ICO
$iconWriter.Write([UInt16]$bitmaps.Count)  # Number of images

# Calculate offset
$offset = 6 + ($bitmaps.Count * 16)

# Write directory entries
foreach ($bitmap in $bitmaps) {
    $width = if ($bitmap.Width -ge 256) { 0 } else { [byte]$bitmap.Width }
    $height = if ($bitmap.Height -ge 256) { 0 } else { [byte]$bitmap.Height }
    
    $iconWriter.Write($width)
    $iconWriter.Write($height)
    $iconWriter.Write([byte]0)  # Color palette
    $iconWriter.Write([byte]0)  # Reserved
    $iconWriter.Write([UInt16]1)  # Color planes
    $iconWriter.Write([UInt16]32)  # Bits per pixel
    
    # Convert bitmap to PNG bytes
    $ms = New-Object System.IO.MemoryStream
    $bitmap.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $imageBytes = $ms.ToArray()
    $ms.Close()
    
    $iconWriter.Write([UInt32]$imageBytes.Length)  # Size
    $iconWriter.Write([UInt32]$offset)  # Offset
    
    $offset += $imageBytes.Length
}

# Write image data
foreach ($bitmap in $bitmaps) {
    $ms = New-Object System.IO.MemoryStream
    $bitmap.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $imageBytes = $ms.ToArray()
    $iconWriter.Write($imageBytes)
    $ms.Close()
}

$iconWriter.Close()
$iconStream.Close()

# Cleanup
foreach ($bitmap in $bitmaps) {
    $bitmap.Dispose()
}

Write-Host ""
Write-Host "Created icon.ico successfully!" -ForegroundColor Green
Write-Host "Location: $icoPath" -ForegroundColor Cyan
