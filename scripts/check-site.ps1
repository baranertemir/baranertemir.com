$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
$testRoot = Join-Path ([IO.Path]::GetTempPath()) ('hugo-check-' + [guid]::NewGuid())
$fixtures = Join-Path $testRoot 'content/articles'
New-Item -ItemType Directory -Path $fixtures -Force | Out-Null
$cases = @{
  'published' = "draft: false`ndate: 2020-01-01"
  'hidden' = "noindex: true`ndate: 2020-01-01"
  'draft' = "draft: true`ndate: 2020-01-01"
  'future' = "date: 2099-01-01"
}
foreach ($entry in $cases.GetEnumerator()) {
  $body = "---`ntitle: '$($entry.Key)'`ndescription: 'Unique fixture description'`n$($entry.Value)`n---`nFixture content."
  [IO.File]::WriteAllText((Join-Path $fixtures ($entry.Key + '.md')), $body)
}
for ($i = 1; $i -le 12; $i++) {
  [IO.File]::WriteAllText((Join-Path $fixtures "pagination-$i.md"), "---`ntitle: 'Pagination $i'`ndate: 2020-01-01`n---`nPagination fixture.")
}
$output = Join-Path $testRoot 'production'
hugo --environment production --contentDir (Join-Path $testRoot 'content') --destination $output
if ($LASTEXITCODE -ne 0) { throw 'Production fixture build failed.' }
$siteMap = [IO.File]::ReadAllText((Join-Path $output 'sitemap.xml'))
foreach ($slug in 'draft', 'future') {
  if (Test-Path (Join-Path $output "articles/$slug/index.html")) { throw "Unexpected published $slug" }
}
if ($siteMap -match '/hidden/|/tags/|/categories/' -or $siteMap -notmatch '/published/') { throw 'Sitemap filtering failed.' }
$page = [IO.File]::ReadAllText((Join-Path $output 'articles/published/index.html'))
if ($page -notmatch 'name="description" content="Unique fixture description"' -or $page -notmatch 'rel="canonical" href="https://baranertemir.com/articles/published/"') { throw 'Page metadata failed.' }
$schemaMatch = [regex]::Match($page, '<script type="application/ld\+json">(.*?)</script>', 'Singleline')
$schema = $schemaMatch.Groups[1].Value | ConvertFrom-Json
if ($schema.'@type' -ne 'Article' -or $schema.author.name -ne 'Aydın Baran Ertemir') { throw 'Article JSON-LD failed.' }
$hidden = [IO.File]::ReadAllText((Join-Path $output 'articles/hidden/index.html'))
if ($hidden -notmatch 'noindex, follow') { throw 'Per-page noindex failed.' }
$secondPage = [IO.File]::ReadAllText((Join-Path $output 'articles/page/2/index.html'))
if ($secondPage -notmatch 'rel="canonical" href="https://baranertemir.com/articles/page/2/"' -or $secondPage -notmatch 'Page 2</title>') { throw 'Pagination SEO failed.' }
$preview = Join-Path $testRoot 'preview'
hugo --environment preview --contentDir (Join-Path $testRoot 'content') --destination $preview
if ($LASTEXITCODE -ne 0) { throw 'Preview build failed.' }
$previewHtml = [IO.File]::ReadAllText((Join-Path $preview 'articles/published/index.html'))
if ($previewHtml -notmatch 'noindex, follow') { throw 'Preview noindex failed.' }
$previewMap = [IO.File]::ReadAllText((Join-Path $preview 'sitemap.xml'))
if ($previewMap -match '<loc>') { throw 'Preview sitemap should have no URLs.' }
Write-Output 'PASS: draft/future exclusion, canonical, description, Article schema, per-page/preview noindex, sitemap filters.'
Write-Output "Inspection artifacts: $testRoot"
