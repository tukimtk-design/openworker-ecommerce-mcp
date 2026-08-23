<#
.SYNOPSIS
Phase 10: Master One-Click Optimization Dashboard
.DESCRIPTION
Interactive CLI dashboard for optimizing the Samsung Galaxy Note 5 (LineageOS 20.0).
#>

function Show-Menu {
    Clear-Host
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "  Note 5 (noblelte) Master Optimization Dashboard v1.0.0  " -ForegroundColor Cyan
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "1. Run Baseline Benchmark"
    Write-Host "2. Apply Phase 1 ADB System & DEXOPT Tweaks"
    Write-Host "3. Deploy KernelSU Boot Persistence (Phases 2-8)"
    Write-Host "4. One-Click Full Optimization (Options 2 + 3 + Post-Benchmark)"
    Write-Host "5. Rollback All Tweaks"
    Write-Host "6. ROM Upgrade Helper (Phase 9)"
    Write-Host "0. Quit"
    Write-Host "==========================================================" -ForegroundColor Cyan
}

function Run-Script {
    param([string]$ScriptName)

    $scriptPath = Join-Path -Path $PSScriptRoot -ChildPath $ScriptName
    if (Test-Path $scriptPath) {
        Write-Host "Executing $ScriptName..." -ForegroundColor Yellow
        & $scriptPath
    } else {
        Write-Warning "Script not found: $scriptPath. This feature may not be implemented yet."
    }

    Write-Host "`nPress Enter to return to the menu..."
    Read-Host
}

$running = $true
while ($running) {
    Show-Menu
    $choice = Read-Host "Select an option"

    switch ($choice) {
        "1" { Run-Script "benchmark-performance.ps1" }
        "2" { Run-Script "optimize-system-runtime.ps1" }
        "3" { Run-Script "deploy-ksu-module.ps1" }
        "4" {
            Write-Host "Starting One-Click Full Optimization..." -ForegroundColor Magenta
            Run-Script "optimize-system-runtime.ps1"
            Run-Script "deploy-ksu-module.ps1"
            Write-Host "Running Post-Benchmark..." -ForegroundColor Magenta
            Run-Script "benchmark-performance.ps1"
        }
        "5" {
            Write-Host "Rolling back all tweaks..." -ForegroundColor Red
            Run-Script "remove-ksu-module.ps1"
            # Add other rollback calls here if needed
        }
        "6" { Run-Script "upgrade-rom-helper.ps1" }
        "0" {
            Write-Host "Quitting Dashboard..."
            $running = $false
        }
        default {
            Write-Warning "Invalid selection. Please try again."
            Start-Sleep -Seconds 1
        }
    }
}
