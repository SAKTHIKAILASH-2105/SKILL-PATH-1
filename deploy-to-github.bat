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
    echo [ERROR] Git could not be located at C:\Users\ADMIN\AppData\Local\Programs\Git\cmd
    pause
    exit /b 1
)

echo [1/3] Configuring repository and remote origin...
git branch -M main
git remote remove origin >nul 2>&1
git remote add origin https://github.com/SAKTHIKAILASH-2105/SKILL-PATH-1.git
git remote -v

echo.
echo [2/3] Checking committed changes...
git status --short

echo.
echo [3/3] Pushing to GitHub (main branch)...
echo.
echo NOTE: If a GitHub window or browser tab opens, click "Sign in with your browser"
echo       to authorize the push.
echo.

git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================================================
    echo   SUCCESS! Your project is now deployed on GitHub!
    echo   View repository: https://github.com/SAKTHIKAILASH-2105/SKILL-PATH-1
    echo ======================================================================
) else (
    echo.
    echo ----------------------------------------------------------------------
    echo [NOTICE] If browser authentication did not complete, you can push with
    echo a GitHub Personal Access Token (PAT):
    echo.
    echo 1. Generate a token at: https://github.com/settings/tokens
    echo    (Check the 'repo' permission checkbox and copy the token)
    echo 2. Enter your token below to push immediately:
    echo ----------------------------------------------------------------------
    set /p GITHUB_PAT="Enter your GitHub Token (or press Enter to exit): "
    if not "!GITHUB_PAT!"=="" (
        git remote set-url origin https://!GITHUB_PAT!@github.com/SAKTHIKAILASH-2105/SKILL-PATH-1.git
        git push -u origin main
        if !ERRORLEVEL! EQU 0 (
            echo.
            echo SUCCESS! Pushed to https://github.com/SAKTHIKAILASH-2105/SKILL-PATH-1
        )
    )
)

echo.
echo Press any key to close this window...
pause >nul
