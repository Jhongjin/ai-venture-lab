param(
  [string]$BaseUrl = $(if ($env:TELEMETRY_SMOKE_URL) { $env:TELEMETRY_SMOKE_URL } else { "https://ai-venture-lab.vercel.app" }),
  [string]$Secret = $env:TELEMETRY_INGEST_SECRET,
  [string]$IdeaId = $env:TELEMETRY_SMOKE_IDEA_ID,
  [switch]$Funnel,
  [string[]]$EventNames = @()
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($Secret)) {
  Write-Error "Telemetry smoke requires TELEMETRY_INGEST_SECRET. Set it in the current terminal before running pnpm smoke:telemetry."
}

if ([string]::IsNullOrWhiteSpace($IdeaId)) {
  Write-Error "Telemetry smoke requires TELEMETRY_SMOKE_IDEA_ID. Use an existing idea id from Supabase or the Learning Loop adapter guide."
}

$uri = [System.Uri]::new([System.Uri]::new($BaseUrl), "/api/telemetry/ingest")

function Send-TelemetrySmokeEvent {
  param(
    [string]$EventName,
    [int]$Step
  )

  $timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
  $payload = @{
    ideaId = $IdeaId
    eventName = $EventName
    eventCategory = "product"
    source = if ($Funnel) { "smoke-funnel" } else { "smoke-production" }
    anonymousId = "smoke-user"
    sessionId = if ($Funnel) { "smoke-funnel-$timestamp" } else { "smoke-$timestamp" }
    properties = @{
      action = if ($Funnel) { "funnel_smoke_test" } else { "smoke_test" }
      path = "/smoke"
      automated = $true
      funnel_step = $Step
      timestamp = $timestamp
    }
  } | ConvertTo-Json -Depth 5

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

    Write-Error "Telemetry smoke failed for $uri with HTTP $statusCode. Event: $EventName. Response: $body"
  }

  if ($response.StatusCode -ne 200) {
    Write-Error "Telemetry smoke failed for $EventName`: expected HTTP 200 but received $($response.StatusCode)."
  }

  $json = $response.Content | ConvertFrom-Json

  if ($json.ok -ne $true) {
    Write-Error "Telemetry smoke failed for $EventName`: response did not include ok=true."
  }

  if ([string]::IsNullOrWhiteSpace([string]$json.eventId)) {
    Write-Error "Telemetry smoke failed for $EventName`: response did not include eventId."
  }

  return [PSCustomObject]@{
    EventName = $EventName
    EventId = $json.eventId
  }
}

$defaultFunnelEvents = @(
  "product_page_view",
  "product_signup_started",
  "product_signup_completed",
  "product_core_action",
  "product_activation",
  "product_payment_signal"
)

$eventsToSend = if ($EventNames.Count -gt 0) {
  $EventNames
} elseif ($Funnel) {
  $defaultFunnelEvents
} else {
  @("product_core_action")
}

$inserted = @()
for ($index = 0; $index -lt $eventsToSend.Count; $index++) {
  $inserted += Send-TelemetrySmokeEvent -EventName $eventsToSend[$index] -Step ($index + 1)
}

Write-Host "Telemetry ingest smoke passed for $BaseUrl"
foreach ($event in $inserted) {
  Write-Host "Inserted telemetry event id: $($event.EventId) [$($event.EventName)]"
}
