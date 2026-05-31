# Copy root .env.example to repo root .env (if missing), then sync to service dirs.
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Example = Join-Path $Root ".env.example"
$EnvFile = Join-Path $Root ".env"

if (-not (Test-Path $EnvFile)) {
    if (-not (Test-Path $Example)) {
        Write-Error ".env.example not found at $Example"
    }
    Copy-Item $Example $EnvFile
    Write-Host "Created $EnvFile — fill in your credentials."
}

$targets = @(
    (Join-Path $Root "packages\api\.env"),
    (Join-Path $Root "apps\bot\.env"),
    (Join-Path $Root "apps\mini-app\.env")
)

foreach ($target in $targets) {
    Copy-Item $EnvFile $target -Force
    Write-Host "Synced -> $target"
}

Write-Host "Done. Services also read the root .env directly; sync is optional fallback."
