Set-Location 'C:\Users\Dream\ray-eg-1\apps\dashboard-web'
$out = & npx tsc --noEmit -p tsconfig.json 2>&1
Write-Host "TSC_EXIT=$LASTEXITCODE"
if ($out) { $out | Select-Object -First 20 | ForEach-Object { Write-Host $_ } } else { Write-Host 'NO ERRORS' }