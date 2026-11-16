@echo off
setlocal
echo ========================================================
echo   PromptWars / SkillPath AI - GitHub Deployment Script
echo ========================================================
echo.

set PATH=%PATH%;C:\Users\ADMIN\AppData\Local\Programs\Git\cmd

git --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git command not found.
    pause
    exit /b 1
)

echo [1/3] Checking current Git repository status...
git status --short

echo.
set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/username/promptwars.git): "

if "%REPO_URL%"=="" (
    echo [ERROR] Repository URL cannot be empty.
    pause
    exit /b 1
)

echo.
echo [2/3] Setting remote origin to %REPO_URL%...
git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%
git branch -M main

echo.
echo [3/3] Pushing code to GitHub (main branch)...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   SUCCESS! Your project is now deployed on GitHub!
    echo ========================================================
) else (
    echo.
    echo [ERROR] Git push failed. If this is a private repo or requires authentication:
    echo 1. Generate a Personal Access Token at https://github.com/settings/tokens
    echo 2. Use: https://<TOKEN>@github.com/username/repo.git
)

pause
