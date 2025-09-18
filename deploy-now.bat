@echo off
echo ========================================
echo   5 TR Moviez - Complete Deployment
echo ========================================
echo.
echo 🎯 COMPLETE MOVIE WEBSITE WITH DATABASE!
echo.
echo ✅ Complete package ready for Vercel
echo ✅ Database integration (KV, Postgres, Blob)
echo ✅ File storage for posters and movies
echo ✅ Admin dashboard with full controls
echo ✅ Beautiful black elegant theme
echo ✅ Cross-device synchronization
echo ✅ Analytics and tracking
echo.
echo ========================================
echo.
echo 📁 PROJECT CONTENTS:
echo.
echo ✅ package.json - All dependencies included
echo ✅ server.js - Complete server with database
echo ✅ vercel.json - Vercel configuration
echo ✅ public/ - All website files
echo ✅ README.md - Complete documentation
echo ✅ DEPLOYMENT_GUIDE.md - Step-by-step guide
echo.
echo ========================================
echo.
echo 🚀 DEPLOYMENT STEPS:
echo.
echo Step 1: Upload to GitHub
echo ------------------------
echo 1. Go to: https://github.com
echo 2. Create new repository: 5-tr-moviez-complete
echo 3. Make it PUBLIC (for free Vercel deployment)
echo 4. Upload all files from this folder
echo.
echo Step 2: Deploy on Vercel
echo ------------------------
echo 1. Go to: https://vercel.com
echo 2. Sign up with GitHub
echo 3. Click "New Project"
echo 4. Select your repository
echo 5. Click "Deploy"
echo.
echo Step 3: Add Database
echo --------------------
echo 1. Go to project dashboard
echo 2. Click "Storage" tab
echo 3. Create database (KV, Postgres, or Blob)
echo 4. Add environment variable: DATABASE_TYPE
echo.
echo ========================================
echo.
echo 🎉 YOUR WEBSITE WILL HAVE:
echo.
echo ✅ Main Site: https://your-app-name.vercel.app
echo ✅ Admin Panel: https://your-app-name.vercel.app/admin.html
echo ✅ Login: admin / admin123
echo ✅ Movie Management - Add, edit, delete movies
echo ✅ File Upload - Posters and movie files
echo ✅ Analytics - Download and view tracking
echo ✅ Database Storage - Persistent data
echo ✅ Cross-device Sync - Works on all devices
echo.
echo ========================================
echo.
echo 🗄️ DATABASE OPTIONS:
echo.
echo Option 1: Vercel KV (Recommended)
echo ✅ 100%% FREE - Up to 30,000 requests/month
echo ✅ Super Fast - Redis-based
echo ✅ Perfect for movie data, banner, stats
echo.
echo Option 2: Vercel Postgres
echo ✅ 100%% FREE - Up to 500MB storage
echo ✅ SQL Database - Traditional database
echo ✅ Perfect for complex queries
echo.
echo Option 3: Vercel Blob
echo ✅ 100%% FREE - Up to 1GB storage
echo ✅ File Storage - Images, videos, documents
echo ✅ Perfect for movie files and posters
echo.
echo ========================================
echo.
echo 🔧 QUICK UPLOAD COMMANDS:
echo.
echo # Navigate to this folder
echo cd C:\Users\hsioj\5-moviez\vercel-complete-project
echo.
echo # Initialize git
echo git init
echo.
echo # Add all files
echo git add .
echo.
echo # Commit
echo git commit -m "Initial commit - 5 TR Moviez Complete"
echo.
echo # Add remote (replace YOUR_USERNAME)
echo git remote add origin https://github.com/YOUR_USERNAME/5-tr-moviez-complete.git
echo.
echo # Push to GitHub
echo git push -u origin main
echo.
echo ========================================
echo.
echo 🎯 ADMIN FEATURES:
echo.
echo ✅ Movie Management - Add, edit, delete movies
echo ✅ Banner Settings - Customize homepage banner
echo ✅ File Upload - Upload posters and movie files
echo ✅ Analytics - View download and view statistics
echo ✅ Settings - Configure website settings
echo ✅ Search & Filter - Find movies easily
echo ✅ Bulk Actions - Select multiple movies
echo ✅ Export/Import - Backup and restore data
echo.
echo ========================================
echo.
echo 🆘 TROUBLESHOOTING:
echo.
echo Login Issues:
echo 1. Clear browser cache
echo 2. Try different browser
echo 3. Check console for errors
echo 4. Use bypass method in console
echo.
echo Database Issues:
echo 1. Check environment variables
echo 2. Verify database is created
echo 3. Check Vercel logs
echo 4. Try different database type
echo.
echo ========================================
echo.
echo Press 1 to open GitHub (upload files)
echo Press 2 to open Vercel (deploy)
echo Press 3 to open complete deployment guide
echo Press 4 to open project README
echo.
set /p choice="Enter your choice (1, 2, 3, or 4): "

if "%choice%"=="1" (
    echo Opening GitHub...
    start https://github.com/new
) else if "%choice%"=="2" (
    echo Opening Vercel...
    start https://vercel.com
) else if "%choice%"=="3" (
    start DEPLOYMENT_GUIDE.md
) else if "%choice%"=="4" (
    start README.md
) else (
    echo Invalid choice. Opening deployment guide...
    start DEPLOYMENT_GUIDE.md
)
