cd D:\cirulnik\staff_portal

npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "BUILD FAILED, DEPLOY CANCELED" -ForegroundColor Red
    exit 1
}

vercel --prod
