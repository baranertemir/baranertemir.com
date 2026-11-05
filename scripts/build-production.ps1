$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
$version = & hugo version
if ($LASTEXITCODE -ne 0 -or $version -notmatch 'v0\.166\.0(?:-|\+)' -or $version -notmatch '\+extended') {
  throw 'Install Hugo extended 0.166.0 before building.'
}
git submodule update --init --recursive
if ($LASTEXITCODE -ne 0) { throw 'Theme submodule initialization failed.' }
$destination = Join-Path ([IO.Path]::GetTempPath()) ('baranertemir-production-' + [guid]::NewGuid())
hugo --environment production --minify --buildDrafts=false --buildFuture=false --destination $destination
if ($LASTEXITCODE -ne 0) { throw 'Hugo build failed.' }
$bad = Get-ChildItem -LiteralPath $destination -Recurse -File | Where-Object { $_.Extension -in '.html', '.xml', '.txt' } | Select-String -Pattern 'https?://localhost', 'livereload\.js'
if ($bad) { throw 'Development URLs or LiveReload found in production output.' }
Write-Output "Validated production output: $destination"
