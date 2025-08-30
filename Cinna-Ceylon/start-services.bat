@echo off
echo 🌿 Starting CinnaCeylon Services...
echo.

echo 📦 Starting Backend Server (Port 5000)...
cd backend
start "Backend Server" cmd /k "npm run dev"

echo.
echo ⏳ Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak > nul

echo.
echo 🎨 Starting Frontend Server (Port 3002)...
cd ../frontend
start "Frontend Server" cmd /k "npm start"

echo.
echo ✅ Both services are starting...
echo.
echo 🌐 Backend: http://localhost:5000
echo 🎨 Frontend: http://localhost:3002
echo.
echo Press any key to close this window...
pause > nul

