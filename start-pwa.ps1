$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootFull = [IO.Path]::GetFullPath($root)
$port = 4173
$url = "http://127.0.0.1:$port/"

$types = @{
  ".html" = "text/html; charset=utf-8"
  ".js" = "text/javascript; charset=utf-8"
  ".css" = "text/css; charset=utf-8"
  ".svg" = "image/svg+xml"
  ".webmanifest" = "application/manifest+json; charset=utf-8"
  ".png" = "image/png"
}

function Send-Response($stream, $status, $contentType, [byte[]]$body) {
  $reason = if ($status -eq 200) { "OK" } elseif ($status -eq 404) { "Not Found" } elseif ($status -eq 503) { "Service Unavailable" } else { "Error" }
  $header = "HTTP/1.1 $status $reason`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nCache-Control: no-store`r`nConnection: close`r`n`r`n"
  $headerBytes = [Text.Encoding]::ASCII.GetBytes($header)
  $stream.Write($headerBytes, 0, $headerBytes.Length)
  $stream.Write($body, 0, $body.Length)
}

function Send-Json($stream, $status, $payload) {
  $json = $payload | ConvertTo-Json -Depth 8 -Compress
  $body = [Text.Encoding]::UTF8.GetBytes($json)
  Send-Response $stream $status "application/json; charset=utf-8" $body
}

function Get-QueryValue($uri, $name, $fallback = "") {
  $query = $uri.Query.TrimStart("?")
  if ([string]::IsNullOrWhiteSpace($query)) { return $fallback }
  foreach ($pair in $query.Split("&")) {
    if ([string]::IsNullOrWhiteSpace($pair)) { continue }
    $parts = $pair.Split("=", 2)
    $key = [Uri]::UnescapeDataString($parts[0])
    if ($key -ne $name) { continue }
    if ($parts.Length -lt 2) { return "" }
    return [Uri]::UnescapeDataString($parts[1].Replace("+", " "))
  }
  return $fallback
}

function Get-Number($value, $fallback) {
  $number = 0.0
  if ([double]::TryParse([string]$value, [ref]$number)) { return $number }
  return $fallback
}

function Convert-AmapPoi($poi, $index) {
  $biz = $poi.biz_ext
  $rating = Get-Number $biz.rating 4.3
  $cost = [Math]::Round((Get-Number $biz.cost 80))
  $tags = @($poi.type, $poi.tag, $poi.business_area) | Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) } | Select-Object -First 3
  $photo = ""
  if ($poi.photos -and @($poi.photos).Length -gt 0 -and @($poi.photos)[0].url) {
    $photo = [string]@($poi.photos)[0].url
  }
  $addressParts = @($poi.adname, $poi.address) | Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) }
  $text = @($poi.type, $poi.tag, $poi.name) -join " "

  [ordered]@{
    id = "amap-$($poi.id)"
    name = if ($poi.name) { [string]$poi.name } else { "Unnamed place" }
    address = if ($addressParts.Length) { ($addressParts -join " - ") } else { "Address pending" }
    source = "amap"
    category = ""
    rating = $rating
    avgPrice = $cost
    open = $true
    distance = [Math]::Round((0.7 + ($index * 0.35)), 1)
    tags = if ($tags.Length) { @($tags) } else { @("AMap") }
    image = $photo
    location = if ($poi.location) { [string]$poi.location } else { "" }
  }
}

