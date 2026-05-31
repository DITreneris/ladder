# Local automated smoke tests (CI-equivalent + deploy preflight)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Invoke-Step([string]$Label, [scriptblock]$Action) {
    Write-Host $Label
    & $Action
    if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) {
        throw "Step failed with exit code $LASTEXITCODE"
    }
}

Write-Host "=== Corporate Ladder local smoke ==="

Invoke-Step "[1/5] API pytest..." {
    Push-Location packages\api
    try { python -m pytest -q } finally { Pop-Location }
}

Invoke-Step "[2/5] Bot import..." {
    Push-Location apps\bot
    try {
        python -m pip install -r requirements.txt -q
        python -c "import main"
    } finally { Pop-Location }
}

Invoke-Step "[3/5] Mini-app lint, test, build..." {
    Push-Location apps\mini-app
    try {
        npm run lint
        npm test
        npm run build
    } finally { Pop-Location }
}

Write-Host "[4/5] Deploy preflight..."
& "$Root\scripts\verify-deploy-config.ps1"

Write-Host "[5/5] Done."
Write-Host ""
Write-Host "Local smoke passed."
Write-Host "Production smoke (manual, inside Telegram):"
Write-Host "  - GET {API_URL}/health"
Write-Host "  - /start -> Punch In and Climb"
Write-Host "  - Complete run -> Daily leaderboard"
Write-Host "  - Share button on game over"
