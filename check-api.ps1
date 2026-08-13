try {
    $r = Invoke-WebRequest -Uri 'http://localhost:4000/api/v1/shops/me' -Method GET -UseBasicParsing -ErrorAction Stop
    Write-Output "Status: $($r.StatusCode)"
    Write-Output $r.Content
} catch {
    Write-Output "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Output "Response: $($sr.ReadToEnd())"
    }
}
