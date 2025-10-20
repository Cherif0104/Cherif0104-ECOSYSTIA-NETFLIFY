# 🚀 SCRIPT DE DÉPLOIEMENT NETLIFY - SENEGEL
# ===========================================

Write-Host "🚀 DÉPLOIEMENT SENEGEL SUR NETLIFY" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

Write-Host ""
Write-Host "1. Vérification de l'état Git..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "2. Ajout des fichiers modifiés..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "3. Commit des modifications..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "🚀 Déploiement production - $timestamp"

Write-Host ""
Write-Host "4. Push vers GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "5. Build de production..." -ForegroundColor Yellow
npm run build

Write-Host ""
Write-Host "✅ DÉPLOIEMENT TERMINÉ !" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prochaines étapes :" -ForegroundColor Cyan
Write-Host "1. Aller sur https://netlify.com" -ForegroundColor White
Write-Host "2. Se connecter avec GitHub" -ForegroundColor White
Write-Host "3. Sélectionner le repository Cherif0104-ECOSYSTIA-NETFLIFY" -ForegroundColor White
Write-Host "4. Configurer les variables d'environnement" -ForegroundColor White
Write-Host "5. Déployer le site" -ForegroundColor White
Write-Host ""
Write-Host "📖 Voir GUIDE-DEPLOIEMENT-NETLIFY.md pour plus de détails" -ForegroundColor Cyan
Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
