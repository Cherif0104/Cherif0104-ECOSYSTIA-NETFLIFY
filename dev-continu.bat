@echo off
setlocal enabledelayedexpansion

echo 🔄 DÉVELOPPEMENT CONTINU SENEGEL
echo =================================

if "%~1"=="" (
    echo Usage: dev-continu.bat "message" [type]
    echo Types: feat, fix, improve, persist, deploy, docs
    echo Exemple: dev-continu.bat "Ajout fonctionnalité X" feat
    pause
    exit /b 1
)

set "message=%~1"
set "type=%~2"
if "%type%"=="" set "type=feat"

rem Emojis pour les types
if "%type%"=="feat" set "emoji=✨"
if "%type%"=="fix" set "emoji=🐛"
if "%type%"=="improve" set "emoji=💡"
if "%type%"=="persist" set "emoji=💾"
if "%type%"=="deploy" set "emoji=🚀"
if "%type%"=="docs" set "emoji=📚"

set "commitMessage=%emoji% %type%: %message%"

echo.
echo 📝 Message de commit: %commitMessage%

echo.
echo 1. Vérification de l'état Git...
git status

echo.
echo 2. Ajout des fichiers modifiés...
git add .

echo.
echo 3. Commit avec message standardisé...
git commit -m "%commitMessage%"

echo.
echo 4. Push vers GitHub...
git push origin main

echo.
echo 5. Build de production...
npm run build

echo.
echo ✅ DÉPLOIEMENT CONTINU TERMINÉ !
echo.
echo 🌐 L'application sera mise à jour automatiquement sur Netlify
echo 📊 Modules fonctionnels: Projects, Goals, Time Tracking, Leave Management
echo 🔧 Modules en cours: Finance, Knowledge Base, Development, Courses, Jobs, etc.
echo.
pause
