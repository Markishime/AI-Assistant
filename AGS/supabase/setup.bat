@echo off
echo.
echo 🌴 Oil Palm AI Assistant - Supabase Setup
echo ==========================================
echo.

:: Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the project root directory
    pause
    exit /b 1
)

:: Check if .env.local exists
if not exist ".env.local" (
    echo ❌ Error: .env.local file not found
    echo Please create a .env.local file with your Supabase credentials
    pause
    exit /b 1
)

:: Install dependencies
echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

:: Run the setup script
echo.
echo 🚀 Running Supabase setup...
node supabase/setup.js

if %errorlevel% equ 0 (
    echo.
    echo ✅ Setup completed successfully!
    echo.
    echo Next steps:
    echo 1. Upload reference documents to Supabase storage
    echo 2. Test the application with sample data
    echo 3. Configure additional settings as needed
    echo.
    echo Your Oil Palm AI Assistant is ready! 🌴
) else (
    echo.
    echo ❌ Setup failed. Check the error messages above.
    echo Common issues:
    echo - Invalid Supabase credentials
    echo - Network connectivity issues
    echo - Missing permissions
)

pause
