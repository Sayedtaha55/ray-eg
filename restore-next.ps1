param(
    [string]$BackupDir = "C:\\Users\\Dream\\next-backups",
    [string]$ZipFile = ""
)

if ($ZipFile -eq "") {
    $zip = Get-ChildItem -Path $BackupDir -Filter 'apps-web-*.zip' -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if (-not $zip) {
        Write-Error "No backup zip found in $BackupDir"
        exit 1
    }
    $ZipFile = $zip.FullName
}

$dest = Join-Path (Get-Location) 'apps\\web'
if (Test-Path $dest) {
    Write-Error "Destination $dest already exists. Remove or rename it before restoring."
    exit 1
}

Write-Output "Restoring backup:`n  Zip: $ZipFile`n  Destination: $dest"
try {
    Expand-Archive -Path $ZipFile -DestinationPath $dest -Force -ErrorAction Stop
    Write-Output 'Restore completed.'
} catch {
    Write-Error "Restore failed: $_"
    exit 1
}
