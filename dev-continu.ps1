# 🔄 SCRIPT DÉVELOPPEMENT CONTINU - SENEGEL
# ==========================================

param(
    [Parameter(Mandatory=$true)]
    [string]$Message,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("feat", "fix", "improve", "persist", "deploy", "docs")]
    [string]$Type = "feat"
)

# Emojis pour les types de commit
$emojis = @{
    "feat" = "✨"
    "fix" = "🐛"
    "improve" = "💡"
    "persist" = "💾"
    "deploy" = "🚀"
    "docs" = "📚"
}

$emoji = $emojis[$Type]
$commitMessage = "$emoji $Type`: $Message"

Write-Host "🔄 DÉVELOPPEMENT CONTINU SENEGEL" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

Write-Host ""
Write-Host "📝 Message de commit: $commitMessage" -ForegroundColor Cyan

Write-Host ""
Write-Host "1. Vérification de l'état Git..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "2. Ajout des fichiers modifiés..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "3. Commit avec message standardisé..." -ForegroundColor Yellow
git commit -m $commitMessage

Write-Host ""
Write-Host "4. Push vers GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "5. Build de production..." -ForegroundColor Yellow
npm run build

Write-Host ""
Write-Host "✅ DÉPLOIEMENT CONTINU TERMINÉ !" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 L'application sera mise à jour automatiquement sur Netlify" -ForegroundColor Cyan
Write-Host "📊 Modules fonctionnels: Projects, Goals, Time Tracking, Leave Management" -ForegroundColor White
Write-Host "🔧 Modules en cours: Finance, Knowledge Base, Development, Courses, Jobs, etc." -ForegroundColor White
Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
