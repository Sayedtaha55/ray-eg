$conns = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue
if ($conns) {
    foreach ($c in $conns) {
        Write-Host "Killing PID: $($c.OwningProcess)"
        Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
    }
} else {
    Write-Host "No process on port 4000"
}
Start-Sleep -Seconds 2
Write-Host "Port 4000 cleared, starting backend..."
