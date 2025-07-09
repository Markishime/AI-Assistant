# Oil Palm AI Assistant - Supabase Setup Script
# PowerShell script to initialize the Supabase database and storage

param(
    [switch]$SkipInstall = $false,
    [switch]$Verify = $false
)

Write-Host "🌴 Oil Palm AI Assistant - Supabase Setup" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ Error: .env.local file not found" -ForegroundColor Red
    Write-Host "Please create a .env.local file with your Supabase credentials" -ForegroundColor Yellow
    exit 1
}

# Check for required environment variables
$envContent = Get-Content ".env.local" -Raw
if (-not ($envContent -match "NEXT_PUBLIC_SUPABASE_URL=https://.*\.supabase\.co")) {
    Write-Host "❌ Error: NEXT_PUBLIC_SUPABASE_URL not found in .env.local" -ForegroundColor Red
    Write-Host "Please add your Supabase project URL to .env.local" -ForegroundColor Yellow
    exit 1
}

if (-not ($envContent -match "SUPABASE_SERVICE_ROLE_KEY=")) {
    Write-Host "⚠️  Warning: SUPABASE_SERVICE_ROLE_KEY not found in .env.local" -ForegroundColor Yellow
    Write-Host "You need to add your service role key to run the setup script" -ForegroundColor Yellow
    Write-Host "Get it from: Supabase Dashboard > Settings > API > service_role key" -ForegroundColor Cyan
    
    $key = Read-Host "Enter your service role key (or press Enter to skip)"
    if ($key) {
        Add-Content ".env.local" "`nSUPABASE_SERVICE_ROLE_KEY=$key"
        Write-Host "✅ Service role key added to .env.local" -ForegroundColor Green
    } else {
        Write-Host "❌ Cannot proceed without service role key" -ForegroundColor Red
        exit 1
    }
}

# Install dependencies if needed
if (-not $SkipInstall) {
    Write-Host "`n📦 Installing dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Check if we're just verifying
if ($Verify) {
    Write-Host "`n🔍 Verifying existing setup..." -ForegroundColor Cyan
    node supabase/setup.js --verify
    exit $LASTEXITCODE
}

# Run the setup script
Write-Host "`n🚀 Running Supabase setup..." -ForegroundColor Cyan
node supabase/setup.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Setup completed successfully!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "1. Upload reference documents to Supabase storage" -ForegroundColor White
    Write-Host "2. Test the application with sample data" -ForegroundColor White
    Write-Host "3. Configure additional settings as needed" -ForegroundColor White
    Write-Host "`nYour Oil Palm AI Assistant is ready! 🌴" -ForegroundColor Green
} else {
    Write-Host "`n❌ Setup failed. Check the error messages above." -ForegroundColor Red
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "- Invalid Supabase credentials" -ForegroundColor White
    Write-Host "- Network connectivity issues" -ForegroundColor White
    Write-Host "- Missing permissions" -ForegroundColor White
    exit 1
}
