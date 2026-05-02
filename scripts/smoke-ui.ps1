$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$url = $env:SMOKE_BASE_URL
if ([string]::IsNullOrWhiteSpace($url)) {
  $url = "http://127.0.0.1:4173/"
}

function Get-NodePath {
  $localNode = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
  if (Test-Path -LiteralPath $localNode) { return $localNode }

  $command = Get-Command node.exe -ErrorAction SilentlyContinue
  if ($command) { return $command.Source }

  throw "Node.js was not found. Install Node.js or run from the Codex desktop environment."
}

function Get-EdgePath {
  if (-not [string]::IsNullOrWhiteSpace($env:SMOKE_BROWSER_PATH) -and (Test-Path -LiteralPath $env:SMOKE_BROWSER_PATH)) {
    return $env:SMOKE_BROWSER_PATH
  }

  $candidates = @(
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
  )

  foreach ($candidate in $candidates) {
    if (Test-Path -LiteralPath $candidate) { return $candidate }
  }

  return ""
}

function Wait-ForServer {
  param([string]$TargetUrl)

  $deadline = (Get-Date).AddSeconds(15)
  do {
    try {
      $response = Invoke-WebRequest -UseBasicParsing -Uri $TargetUrl -TimeoutSec 2
      if ($response.StatusCode -eq 200) { return }
    } catch {}
    Start-Sleep -Milliseconds 500
  } while ((Get-Date) -lt $deadline)

  throw "Server did not respond at $TargetUrl"
}

$node = Get-NodePath
$browser = Get-EdgePath
$nodeModules = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules"
if (Test-Path -LiteralPath $nodeModules) {
  $env:NODE_PATH = $nodeModules
}
if (-not [string]::IsNullOrWhiteSpace($browser)) {
  $env:SMOKE_BROWSER_PATH = $browser
}
$env:SMOKE_BASE_URL = $url

$serverJob = $null
try {
  try {
    Wait-ForServer $url
    Write-Host "Using existing server at $url"
  } catch {
    Write-Host "Starting local PWA server..."
    $serverJob = Start-Job -ScriptBlock {
      param($Root)
      $env:HANGOUT_NO_OPEN = "1"
      Set-Location $Root
      & (Join-Path $Root "start-pwa.ps1")
    } -ArgumentList $projectRoot
    Wait-ForServer $url
  }

  & $node (Join-Path $projectRoot "scripts\smoke-ui.js")
  if ($LASTEXITCODE -ne 0) {
    throw "Smoke test failed with exit code $LASTEXITCODE"
  }
} finally {
  if ($serverJob) {
    Stop-Job $serverJob -ErrorAction SilentlyContinue
    Remove-Job $serverJob -Force -ErrorAction SilentlyContinue
  }
}
