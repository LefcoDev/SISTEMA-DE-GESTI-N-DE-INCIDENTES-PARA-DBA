@echo off
echo Iniciando DBA Incident Manager...
echo.

REM Verificar si MySQL está corriendo
echo Verificando MySQL...
netstat -ano | findstr :3306 > nul
if %errorlevel% neq 0 (
    echo [ERROR] MySQL no está corriendo en el puerto 3306
    echo Por favor inicia MySQL e intenta nuevamente
    pause
    exit /b 1
)
echo MySQL detectado OK

REM Iniciar servidor backend
echo Iniciando servidor backend...
start /B node "%~dp0server\dist\index.js"
timeout /t 3 /nobreak > nul

REM Iniciar aplicación Electron
echo Iniciando aplicación...
"%~dp0DBA Incident Manager.exe"
