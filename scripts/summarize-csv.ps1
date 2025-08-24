param(
  [Parameter(Mandatory=$true)][string]$Path,
  [string]$OutFile = "RUNTIME_METRICS_REPORT.md"
)

$ErrorActionPreference = 'Stop'
if (-not (Test-Path -Path $Path)) {
  Write-Error "File not found: $Path"
  exit 1
}

$invar = [System.Globalization.CultureInfo]::InvariantCulture
$rows = Import-Csv -Path $Path
if ($null -eq $rows -or $rows.Count -eq 0) {
  Write-Error "No rows in $Path"
  exit 1
}

# Normalize numeric culture
$rows | ForEach-Object {
  $_.CPU_Percent = [double]::Parse(([string]$_.CPU_Percent), $invar)
  $_.WorkingSet_MB = [double]::Parse(([string]$_.WorkingSet_MB), $invar)
  $_.Private_MB = [double]::Parse(([string]$_.Private_MB), $invar)
}

$cpu = $rows | Measure-Object -Property CPU_Percent -Average -Maximum -Minimum
$ws  = $rows | Measure-Object -Property WorkingSet_MB -Average -Maximum -Minimum
$priv= $rows | Measure-Object -Property Private_MB -Average -Maximum -Minimum

$firstTs = $rows[0].Timestamp
$lastTs  = $rows[-1].Timestamp
$samples = $rows.Count

$md = @()
$md += "# Runtime Metrics Report"
$md += ""
$abs = (Resolve-Path -Path $Path).Path
$md += "- Source: $abs"
$md += "- Samples: $samples"
$md += "- Window: $firstTs to $lastTs"
$md += ""
$md += "## CPU (%)"
$md += "- Avg: " + ([math]::Round($cpu.Average,3).ToString($invar))
$md += "- Min: " + ($cpu.Minimum.ToString($invar))
$md += "- Max: " + ($cpu.Maximum.ToString($invar))
$md += ""
$md += "## Working Set (MB)"
$md += "- Avg: " + ([math]::Round($ws.Average,2).ToString($invar))
$md += "- Min: " + ($ws.Minimum.ToString($invar))
$md += "- Max: " + ($ws.Maximum.ToString($invar))
$md += ""
$md += "## Private Memory (MB)"
$md += "- Avg: " + ([math]::Round($priv.Average,2).ToString($invar))
$md += "- Min: " + ($priv.Minimum.ToString($invar))
$md += "- Max: " + ($priv.Maximum.ToString($invar))

$md -join "`r`n" | Out-File -FilePath $OutFile -Encoding utf8

# Also print a JSON summary
$summary = [PSCustomObject]@{
  Samples = $samples
  Window  = [PSCustomObject]@{ start = $firstTs; end = $lastTs }
  CPU_Percent = [PSCustomObject]@{ avg = [math]::Round($cpu.Average,3); min = $cpu.Minimum; max = $cpu.Maximum }
  WorkingSet_MB = [PSCustomObject]@{ avg = [math]::Round($ws.Average,2); min = $ws.Minimum; max = $ws.Maximum }
  Private_MB = [PSCustomObject]@{ avg = [math]::Round($priv.Average,2); min = $priv.Minimum; max = $priv.Maximum }
}
$summary | ConvertTo-Json -Depth 5 | Write-Output
Write-Host "Saved summary to $OutFile"
