# Minimal static file server for browser preview.
param([int]$Port = 3400, [string]$Root = ".")

$Root = (Resolve-Path $Root).Path
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $Root on http://localhost:$Port/"

$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".gif"  = "image/gif"
  ".svg"  = "image/svg+xml"
  ".ico"  = "image/x-icon"
  ".woff" = "font/woff"
  ".woff2"= "font/woff2"
}

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
  } catch {
    break
  }
  $req = $ctx.Request
  $res = $ctx.Response
  $rel = $req.Url.AbsolutePath.TrimStart('/')
  if ([string]::IsNullOrEmpty($rel)) { $rel = "index.html" }
  $path = Join-Path $Root $rel
  $resolved = $null
  try { $resolved = (Resolve-Path -LiteralPath $path -ErrorAction Stop).Path } catch {}
  if ($resolved -and (Test-Path -LiteralPath $resolved -PathType Leaf) -and $resolved.StartsWith($Root, [System.StringComparison]::OrdinalIgnoreCase)) {
    $ext = [System.IO.Path]::GetExtension($resolved).ToLowerInvariant()
    $type = $mime[$ext]
    if (-not $type) { $type = "application/octet-stream" }
    $bytes = [System.IO.File]::ReadAllBytes($resolved)
    $res.ContentType = $type
    $res.ContentLength64 = $bytes.Length
    $res.Headers.Add("Cache-Control", "no-store")
    $res.OutputStream.Write($bytes, 0, $bytes.Length)
    Write-Host "200 $($req.HttpMethod) /$rel"
  } else {
    $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: /$rel")
    $res.StatusCode = 404
    $res.ContentType = "text/plain; charset=utf-8"
    $res.ContentLength64 = $msg.Length
    $res.OutputStream.Write($msg, 0, $msg.Length)
    Write-Host "404 $($req.HttpMethod) /$rel"
  }
  $res.OutputStream.Close()
}
