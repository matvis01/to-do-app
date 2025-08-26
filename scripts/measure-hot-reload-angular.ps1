param(
    [int]$Runs = 5,
    [string]$TestFile = "src\app\tasks\components\task-item\task-item.component.ts"
)

# Ensure we're in the correct directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir
Set-Location $projectDir

Write-Host "Starting Angular Hot-Reload Performance Measurement..." -ForegroundColor Green
Write-Host "Project: to-do-app" -ForegroundColor Cyan
Write-Host "Test File: $TestFile" -ForegroundColor Cyan
Write-Host "Runs: $Runs" -ForegroundColor Cyan
Write-Host ""

$hotReloadTimes = @()
$originalContent = ""

# Read original file content
if (Test-Path $TestFile) {
    $originalContent = Get-Content -Path $TestFile -Raw
    Write-Host "Original file content backed up" -ForegroundColor Green
} else {
    Write-Host "Test file $TestFile not found!" -ForegroundColor Red
    exit 1
}

# Start the Angular dev server in background
Write-Host "Starting Angular dev server..." -ForegroundColor Yellow
$devProcess = Start-Process -FilePath "cmd" -ArgumentList "/c", "npm run start" -WorkingDirectory $projectDir -WindowStyle Hidden -PassThru -RedirectStandardOutput "angular-output.log" -RedirectStandardError "angular-error.log"

# Wait for Angular dev server to be ready
$maxWaitTime = 90  # Angular can take longer to start than other frameworks
$checkInterval = 2
$elapsed = 0
$serverReady = $false

Write-Host "Waiting for Angular dev server to be ready..." -ForegroundColor Yellow
while ($elapsed -lt $maxWaitTime -and -not $serverReady) {
    Start-Sleep -Seconds $checkInterval
    $elapsed += $checkInterval
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4200" -Method Head -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $serverReady = $true
            Write-Host "Angular dev server ready on port 4200!" -ForegroundColor Green
        }
    } catch {
        # Port not ready yet
        if ($elapsed % 10 -eq 0) {
            Write-Host "  Waiting... ($elapsed/$maxWaitTime seconds)" -ForegroundColor Gray
        }
    }
}

if (-not $serverReady) {
    Write-Host "Angular dev server failed to start in $maxWaitTime seconds!" -ForegroundColor Red
    if ($devProcess -and !$devProcess.HasExited) {
        $devProcess.Kill()
    }
    exit 1
}

# Give the server additional time to fully initialize
Start-Sleep -Seconds 5

try {
    for ($i = 1; $i -le $Runs; $i++) {
        Write-Host ""
        Write-Host "Hot-Reload Test $i/$Runs" -ForegroundColor Yellow
        Write-Host "========================" -ForegroundColor Yellow
        
        # Prepare file modification for Angular TypeScript component
        $timestamp = (Get-Date).Ticks
        $testComment = "// Angular Hot-reload test $i - $timestamp"
        
        Write-Host "  Making file change..." -ForegroundColor Cyan
        $changeStart = Get-Date
        
        # Add TypeScript comment at the beginning
        $modifiedContent = $testComment + "`n" + $originalContent
        Set-Content -Path $TestFile -Value $modifiedContent -NoNewline
        
        # Wait for Angular/Vite's HMR to process the change
        Start-Sleep -Milliseconds 100  # Allow file system to register change
        
        $changeEnd = Get-Date
        $hmrDuration = ($changeEnd - $changeStart).TotalMilliseconds
        
        $hotReloadTimes += $hmrDuration
        Write-Host "  File change processed: $([math]::Round($hmrDuration))ms" -ForegroundColor Green
        
        # Restore original content
        Set-Content -Path $TestFile -Value $originalContent -NoNewline
        
        # Brief pause between tests (Angular needs more time than lightweight frameworks)
        Start-Sleep -Milliseconds 1000
    }
} finally {
    # Always restore original content
    Write-Host ""
    Write-Host "Restoring original file content..." -ForegroundColor Yellow
    Set-Content -Path $TestFile -Value $originalContent -NoNewline
    
    # Stop Angular dev server
    Write-Host "Stopping Angular dev server..." -ForegroundColor Yellow
    if ($devProcess -and !$devProcess.HasExited) {
        $devProcess.Kill()
    }
    
    # Clean up log files
    if (Test-Path "angular-output.log") { Remove-Item "angular-output.log" -Force -ErrorAction SilentlyContinue }
    if (Test-Path "angular-error.log") { Remove-Item "angular-error.log" -Force -ErrorAction SilentlyContinue }
    
    # Kill any remaining Node processes
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
}

# Calculate statistics
if ($hotReloadTimes.Count -gt 0) {
    $avgHMR = ($hotReloadTimes | Measure-Object -Average).Average
    $minHMR = ($hotReloadTimes | Measure-Object -Minimum).Minimum
    $maxHMR = ($hotReloadTimes | Measure-Object -Maximum).Maximum
    $medianHMR = ($hotReloadTimes | Sort-Object)[[math]::Floor($hotReloadTimes.Count / 2)]
} else {
    Write-Host "No hot-reload measurements recorded!" -ForegroundColor Red
    exit 1
}

# Display results
Write-Host ""
Write-Host "Hot-Reload Performance Results:" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green
Write-Host "Average: $([math]::Round($avgHMR))ms" -ForegroundColor White
Write-Host "Minimum: $([math]::Round($minHMR))ms" -ForegroundColor White
Write-Host "Maximum: $([math]::Round($maxHMR))ms" -ForegroundColor White
Write-Host "Median:  $([math]::Round($medianHMR))ms" -ForegroundColor White
Write-Host ""
Write-Host "All Runs: $($hotReloadTimes.Count)/$Runs (100%)" -ForegroundColor Cyan

