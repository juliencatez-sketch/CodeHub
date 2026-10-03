$root = Join-Path $PSScriptRoot "scripts"
$files = Get-ChildItem -Path $root -Recurse -Filter *.json | Where-Object { $_.Name -ne "manifest.json" }
$result = @()
foreach ($file in $files) {
  try {
    $obj = Get-Content $file.FullName -Raw | ConvertFrom-Json
    $result += $obj
  } catch {
    Write-Warning "JSON invalide : $($file.FullName)"
  }
}
$result | ConvertTo-Json -Depth 20 | Set-Content (Join-Path $root "manifest.json") -Encoding UTF8
Write-Host "Manifest mis à jour : $($result.Count) scripts."
