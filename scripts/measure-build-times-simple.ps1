param(
    [int]$Runs = 3
)

# Ensure we're in the correct directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir
Set-Location $projectDir

Write-Host "Starting Angular build performance measurement..." -ForegroundColor Green
Write-Host "Project: to-do-app" -ForegroundColor Cyan
Write-Host "Location: $projectDir" -ForegroundColor Cyan
Write-Host "Runs: $Runs" -ForegroundColor Cyan
Write-Host ""

$buildTimes = @()
$devTimes = @()

for ($i = 1; $i -le $Runs; $i++) {
    Write-Host "Run $i/$Runs" -ForegroundColor Yellow
    
    # Clean dist folder
    if (Test-Path "dist") {
        Remove-Item -Recurse -Force "dist"
        Write-Host "  Cleaned dist folder"
    }
    
    # Measure build time
    Write-Host "  Measuring build time..." -ForegroundColor Cyan
    $buildStart = Get-Date
    
    # Use cmd to run npm
    $buildOutput = cmd /c "npm run build 2>&1"
    $buildExitCode = $LASTEXITCODE
    $buildEnd = Get-Date
    
    if ($buildExitCode -eq 0) {
        $buildDuration = ($buildEnd - $buildStart).TotalMilliseconds
        $buildTimes += $buildDuration
        Write-Host "  Build completed: $([math]::Round($buildDuration))ms" -ForegroundColor Green
    } else {
        Write-Host "  Build failed! Exit code: $buildExitCode" -ForegroundColor Red
        continue
    }
    
    # Measure dev server startup time
    Write-Host "  Measuring dev server startup..." -ForegroundColor Cyan
    $devStart = Get-Date
    
    # Start dev server as background job
    $devJob = Start-Job -ScriptBlock {
        param($projectPath)
        Set-Location $projectPath
        cmd /c "npm run start" 2>&1
    } -ArgumentList $projectDir
    
    # Wait for server to be ready (check for port 4200)
    $maxWaitTime = 120 # 2 minutes max
    $checkInterval = 0.5
    $elapsed = 0
    $serverReady = $false
    
    while ($elapsed -lt $maxWaitTime -and -not $serverReady) {
        Start-Sleep -Seconds $checkInterval
        $elapsed += $checkInterval
        
        # Check if port 4200 is listening
        try {
            $connection = Test-NetConnection -ComputerName "localhost" -Port 4200 -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
            if ($connection) {
                $devEnd = Get-Date
                $devDuration = ($devEnd - $devStart).TotalMilliseconds
                $devTimes += $devDuration
                $serverReady = $true
                Write-Host "  Dev server ready: $([math]::Round($devDuration))ms" -ForegroundColor Green
            }
        } catch {
            # Port not ready yet
        }
        
        # Also check job output for readiness indicators
        if (-not $serverReady) {
            $jobOutput = Receive-Job -Job $devJob -ErrorAction SilentlyContinue
            if ($jobOutput -match "Local:.+localhost:4200|ready in|compiled successfully|webpack compiled" -and $jobOutput -notmatch "error|failed") {
                if (-not $serverReady) {
                    $devEnd = Get-Date
                    $devDuration = ($devEnd - $devStart).TotalMilliseconds
                    $devTimes += $devDuration
                    $serverReady = $true
                    Write-Host "  Dev server ready: $([math]::Round($devDuration))ms" -ForegroundColor Green
                }
            }
        }
    }
    
    if (-not $serverReady) {
        Write-Host "  Dev server timeout after $maxWaitTime seconds!" -ForegroundColor Red
    }
    
    # Cleanup: Stop the dev server job
    Stop-Job -Job $devJob -ErrorAction SilentlyContinue
    Remove-Job -Job $devJob -ErrorAction SilentlyContinue
    
    # Kill any remaining ng processes
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*Angular*" -or $_.CommandLine -like "*ng serve*" } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-Host ""
}

# Calculate statistics
if ($buildTimes.Count -gt 0) {
    $avgBuild = ($buildTimes | Measure-Object -Average).Average
    $minBuild = ($buildTimes | Measure-Object -Minimum).Minimum
    $maxBuild = ($buildTimes | Measure-Object -Maximum).Maximum
} else {
    Write-Host "No successful builds recorded!" -ForegroundColor Red
    exit 1
}

