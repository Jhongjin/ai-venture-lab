param(
  [string]$BaseUrl = $(if ($env:ROUTE_SMOKE_URL) { $env:ROUTE_SMOKE_URL } else { "https://ai-venture-lab.vercel.app" })
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Net.Http

function Invoke-RouteSmokeRequest {
  param(
    [string]$Path,
    [bool]$AllowRedirect = $false,
    [string]$Method = "GET",
    [string]$Body = $null
  )

  $handler = [System.Net.Http.HttpClientHandler]::new()
  $handler.AllowAutoRedirect = $AllowRedirect
  $client = [System.Net.Http.HttpClient]::new($handler)

  try {
    $uri = [System.Uri]::new([System.Uri]::new($BaseUrl), $Path)
    if ($Method -eq "POST") {
      $contentBody = if ($null -eq $Body) { "" } else { $Body }
      $requestContent = [System.Net.Http.StringContent]::new($contentBody, [System.Text.Encoding]::UTF8, "application/json")
      $response = $client.PostAsync($uri, $requestContent).GetAwaiter().GetResult()
      $requestContent.Dispose()
    } else {
      $response = $client.GetAsync($uri).GetAwaiter().GetResult()
    }
    $content = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()

    return [PSCustomObject]@{
      Url = $uri.ToString()
      StatusCode = [int]$response.StatusCode
      Location = $response.Headers.Location
      Content = $content
    }
  } finally {
    $client.Dispose()
    $handler.Dispose()
  }
}

$homeResponse = Invoke-RouteSmokeRequest -Path "/" -AllowRedirect $true

if ($homeResponse.StatusCode -ne 200) {
  Write-Error "Route smoke failed for /: expected HTTP 200 but received $($homeResponse.StatusCode)."
}

$requiredHomeText = @(
  "<!DOCTYPE html>",
  "_next/static",
  "AI Venture Lab"
)

$missingHomeText = @()
foreach ($text in $requiredHomeText) {
  if (-not $homeResponse.Content.Contains($text)) {
    $missingHomeText += $text
  }
}

if ($missingHomeText.Count -gt 0) {
  Write-Error ("Route smoke failed for /: missing expected text: " + ($missingHomeText -join ", "))
}

$callback = Invoke-RouteSmokeRequest -Path "/auth/callback" -AllowRedirect $false
$redirectCodes = @(302, 303, 307, 308)

if ($redirectCodes -notcontains $callback.StatusCode) {
  Write-Error "Route smoke failed for /auth/callback: expected redirect but received $($callback.StatusCode)."
}

$location = [string]$callback.Location
if (-not $location.Contains("auth_error=missing_callback_state")) {
  Write-Error "Route smoke failed for /auth/callback: missing auth_error=missing_callback_state in redirect location."
}

$extractApi = Invoke-RouteSmokeRequest -Path "/api/ideas/extract" -Method "POST" -Body "{}"

if ($extractApi.StatusCode -ne 400) {
  Write-Error "Route smoke failed for /api/ideas/extract: expected HTTP 400 for missing source but received $($extractApi.StatusCode)."
}

if (-not $extractApi.Content.Contains("source is required")) {
  Write-Error "Route smoke failed for /api/ideas/extract: missing source validation message."
}

$telemetryApi = Invoke-RouteSmokeRequest -Path "/api/telemetry/ingest" -Method "POST" -Body "{}"

if ($telemetryApi.StatusCode -ne 401) {
  Write-Error "Route smoke failed for /api/telemetry/ingest: expected HTTP 401 without telemetry secret but received $($telemetryApi.StatusCode)."
}

if (-not $telemetryApi.Content.Contains("Valid telemetry secret is required")) {
  Write-Error "Route smoke failed for /api/telemetry/ingest: missing telemetry secret validation message."
}

Write-Host "Route smoke passed for $BaseUrl"
