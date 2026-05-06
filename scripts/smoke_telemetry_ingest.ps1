param(
  [string]$BaseUrl = $(if ($env:TELEMETRY_SMOKE_URL) { $env:TELEMETRY_SMOKE_URL } else { "https://ai-venture-lab.vercel.app" }),
  [string]$Secret = $env:TELEMETRY_INGEST_SECRET,
  [string]$IdeaId = $env:TELEMETRY_SMOKE_IDEA_ID
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($Secret)) {
  Write-Error "Telemetry smoke requires TELEMETRY_INGEST_SECRET. Set it in the current terminal before running pnpm smoke:telemetry."
}

if ([string]::IsNullOrWhiteSpace($IdeaId)) {
  Write-Error "Telemetry smoke requires TELEMETRY_SMOKE_IDEA_ID. Use an existing idea id from Supabase or the Learning Loop adapter guide."
}

$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$payload = @{
  ideaId = $IdeaId
  eventName = "product_core_action"
  eventCategory = "product"
  source = "smoke-production"
  anonymousId = "smoke-user"
  sessionId = "smoke-$timestamp"
  properties = @{
    action = "smoke_test"
    path = "/smoke"
    automated = $true
    timestamp = $timestamp
  }
} | ConvertTo-Json -Depth 5

$uri = [System.Uri]::new([System.Uri]::new($BaseUrl), "/api/telemetry/ingest")

try {
  $response = Invoke-WebRequest `
    -Uri $uri `
    -Method POST `
    -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $Secret" } `
    -Body $payload `
    -UseBasicParsing
} catch {
  $statusCode = "unknown"
  $body = ""

  if ($_.Exception.Response) {
    $statusCode = [int]$_.Exception.Response.StatusCode
    $stream = $_.Exception.Response.GetResponseStream()
    if ($stream) {
      $reader = [System.IO.StreamReader]::new($stream)
      $body = $reader.ReadToEnd()
      $reader.Dispose()
    }
  }

  Write-Error "Telemetry smoke failed for $uri with HTTP $statusCode. Response: $body"
}

if ($response.StatusCode -ne 200) {
  Write-Error "Telemetry smoke failed: expected HTTP 200 but received $($response.StatusCode)."
}

$json = $response.Content | ConvertFrom-Json

if ($json.ok -ne $true) {
  Write-Error "Telemetry smoke failed: response did not include ok=true."
}

if ([string]::IsNullOrWhiteSpace([string]$json.eventId)) {
  Write-Error "Telemetry smoke failed: response did not include eventId."
}

Write-Host "Telemetry ingest smoke passed for $BaseUrl"
Write-Host "Inserted telemetry event id: $($json.eventId)"
