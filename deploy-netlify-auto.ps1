# Script de déploiement automatique sur Netlify
Write-Host "🚀 DÉPLOIEMENT AUTOMATIQUE NETLIFY" -ForegroundColor Green

# Vérifier si Netlify CLI est installé
Write-Host "🔍 Vérification de Netlify CLI..." -ForegroundColor Yellow

try {
    $netlifyVersion = netlify --version
    Write-Host "✅ Netlify CLI version: $netlifyVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Netlify CLI non installé, installation..." -ForegroundColor Red
    npm install -g netlify-cli
    Write-Host "✅ Netlify CLI installé" -ForegroundColor Green
}

# Déployer sur Netlify
Write-Host "🌐 Déploiement sur Netlify..." -ForegroundColor Yellow

try {
    netlify deploy --prod --dir=dist
    Write-Host "✅ Déploiement réussi sur Netlify!" -ForegroundColor Green
    Write-Host "🎯 Votre application est maintenant accessible en ligne!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur de déploiement Netlify" -ForegroundColor Red
    Write-Host "🔧 Solutions alternatives:" -ForegroundColor Yellow
    Write-Host "1. Aller sur https://netlify.com et importer manuellement" -ForegroundColor White
    Write-Host "2. Utiliser Vercel: https://vercel.com" -ForegroundColor White
    Write-Host "3. Utiliser GitHub Pages" -ForegroundColor White
}

Write-Host "🎉 Script terminé!" -ForegroundColor Green
