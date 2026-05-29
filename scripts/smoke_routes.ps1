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
      CacheControl = [string]$response.Headers.CacheControl
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

$publicPages = @(
  @{ Path = "/guide"; RequiredText = "data-smoke=`"operator-guide`"" },
  @{ Path = "/login"; RequiredText = "data-smoke=`"account-access`"" },
  @{ Path = "/signup"; RequiredText = "data-smoke=`"signup-flow`"" },
  @{ Path = "/profile"; RequiredText = "data-smoke=`"my-page`"" },
  @{ Path = "/workspace"; RequiredText = $null },
  @{ Path = "/workspace/ideas"; RequiredText = $null },
  @{ Path = "/workspace/deleted"; RequiredText = $null }
)

foreach ($publicPage in $publicPages) {
  $pageResponse = Invoke-RouteSmokeRequest -Path $publicPage.Path -AllowRedirect $true

  if ($pageResponse.StatusCode -ne 200) {
    Write-Error "Route smoke failed for $($publicPage.Path): expected HTTP 200 but received $($pageResponse.StatusCode)."
  }

  if ($publicPage.RequiredText -and -not $pageResponse.Content.Contains($publicPage.RequiredText)) {
    Write-Error "Route smoke failed for $($publicPage.Path): missing expected text: $($publicPage.RequiredText)."
  }
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

$externalCallback = Invoke-RouteSmokeRequest -Path "/auth/callback?next=https%3A%2F%2Fevil.example%2Fphish" -AllowRedirect $false

if ($redirectCodes -notcontains $externalCallback.StatusCode) {
  Write-Error "Route smoke failed for /auth/callback external next: expected redirect but received $($externalCallback.StatusCode)."
}

$externalLocation = [string]$externalCallback.Location
if ($externalLocation.StartsWith("https://evil.example")) {
  Write-Error "Route smoke failed for /auth/callback external next: redirected to an external origin."
}

if (-not $externalLocation.Contains("/workspace") -or -not $externalLocation.Contains("auth_error=missing_callback_state")) {
  Write-Error "Route smoke failed for /auth/callback external next: expected safe workspace redirect with auth error."
}

$extractApi = Invoke-RouteSmokeRequest -Path "/api/ideas/extract" -Method "POST" -Body "{}"

if ($extractApi.StatusCode -ne 400) {
  Write-Error "Route smoke failed for /api/ideas/extract: expected HTTP 400 for missing source but received $($extractApi.StatusCode)."
}

if (-not $extractApi.Content.Contains("source is required")) {
  Write-Error "Route smoke failed for /api/ideas/extract: missing source validation message."
}

if (-not $extractApi.CacheControl.Contains("no-store")) {
  Write-Error "Route smoke failed for /api/ideas/extract: expected Cache-Control no-store."
}

$signupApi = Invoke-RouteSmokeRequest -Path "/api/auth/signup" -Method "POST" -Body "{}"

if ($signupApi.StatusCode -ne 400) {
  Write-Error "Route smoke failed for /api/auth/signup: expected HTTP 400 for invalid signup but received $($signupApi.StatusCode)."
}

if (-not $signupApi.Content.Contains("이메일")) {
  Write-Error "Route smoke failed for /api/auth/signup: missing email validation message."
}

if (-not $signupApi.CacheControl.Contains("no-store")) {
  Write-Error "Route smoke failed for /api/auth/signup: expected Cache-Control no-store."
}

$telemetryApi = Invoke-RouteSmokeRequest -Path "/api/telemetry/ingest" -Method "POST" -Body "{}"

if ($telemetryApi.StatusCode -ne 401) {
  Write-Error "Route smoke failed for /api/telemetry/ingest: expected HTTP 401 without telemetry secret but received $($telemetryApi.StatusCode)."
}

if (-not $telemetryApi.Content.Contains("Valid telemetry secret is required")) {
  Write-Error "Route smoke failed for /api/telemetry/ingest: missing telemetry secret validation message."
}

if (-not $telemetryApi.CacheControl.Contains("no-store")) {
  Write-Error "Route smoke failed for /api/telemetry/ingest: expected Cache-Control no-store."
}

$buildSyncTokenApi = Invoke-RouteSmokeRequest -Path "/api/build-sync/token" -Method "POST" -Body "{}"

if ($buildSyncTokenApi.StatusCode -ne 401) {
  Write-Error "Route smoke failed for /api/build-sync/token: expected HTTP 401 without login but received $($buildSyncTokenApi.StatusCode)."
}

if (-not $buildSyncTokenApi.Content.Contains("Login is required")) {
  Write-Error "Route smoke failed for /api/build-sync/token: missing login validation message."
}

$buildSyncProgressApi = Invoke-RouteSmokeRequest -Path "/api/build-sync/progress" -Method "POST" -Body "{}"

if ($buildSyncProgressApi.StatusCode -ne 401) {
  Write-Error "Route smoke failed for /api/build-sync/progress: expected HTTP 401 without build sync token but received $($buildSyncProgressApi.StatusCode)."
}

if (-not $buildSyncProgressApi.Content.Contains("Valid build sync token is required")) {
  Write-Error "Route smoke failed for /api/build-sync/progress: missing token validation message."
}

Write-Host "Route smoke passed for $BaseUrl"
