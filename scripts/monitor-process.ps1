param(
  [string]$ProcessName,
  [int]$TargetPid,
  [int]$IntervalSec = 1,
  [int]$DurationSec = 60,
  [string]$OutFile = "process_metrics.csv"
)

if (-not $ProcessName -and -not $TargetPid) {
  Write-Error "Provide -ProcessName (e.g., 'chrome' or 'msedge' or 'node') or -TargetPid <id>"
  exit 1
}

$logicalProcs = (Get-CimInstance Win32_ComputerSystem).NumberOfLogicalProcessors
$invar = [System.Globalization.CultureInfo]::InvariantCulture

# CSV header
"Timestamp,Scope,Pid(s),CPU_Percent,WorkingSet_MB,Private_MB,Threads,Handles" | Out-File -FilePath $OutFile -Encoding utf8

$prevCpuSum = $null
$prevTime = Get-Date

for ($elapsed = 0; $elapsed -lt $DurationSec; $elapsed += $IntervalSec) {
  Start-Sleep -Seconds $IntervalSec
  $now = Get-Date
  $deltaSec = ($now - $prevTime).TotalSeconds
  $prevTime = $now

  if ($TargetPid) {
    try {
      $p = Get-Process -Id $TargetPid -ErrorAction Stop
    } catch {
      Write-Warning "Process with PID $TargetPid not found. Stopping."
      break
    }

    $cpu = $p.CPU
    if ($null -eq $prevCpuSum) { $prevCpuSum = $cpu }
    $cpuDelta = [math]::Max(0, $cpu - $prevCpuSum)
    $prevCpuSum = $cpu

    $cpuPct = [math]::Round((($cpuDelta / $deltaSec) * (100 / $logicalProcs)), 3)
    $wsMB = [math]::Round(($p.WorkingSet64 / 1MB), 2)
    $privMB = [math]::Round(($p.PrivateMemorySize64 / 1MB), 2)

    $cpuPctS = $cpuPct.ToString($invar)
    $wsMBS = $wsMB.ToString($invar)
    $privMBS = $privMB.ToString($invar)

    $line = "{0},{1},{2},{3},{4},{5},{6},{7}" -f (
      $now.ToString('s'),
      "PID",
      $p.Id,
      $cpuPctS,
      $wsMBS,
      $privMBS,
      $p.Threads.Count,
      $p.HandleCount
    )
    Add-Content -Path $OutFile -Value $line
  }
  else {
    $procs = @(Get-Process -Name $ProcessName -ErrorAction SilentlyContinue)
    if ($procs.Count -eq 0) {
      Write-Warning "No processes found with name '$ProcessName'. Continuing..."
      continue
    }

    $cpuSum = ($procs | Measure-Object -Property CPU -Sum).Sum
    if ($null -eq $prevCpuSum) { $prevCpuSum = $cpuSum }
    $cpuDelta = [math]::Max(0, $cpuSum - $prevCpuSum)
    $prevCpuSum = $cpuSum

    $cpuPct = [math]::Round((($cpuDelta / $deltaSec) * (100 / $logicalProcs)), 3)
    $wsMB = [math]::Round((($procs | Measure-Object -Property WorkingSet64 -Sum).Sum / 1MB), 2)
    $privMB = [math]::Round((($procs | Measure-Object -Property PrivateMemorySize64 -Sum).Sum / 1MB), 2)
    $threads = ($procs | ForEach-Object { $_.Threads.Count } | Measure-Object -Sum).Sum
    $handles = ($procs | Measure-Object -Property HandleCount -Sum).Sum
    $pids = ($procs | Select-Object -ExpandProperty Id) -join ";"

    $cpuPctS = $cpuPct.ToString($invar)
    $wsMBS = $wsMB.ToString($invar)
    $privMBS = $privMB.ToString($invar)

    $line = "{0},{1},{2},{3},{4},{5},{6},{7}" -f (
      $now.ToString('s'),
      $ProcessName,
      $pids,
      $cpuPctS,
      $wsMBS,
      $privMBS,
      $threads,
      $handles
    )
    Add-Content -Path $OutFile -Value $line
  }
}

Write-Host "Saved metrics to $OutFile"
