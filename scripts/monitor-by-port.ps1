param(
  [int]$Port = 4200,
  [int]$IntervalSec = 1,
  [int]$DurationSec = 60,
  [string]$OutFile = "angular_metrics.csv"
)

$ErrorActionPreference = 'Stop'

function Get-PidByPort {
  param([int]$Port)
  try {
    $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop | Select-Object -First 1
    if ($conn) { return $conn.OwningProcess }
  } catch {
    # Fallback to netstat parsing
    $line = netstat -ano | Select-String ":$Port" | Select-Object -First 1
    if ($line) {
      $tokens = ($line.ToString() -split "\s+")
      return [int]$tokens[-1]
    }
  }
  return $null
}

$TargetPid = Get-PidByPort -Port $Port
if (-not $TargetPid) {
  Write-Error "No listening process found on port $Port. Ensure the dev server is running."
  exit 1
}

Write-Host "Monitoring PID $TargetPid on port $Port for $DurationSec seconds..."

# Invoke the base monitor script relative to repo root
$scriptPath = Join-Path $PSScriptRoot 'monitor-process.ps1'
& powershell -NoProfile -ExecutionPolicy Bypass -File $scriptPath -TargetPid $TargetPid -IntervalSec $IntervalSec -DurationSec $DurationSec -OutFile $OutFile
