$ErrorActionPreference = "Stop"

$inputJson = [Console]::In.ReadToEnd()
if (-not $inputJson) {
  exit 0
}

$blockedPatterns = @(
  "rm -rf /",
  "git reset --hard",
  "git checkout --",
  "Remove-Item -Recurse -Force C:\",
  "Remove-Item -Recurse -Force $HOME"
)

foreach ($pattern in $blockedPatterns) {
  if ($inputJson -like "*$pattern*") {
    [PSCustomObject]@{
      decision = "block"
      reason = "Blocked high-risk command pattern: $pattern"
    } | ConvertTo-Json -Compress
    exit 0
  }
}

exit 0