if ($devTimes.Count -gt 0) {
    $avgDev = ($devTimes | Measure-Object -Average).Average
    $minDev = ($devTimes | Measure-Object -Minimum).Minimum
    $maxDev = ($devTimes | Measure-Object -Maximum).Maximum
} else {
    Write-Host "No successful dev server startups recorded!" -ForegroundColor Red
    $avgDev = $minDev = $maxDev = "N/A"
}

# Display results
Write-Host "Results Summary:" -ForegroundColor Green
Write-Host "=================" -ForegroundColor Green
Write-Host "Build Performance:"
Write-Host "  Average: $([math]::Round($avgBuild))ms"
Write-Host "  Min: $([math]::Round($minBuild))ms"
Write-Host "  Max: $([math]::Round($maxBuild))ms"
Write-Host ""
if ($devTimes.Count -gt 0) {
    Write-Host "Dev Server Startup:"
    Write-Host "  Average: $([math]::Round($avgDev))ms"
    Write-Host "  Min: $([math]::Round($minDev))ms"
    Write-Host "  Max: $([math]::Round($maxDev))ms"
    Write-Host ""
    Write-Host "Success Rate:"
    Write-Host "  Build: $($buildTimes.Count)/$Runs ($([math]::Round(($buildTimes.Count / $Runs) * 100))%)"
    Write-Host "  Dev: $($devTimes.Count)/$Runs ($([math]::Round(($devTimes.Count / $Runs) * 100))%)"
} else {
    Write-Host "Dev Server Startup: Failed (0/$Runs)"
}

# Generate report
$reportPath = Join-Path $projectDir "BUILD_PERFORMANCE_REPORT.md"
$reportContent = @"
# Angular Build Performance Report

**Project:** to-do-app  
**Framework:** Angular 19.2.0  
**Measurement Date:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**Runs:** $Runs

## Build Performance

| Metric | Time (ms) |
|--------|-----------|
| Average | $([math]::Round($avgBuild)) |
| Minimum | $([math]::Round($minBuild)) |
| Maximum | $([math]::Round($maxBuild)) |

### Individual Build Times
$(for ($i = 0; $i -lt $buildTimes.Count; $i++) { "- Run $($i + 1): $([math]::Round($buildTimes[$i]))ms" })

"@

if ($devTimes.Count -gt 0) {
    $reportContent += @"

## Dev Server Startup Performance

| Metric | Time (ms) |
|--------|-----------|
| Average | $([math]::Round($avgDev)) |
| Minimum | $([math]::Round($minDev)) |
| Maximum | $([math]::Round($maxDev)) |

### Individual Dev Startup Times
$(for ($i = 0; $i -lt $devTimes.Count; $i++) { "- Run $($i + 1): $([math]::Round($devTimes[$i]))ms" })

## Success Rate
- Build: $($buildTimes.Count)/$Runs ($([math]::Round(($buildTimes.Count / $Runs) * 100))%)
- Dev Server: $($devTimes.Count)/$Runs ($([math]::Round(($devTimes.Count / $Runs) * 100))%)

"@
} else {
    $reportContent += @"

## Dev Server Startup Performance
All dev server startup attempts failed or timed out.

## Success Rate
- Build: $($buildTimes.Count)/$Runs ($([math]::Round(($buildTimes.Count / $Runs) * 100))%)
- Dev Server: 0/$Runs (0%)

"@
}

$reportContent += @"
## Configuration
- **Build Command:** \`npm run build\` (ng build)
- **Dev Command:** \`npm run start\` (ng serve)
- **Port:** 4200
- **Max Dev Startup Wait:** 120 seconds

## Notes
- Angular CLI build with production optimizations
- Dev server measured until port 4200 responds or success indicators detected
- Times measured from process start to completion/readiness
- Cleanup performed between runs (dist folder removal)
"@

Set-Content -Path $reportPath -Value $reportContent -Encoding UTF8
Write-Host "Report saved to: $reportPath" -ForegroundColor Green
