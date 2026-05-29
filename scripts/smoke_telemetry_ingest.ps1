param(
  [string]$BaseUrl = $(if ($env:TELEMETRY_SMOKE_URL) { $env:TELEMETRY_SMOKE_URL } else { "https://ai-venture-lab.vercel.app" }),
  [string]$Secret = $env:TELEMETRY_INGEST_SECRET,
  [string]$IdeaId = $env:TELEMETRY_SMOKE_IDEA_ID,
  [switch]$Funnel,
  [string[]]$EventNames = @()
)

$ErrorActionPreference = "Stop"

function Import-SmokeEnvFile {
  param(
    [string]$Path,
    [string[]]$AllowedNames
  )

  if (-not (Test-Path -LiteralPath $Path)) {
    return
  }

  foreach ($line in Get-Content -LiteralPath $Path) {
    $trimmed = $line.Trim()

    if ([string]::IsNullOrWhiteSpace($trimmed) -or $trimmed.StartsWith("#") -or -not $trimmed.Contains("=")) {
      continue
    }

    $parts = $trimmed.Split("=", 2)
    $name = $parts[0].Trim()

    if ($AllowedNames -notcontains $name) {
      continue
    }

    $value = $parts[1].Trim()

    if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
      $value = $value.Substring(1, $value.Length - 2)
    }

    if (-not [string]::IsNullOrWhiteSpace($value)) {
      Set-Item -Path "Env:$name" -Value $value
    }
  }
}

$allowedEnvNames = @(
  "TELEMETRY_INGEST_SECRET",
  "TELEMETRY_SMOKE_IDEA_ID",
  "TELEMETRY_SMOKE_URL"
)

Import-SmokeEnvFile -Path ".env.production.local" -AllowedNames $allowedEnvNames
Import-SmokeEnvFile -Path ".env.local" -AllowedNames $allowedEnvNames

if ([string]::IsNullOrWhiteSpace($Secret)) {
  $Secret = $env:TELEMETRY_INGEST_SECRET
}

if ([string]::IsNullOrWhiteSpace($IdeaId)) {
  $IdeaId = $env:TELEMETRY_SMOKE_IDEA_ID
}

if ([string]::IsNullOrWhiteSpace($Secret)) {
  Write-Error "Telemetry smoke requires TELEMETRY_INGEST_SECRET. Set it in the current terminal before running pnpm smoke:telemetry."
}

function New-DisposableTelemetrySmokeIdea {
  $scriptPath = Join-Path $PSScriptRoot "create_telemetry_smoke_idea.mjs"
  $createdIdeaId = (& node $scriptPath 2>&1)

  if ($LASTEXITCODE -ne 0) {
    Write-Error "Telemetry smoke could not create a disposable idea automatically. $createdIdeaId"
  }

  $id = ([string]($createdIdeaId | Select-Object -Last 1)).Trim()

  if ([string]::IsNullOrWhiteSpace($id)) {
    Write-Error "Telemetry smoke could not create a disposable idea automatically."
  }

  $script:IdeaId = $id
  $env:TELEMETRY_SMOKE_IDEA_ID = $id
  Write-Host "Created disposable telemetry smoke idea for this run."
  return $id
}

if ([string]::IsNullOrWhiteSpace($IdeaId)) {
  $IdeaId = New-DisposableTelemetrySmokeIdea
}

$uri = [System.Uri]::new([System.Uri]::new($BaseUrl), "/api/telemetry/ingest")
$script:RetriedWithDisposableTelemetryIdea = $false

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

    if ($statusCode -eq 404 -and -not $script:RetriedWithDisposableTelemetryIdea) {
      $script:RetriedWithDisposableTelemetryIdea = $true
      $IdeaId = New-DisposableTelemetrySmokeIdea
      return Send-TelemetrySmokeEvent -EventName $EventName -Step $Step
    }

    Write-Error "Telemetry smoke failed for $uri with HTTP $statusCode. Event: $EventName. Response: $body"
  }

  if ($response.StatusCode -ne 200) {
    Write-Error "Telemetry smoke failed for $EventName`: expected HTTP 200 but received $($response.StatusCode)."
  }

  $cacheControl = [string]$response.Headers["Cache-Control"]
  if (-not $cacheControl.Contains("no-store")) {
    Write-Error "Telemetry smoke failed for $EventName`: expected Cache-Control no-store."
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

[string[]]$eventsToSend = @()

if ($EventNames.Count -gt 0) {
  $eventsToSend = @($EventNames)
} elseif ($Funnel) {
  $eventsToSend = @($defaultFunnelEvents)
} else {
  $eventsToSend = @("product_core_action")
}

$inserted = @()
for ($index = 0; $index -lt $eventsToSend.Count; $index++) {
  $inserted += Send-TelemetrySmokeEvent -EventName $eventsToSend[$index] -Step ($index + 1)
}

Write-Host "Telemetry ingest smoke passed for $BaseUrl"
foreach ($event in $inserted) {
  Write-Host "Inserted telemetry event id: $($event.EventId) [$($event.EventName)]"
}
