# Run locally in Windows PowerShell. Default: inspect only. -Download fetches an
# official stable portable build into E:\Blender\versions, without deleting old
# software, projects, add-ons or settings. No remote scripts or installer execution.
param([string]$Root = 'E:\Blender', [switch]$Download)
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
if (-not (Test-Path -LiteralPath $Root -PathType Container)) { throw "Folder unavailable: $Root" }
$programs = Get-ChildItem -LiteralPath $Root -Filter blender.exe -File -Recurse
if (-not $programs) { Write-Output 'No Blender executable found in this folder.' }
foreach ($program in $programs) {
  # User-owned local installation only; never execute a downloaded program here.
  Write-Output $program.FullName
  & $program.FullName --version | Select-Object -First 1
}
if (-not $Download) { Write-Output 'Inspection complete. Add -Download to fetch the latest official portable build.'; return }
if ($env:PROCESSOR_ARCHITECTURE -ne 'AMD64') { throw 'This helper supports Windows x64 only; select the matching official build manually.' }
$page = (Invoke-WebRequest -Uri 'https://www.blender.org/download/' -UseBasicParsing).Content
$match = [regex]::Match($page, 'https://download\.blender\.org/release/Blender\d+\.\d+/blender-(\d+\.\d+\.\d+)-windows-x64\.zip')
if (-not $match.Success) { throw 'Could not identify the official stable ZIP. Open https://www.blender.org/download/; no files were removed.' }
$url = $match.Value; $version = $match.Groups[1].Value
$uri = [uri]$url; $filename = [IO.Path]::GetFileName($uri.AbsolutePath)
$checksumUrl = $url.Substring(0, $url.LastIndexOf('/') + 1) + "blender-$version.sha256"
$checksums = (Invoke-WebRequest -Uri $checksumUrl -UseBasicParsing).Content
$expected = $null
foreach ($line in ($checksums -split "`n")) {
  if ($line -match ('^([a-fA-F0-9]{64})\s+\*?' + [regex]::Escape($filename) + '\s*$')) { $expected = $Matches[1].ToLowerInvariant(); break }
}
if (-not $expected) { throw 'Official SHA256 not found. Download stopped.' }
$versions = Join-Path $Root 'versions'; New-Item -ItemType Directory -Path $versions -Force | Out-Null
$target = Join-Path $versions "blender-$version-windows-x64"
if (Test-Path -LiteralPath $target) { Write-Output "Version folder already exists: $target. It was not overwritten."; return }
$zip = Join-Path $versions $filename
Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
if ((Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash.ToLowerInvariant() -ne $expected) { Remove-Item -LiteralPath $zip; throw 'Checksum mismatch; only the failed download was removed.' }
# Inspect archive paths before extraction; reject traversal and absolute names.
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [IO.Compression.ZipFile]::OpenRead($zip)
try { foreach ($entry in $archive.Entries) { if ($entry.FullName -match '(^[/\\]|(^|[/\\])\.\.([/\\]|$)|:)') { throw 'Unsafe archive path; extraction stopped.' } } }
finally { $archive.Dispose() }
Expand-Archive -LiteralPath $zip -DestinationPath $versions
Write-Output "Official Blender $version downloaded and SHA256 verified: $target"
Write-Output 'The new application has not been executed. Old software and personal files were retained.'
