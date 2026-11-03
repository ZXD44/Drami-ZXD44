@echo off
setlocal
CD /D "%~dp0"
title 🛡️ Drami Online - Extreme Launcher

:: --- ADMIN ELEVATION (Requesting Administrator Rights) ---
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    echo [SYSTEM] Requesting administrative privileges...
    goto :UACPrompt
) else ( goto :gotAdmin )

:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    exit /B

:gotAdmin
    if exist "%temp%\getadmin.vbs" ( del "%temp%\getadmin.vbs" )

:: --- STARTUP ---
echo.
echo =======================================================
echo          DRAMI ONLINE INFRASTRUCTURE LAUNCHER 
echo            (ADMINISTRATOR MODE ENABLED)
echo =======================================================
echo.

:: 1. AGGRESSIVE PORT CLEANUP
echo [1/5] Force-stopping existing processes on ports 2567 and 5173...

:: Aggressive loop to ensure ports are DEAD
for %%p in (2567 5173) do (
    echo     Cleaning port %%p...
    powershell -Command "Get-NetTCPConnection -LocalPort %%p -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"
    timeout /t 1 /nobreak > nul
)

:: Killing any GHOST node processes that might lock Prisma DLLs
echo [SYSTEM] Cleaning ghost engine processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak > nul

:: 2. NODE_MODULES CHECK
echo [2/5] Checking dependencies...
if not exist "server\node_modules" (
    echo server/node_modules missing. Running npm install...
    cd server && call npm install && cd ..
)
if not exist "client\node_modules" (
    echo client/node_modules missing. Running npm install...
    cd client && call npm install && cd ..
)

:: 3. PRISMA SYNC
echo [3/5] Synchronizing Prisma DB...
cd server
:: Fix the DLL locking issue by ensuring everything is clean before generate
call npx prisma generate
call npx prisma db push --skip-generate
cd ..

:: 4. LAUNCHING SERVER
echo [4/5] Starting Backend Server...
start "🛡️ Drami Server" cmd /c "cd server && npm run dev"

:: Delay for stabilization
echo Waiting for server...
timeout /t 5

:: 5. LAUNCHING CLIENT
echo [5/5] Starting Frontend Client...
start "🎨 Drami Client" cmd /c "cd client && npm run dev"

echo.
echo =======================================================
echo    ✅ SUCCESS: SYSTEMS DEPLOYED AS ADMINISTRATOR
echo =======================================================
echo.
echo Opening browser...
start http://localhost:5173/game

echo.
echo [DONE] This window will close in 10 seconds.
timeout /t 10
exit
