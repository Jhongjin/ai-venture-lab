param(
  [string]$Url = $(if ($env:SMOKE_URL) { $env:SMOKE_URL } else { "https://ai-venture-lab.vercel.app" })
)

$ErrorActionPreference = "Stop"

$response = Invoke-WebRequest -Uri $Url -UseBasicParsing

if ($response.StatusCode -ne 200) {
  Write-Error "Production smoke failed: expected HTTP 200 but received $($response.StatusCode)."
}

$content = [string]$response.Content
$requiredText = @(
  "<!DOCTYPE html>",
  "_next/static",
  "AI Venture Lab",
  "live decision map",
  "avl-decision"
)

$missing = @()
foreach ($text in $requiredText) {
  if (-not $content.Contains($text)) {
    $missing += $text
  }
}

if ($missing.Count -gt 0) {
  Write-Error ("Production smoke failed: missing expected text: " + ($missing -join ", "))
}

Write-Host "Production smoke passed for $Url"