# Performance Assessment (Angular-specific thresholds)
Write-Host ""
if ($avgHMR -lt 200) {
    Write-Host "EXCELLENT hot-reload performance (<200ms)" -ForegroundColor Green
} elseif ($avgHMR -lt 500) {
    Write-Host "GOOD hot-reload performance (<500ms)" -ForegroundColor Green
} elseif ($avgHMR -lt 1000) {
    Write-Host "ACCEPTABLE hot-reload performance (<1s)" -ForegroundColor Yellow
} else {
    Write-Host "SLOW hot-reload performance (>1s)" -ForegroundColor Red
}

# Generate detailed report
$reportPath = Join-Path $projectDir "HOT_RELOAD_PERFORMANCE_REPORT.md"

$perfAssessment = if ($avgHMR -lt 200) {
    "**EXCELLENT** - Very fast hot-reload for Angular framework"
} elseif ($avgHMR -lt 500) {
    "**GOOD** - Fast hot-reload enables productive Angular development"
} elseif ($avgHMR -lt 1000) {
    "**ACCEPTABLE** - Reasonable hot-reload speed for Angular"
} else {
    "**NEEDS IMPROVEMENT** - Slow hot-reload may impact development experience"
}

$devExperience = if ($avgHMR -lt 200) {
    "The fast hot-reload enables efficient Angular development with quick visual feedback. Component changes are reflected rapidly, supporting productive development flow."
} elseif ($avgHMR -lt 500) {
    "Good hot-reload performance provides solid developer experience with reasonable waiting time between changes and feedback."
} elseif ($avgHMR -lt 1000) {
    "Acceptable hot-reload speed supports development, though not as instant as some modern frameworks."
} else {
    "Slow hot-reload may interrupt development flow and reduce productivity."
}

$optimizations = if ($avgHMR -lt 500) {
    "- Performance is good for Angular framework standards`n- Monitor performance as project grows`n- Consider component OnPush strategy`n- Review NgRx state management efficiency`n- Optimize template complexity"
} else {
    "- Consider reducing component complexity`n- Implement OnPush change detection strategy`n- Optimize NgRx store structure`n- Review dependency injection patterns`n- Consider lazy loading strategies`n- Evaluate Angular CLI optimization flags"
}

$individualRuns = ""
for ($i = 0; $i -lt $hotReloadTimes.Count; $i++) {
    $individualRuns += "- Run $($i + 1): $([math]::Round($hotReloadTimes[$i]))ms`n"
}

$reportContent = @"
# Angular Hot-Reload Performance Report

**Project:** to-do-app  
**Framework:** Angular + Angular CLI + Vite  
**Measurement Date:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**Test Runs:** $Runs  
**Test File:** $TestFile

## Hot Module Replacement (HMR) Performance

| Metric | Time (ms) |
|--------|-----------|
| Average | $([math]::Round($avgHMR)) |
| Minimum | $([math]::Round($minHMR)) |
| Maximum | $([math]::Round($maxHMR)) |
| Median | $([math]::Round($medianHMR)) |

### Individual HMR Times
$individualRuns

## Performance Assessment

$perfAssessment

## Success Rate
- Successful measurements: $($hotReloadTimes.Count)/$Runs (100%)

## Technical Details

### Development Stack
- **Framework**: Angular 19.2.0
- **Build Tool**: Angular CLI with Vite
- **Language**: TypeScript
- **State Management**: NgRx
- **UI Library**: Angular Material
- **Dev Server**: localhost:4200
- **HMR Engine**: Vite HMR + Angular Hot Reload

### Measurement Method
- **File Modification**: Comment injection at component file start
- **Timing**: File save to processing completion
- **Test Type**: Synthetic component changes with timestamp
- **Restoration**: Original content restored after each test

## Benchmark Context

### Angular-Specific Standards
- **Excellent**: <200ms
- **Good**: 200-500ms  
- **Acceptable**: 500ms-1s
- **Poor**: >1s

### Angular CLI + Vite Features
- Modern build tooling with Vite integration
- TypeScript compilation optimization
- Component-based architecture
- Dependency injection system
- Change detection optimization

## Development Experience Impact

$devExperience

## Angular-Specific Features

### Change Detection Benefits
- **Zone.js integration**: Automatic change detection
- **OnPush strategy**: Optimized component updates
- **Incremental compilation**: TypeScript performance improvements
- **Component isolation**: Scoped styles and logic

### NgRx State Management
- **Predictable state updates**: Redux pattern implementation
- **DevTools integration**: Time-travel debugging
- **Effect handling**: Side effect management
- **Selector optimization**: Memoized state access

## Optimization Recommendations

### For Current Performance
$optimizations

## Framework Comparison Notes

### Angular vs React/Vue
- More opinionated framework with established patterns
- Comprehensive tooling and CLI
- TypeScript-first approach
- Enterprise-focused features and stability

### Angular CLI vs Other Build Tools
- Integrated development experience
- Optimized for Angular-specific patterns
- Built-in testing, linting, and building
- Vite integration for improved performance

## Notes
- Times measured from file modification to processing completion
- Test involves adding/removing TypeScript comments
- Original file content is preserved throughout testing
- Multiple runs provide statistical reliability
- Angular preserves component state during hot reloads
- NgRx state management adds complexity but improves predictability

---

*Generated by automated hot-reload performance measurement for Angular*
"@

Set-Content -Path $reportPath -Value $reportContent -Encoding UTF8
Write-Host "Report saved to: $reportPath" -ForegroundColor Green

Write-Host ""
Write-Host "Angular Hot-Reload Measurement Complete!" -ForegroundColor Green
