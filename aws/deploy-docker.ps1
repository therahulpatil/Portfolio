# ==============================================================================
# DOCKER BUILD & DEPLOYMENT SCRIPT FOR THERAHULPATIL PORTFOLIO
# ==============================================================================

param (
    [string]$ImageName = "therahulpatil-portfolio",
    [string]$Port = "80"
)

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "🐳 BUILDING DOCKER CONTAINER: $ImageName" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Build Docker Image
$ProjectRoot = Resolve-Path "$PSScriptRoot\.."
docker build -t "$ImageName`:latest" "$ProjectRoot"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed." -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Docker Image built successfully!" -ForegroundColor Green

# 2. Stop & Remove old container if exists
docker stop "$ImageName" 2>$null
docker rm "$ImageName" 2>$null

# 3. Run container
Write-Host "`n🚀 Launching Docker container on port $Port..." -ForegroundColor Cyan
docker run -d --name "$ImageName" -p "$Port`:80" --restart always "$ImageName`:latest"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n====================================================" -ForegroundColor Cyan
    Write-Host "🎉 PORTFOLIO CONTAINER LIVE AT: http://localhost:$Port" -ForegroundColor Green
    Write-Host "====================================================" -ForegroundColor Cyan
} else {
    Write-Host "❌ Failed to run Docker container." -ForegroundColor Red
}
