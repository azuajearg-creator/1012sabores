@echo off
title 1012Sabores - Instalando dependencias...
echo.
echo  =============================================
echo   1012Sabores - Preparando el compilador
echo  =============================================
echo.
echo  Instalando Electron y electron-builder...
echo  (Esto puede tardar 2-5 minutos la primera vez)
echo.
npm install
echo.
if %ERRORLEVEL% EQU 0 (
  echo  OK - Instalacion completada.
  echo  Ahora ejecuta 2_COMPILAR.bat para crear el .exe
) else (
  echo  ERROR - Revisa que Node.js este instalado.
  echo  Descargalo de: https://nodejs.org  (version LTS)
)
echo.
pause
