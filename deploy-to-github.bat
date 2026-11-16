@echo off
setlocal enabledelayedexpansion
title Deploy PromptWars / SkillPath AI to GitHub
color 0A

echo ======================================================================
echo    SkillPath AI / PromptWars - 1-Click GitHub Deployment
echo ======================================================================
echo.
echo Target Repository:
echo   https://github.com/SAKTHIKAILASH-2105/SKILL-PATH-1.git
echo.

set "PATH=%PATH%;C:\Users\ADMIN\AppData\Local\Programs\Git\cmd;C:\Users\ADMIN\AppData\Local\Programs\Git\mingw64\bin"

git --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git could not be located.
    pause
    exit /b 1
)

echo [1/3] Configuring repository and remote origin...
git branch -M main
git remote remove origin >nul 2>&1
git remote add origin https://github.com/SAKTHIKAILASH-2105/SKILL-PATH-1.git

echo.
echo [2/3] Checking committed changes...
git status --short

echo.
echo [3/3] Pushing to GitHub (main branch)...
git push -u origin main

if %ERRORLEVEL% EQU 0 goto :success
goto :error

:success
echo.
echo ======================================================================
echo   SUCCESS! Your project is deployed and up to date on GitHub!
echo   View repository: https://github.com/SAKTHIKAILASH-2105/SKILL-PATH-1
echo ======================================================================
goto :end

:error
echo.
echo [ERROR] Git push did not complete. If authentication is needed:
echo 1. Generate a Personal Access Token at https://github.com/settings/tokens
echo 2. Run: git remote set-url origin https://TOKEN@github.com/SAKTHIKAILASH-2105/SKILL-PATH-1.git
goto :end

:end
echo.
echo Press any key to close this window...
pause >nul
