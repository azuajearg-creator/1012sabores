@echo off
title 1012Sabores - Compilando...
echo.
echo  =============================================
echo   1012Sabores - Generando instalador .exe
echo  =============================================
echo.
echo  Compilando... (puede tardar 3-8 minutos)
echo.
npm run build
echo.
if %ERRORLEVEL% EQU 0 (
  echo  ==============================================
  echo   LISTO! El instalador esta en la carpeta dist\
  echo   Archivo: dist\1012Sabores Setup 1.0.0.exe
  echo  ==============================================
  explorer dist
) else (
  echo  ERROR durante la compilacion.
  echo  Si el icono falla, borra build\icon.png y vuelve a intentar.
)
echo.
pause
