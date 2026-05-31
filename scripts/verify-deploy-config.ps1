# Verify deploy artifacts and env template before production deploy.
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "=== Corporate Ladder deploy preflight ==="

$requiredFiles = @(
    "supabase\migrations\001_initial_schema.sql",
    "packages\api\Dockerfile",
    "packages\api\railway.toml",
    "apps\bot\Dockerfile",
    "apps\bot\railway.toml",
    "apps\mini-app\vercel.json",
    ".env.example"
)

foreach ($f in $requiredFiles) {
    if (-not (Test-Path $f)) {
        Write-Error "MISSING: $f"
    }
    Write-Host "OK: $f"
}

$requiredVars = @(
    "TELEGRAM_BOT_TOKEN",
    "TELEGRAM_WEBAPP_SECRET",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "MINI_APP_URL",
    "VITE_API_URL",
    "VITE_BOT_USERNAME"
)

$example = Get-Content ".env.example" -Raw
foreach ($v in $requiredVars) {
    if ($example -notmatch "(?m)^$v=") {
        Write-Error "MISSING in .env.example: $v"
    }
}
Write-Host "OK: .env.example contains all required variables"

Write-Host ""
Write-Host "Manual deploy checklist:"
Write-Host "  1. Supabase - run supabase/migrations/001_initial_schema.sql"
Write-Host "  2. Railway - deploy packages/api with TELEGRAM_* and SUPABASE_*"
Write-Host "  3. Vercel - deploy apps/mini-app with VITE_API_URL and VITE_BOT_USERNAME"
Write-Host "  4. Railway - deploy apps/bot with MINI_APP_URL = Vercel URL"
Write-Host "  5. BotFather - menu button + /setdomain for Vercel domain"
Write-Host ""
Write-Host "Preflight passed. Run .\scripts\smoke-local.ps1 before tagging a release."
