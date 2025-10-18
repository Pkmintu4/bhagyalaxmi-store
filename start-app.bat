@echo off
echo 🚀 Starting BhagyaLaxmi Store Application...
echo.
echo 📦 Installing dependencies...
call npm install
echo.
echo 🏗️ Building frontend...
call npm run build
echo.
echo 🌱 Seeding database...
call npm run db:seed
echo.
echo 🚀 Starting server...
echo.
echo ✅ Application is ready!
echo 🌐 Open your browser and go to: http://localhost:3001
echo.
echo 👤 Test login credentials:
echo    Admin: admin@bhagyalaxmi.com / admin123
echo    User: user@bhagyalaxmi.com / user123
echo.
echo Press Ctrl+C to stop the server
echo.
call npm run server
