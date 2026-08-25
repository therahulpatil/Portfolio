# ==============================================================================
# AUTOMATED AWS DEPLOYMENT SCRIPT FOR THERAHULPATIL.IN
# Syncs local HTML/CSS/JS files to S3 & invalidates CloudFront CDN Cache
# ==============================================================================

param (
    [string]$BucketName = "therahulpatil-portfolio-static",
    [string]$CloudFrontDistId = ""
)

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "🚀 STARTING PORTFOLIO DEPLOYMENT TO AWS" -ForegroundColor Green
Write-Host "Domain Target: therahulpatil.in" -ForegroundColor Yellow
Write-Host "Target Bucket: $BucketName" -ForegroundColor Yellow
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Check AWS CLI installation
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: AWS CLI is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install AWS CLI: https://aws.amazon.com/cli/" -ForegroundColor Red
    exit 1
}

# 2. Sync root files to S3 bucket
$ProjectRoot = Resolve-Path "$PSScriptRoot\.."
Write-Host "`n[1/3] Syncing static web files to S3..." -ForegroundColor Cyan

aws s3 sync "$ProjectRoot" "s3://$BucketName" `
    --exclude "aws/*" `
    --exclude ".git/*" `
    --exclude ".terraform/*" `
    --delete

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ S3 Sync Completed Successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ S3 Sync failed with error code $LASTEXITCODE" -ForegroundColor Red
    exit 1
}

# 3. Invalidate CloudFront Cache if ID supplied
if ($CloudFrontDistId) {
    Write-Host "`n[2/3] Invalidating CloudFront Cache ($CloudFrontDistId)..." -ForegroundColor Cyan
    aws cloudfront create-invalidation --distribution-id $CloudFrontDistId --paths "/*"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ CloudFront Invalidation Triggered Successfully!" -ForegroundColor Green
    }
} else {
    Write-Host "`n[2/3] Skipping CloudFront Invalidation (No Distribution ID passed)." -ForegroundColor Yellow
}

Write-Host "`n====================================================" -ForegroundColor Cyan
Write-Host "🎉 DEPLOYMENT COMPLETE! Visit: https://therahulpatil.in" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan
