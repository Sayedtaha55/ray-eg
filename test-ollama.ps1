$body = @{
  model = "minimax-m2.5:cloud"
  messages = @(
    @{ role = "system"; content = "You are a helpful assistant." },
    @{ role = "user"; content = 'Return JSON: {"reply":"hello","applied":false}' }
  )
  temperature = 0.3
  max_tokens = 4096
  stream = $false
} | ConvertTo-Json -Depth 5

try {
  $r = Invoke-RestMethod -Uri "http://localhost:11434/v1/chat/completions" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
  $r | ConvertTo-Json -Depth 5
} catch {
  Write-Output "ERROR: $($_.Exception.Message)"
  Write-Output "STATUS: $($_.Exception.Response.StatusCode)"
}