function Handle-Places($stream, $requestTarget) {
  $uri = [Uri]("http://127.0.0.1$requestTarget")
  $keyword = (Get-QueryValue $uri "q").Trim()
  $category = (Get-QueryValue $uri "category").Trim()
  $city = (Get-QueryValue $uri "city" "guangzhou").Trim()
  $key = $env:AMAP_KEY

  if ([string]::IsNullOrWhiteSpace($keyword) -and [string]::IsNullOrWhiteSpace($category)) {
    Send-Json $stream 400 @{ places = @(); message = "Enter a place keyword first" }
    return
  }

  if ([string]::IsNullOrWhiteSpace($key)) {
    Send-Json $stream 503 @{ places = @(); message = "AMAP_KEY is not set, using local recommendations" }
    return
  }

  $keywords = @($keyword, $category) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
  $params = [ordered]@{
    key = $key
    keywords = ($keywords -join "|")
    city = $city
    citylimit = "true"
    children = "1"
    offset = "12"
    page = "1"
    extensions = "all"
    output = "JSON"
  }
  $query = ($params.GetEnumerator() | ForEach-Object {
    "$([Uri]::EscapeDataString([string]$_.Key))=$([Uri]::EscapeDataString([string]$_.Value))"
  }) -join "&"

  try {
    $data = Invoke-RestMethod -Method Get -Uri "https://restapi.amap.com/v3/place/text?$query" -TimeoutSec 10
    if ($data.status -ne "1") {
      Send-Json $stream 502 @{ places = @(); message = if ($data.info) { $data.info } else { "AMap search failed" } }
      return
    }

    $pois = @($data.pois)
    $places = for ($i = 0; $i -lt [Math]::Min($pois.Length, 12); $i++) {
      Convert-AmapPoi $pois[$i] $i
    }
    Send-Json $stream 200 @{ provider = "amap"; places = @($places) }
  }
  catch {
    Send-Json $stream 502 @{ places = @(); message = "Map service connection failed" }
  }
}

# Check if port is already in use and free it
$existing = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Where-Object { $_.State -eq "Listen" }
if ($existing) {
  $pid_ = $existing.OwningProcess | Select-Object -First 1
  Write-Host "Port $port is in use by PID $pid_, stopping it..."
  try { Stop-Process -Id $pid_ -Force -ErrorAction Stop } catch {}
  Start-Sleep -Milliseconds 500
}

$server = New-Object Net.Sockets.TcpListener ([Net.IPAddress]::Parse("127.0.0.1")), $port
$server.Start()

Write-Host "Hangout PWA started: $url"
Write-Host "Keep this window open. Press Ctrl+C to stop."
Write-Host "Optional map search: set AMAP_KEY before running this script."
if ($env:HANGOUT_NO_OPEN -ne "1") {
  try {
    Start-Process $url
  }
  catch {
    Write-Host "Open this URL in your browser: $url"
  }
}

try {
  while ($true) {
    $client = $server.AcceptTcpClient()
    $stream = $client.GetStream()
    $reader = New-Object IO.StreamReader($stream, [Text.Encoding]::ASCII)
    $requestLine = $reader.ReadLine()

    if ([string]::IsNullOrWhiteSpace($requestLine)) {
      $client.Close()
      continue
    }

    while ($true) {
      $line = $reader.ReadLine()
      if ([string]::IsNullOrEmpty($line)) { break }
    }

    $parts = $requestLine.Split(" ")
    $requestTarget = if ($parts.Length -gt 1) { $parts[1] } else { "/" }
    $requestUri = [Uri]("http://127.0.0.1$requestTarget")

    if ($requestUri.AbsolutePath -eq "/api/places") {
      Handle-Places $stream $requestTarget
      $client.Close()
      continue
    }

    $requestPath = [Uri]::UnescapeDataString($requestUri.AbsolutePath)
    if ($requestPath -eq "/") {
      $requestPath = "/index.html"
    }

    $relativePath = $requestPath.TrimStart("/") -replace "/", [IO.Path]::DirectorySeparatorChar
    $filePath = [IO.Path]::GetFullPath([IO.Path]::Combine($rootFull, $relativePath))

    if (-not $filePath.StartsWith($rootFull, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $filePath -PathType Leaf)) {
      $body = [Text.Encoding]::UTF8.GetBytes("Not found")
      Send-Response $stream 404 "text/plain; charset=utf-8" $body
      $client.Close()
      continue
    }

    $extension = [IO.Path]::GetExtension($filePath)
    $contentType = if ($types.ContainsKey($extension)) { $types[$extension] } else { "application/octet-stream" }
    $body = [IO.File]::ReadAllBytes($filePath)
    Send-Response $stream 200 $contentType $body
    $client.Close()
  }
}
finally {
  $server.Stop()
}
