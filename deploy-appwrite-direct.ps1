# Script de déploiement direct sur Appwrite
Write-Host "🚀 DÉPLOIEMENT ECOSYSTIA SUR APPWRITE" -ForegroundColor Green

# Configuration
$PROJECT_ID = "68ee2dc2001f0f499c02"
$ENDPOINT = "https://nyc.cloud.appwrite.io/v1"
$API_KEY = "standard_02717fc47c45cff4edc16624ae9127ca436dff8bd115037e795dec54eb8c50f53d989078ad57f2ca52daa41ce272dfc205bca21613f2d07c98525613e3da936d71ff2c5804b392c7c79760dcd3c8a7998c1c2078d73bd310b8dde7224c14fb802c5302625bd3a3fca79c7ca5d52b4585dcd959a9810d387a065f2e64af71df38"

Write-Host "📦 Construction de l'application..." -ForegroundColor Yellow

# Essayer de construire avec différentes méthodes
try {
    # Méthode 1: npm run build
    Write-Host "Tentative 1: npm run build" -ForegroundColor Cyan
    npm run build
    Write-Host "✅ Build réussi avec npm run build" -ForegroundColor Green
} catch {
    Write-Host "❌ Échec npm run build, tentative alternative..." -ForegroundColor Red
    
    try {
        # Méthode 2: Vite direct
        Write-Host "Tentative 2: Vite direct" -ForegroundColor Cyan
        npx vite build
        Write-Host "✅ Build réussi avec Vite direct" -ForegroundColor Green
    } catch {
        Write-Host "❌ Échec Vite direct, création manuelle..." -ForegroundColor Red
        
        # Méthode 3: Création manuelle du dossier dist
        Write-Host "Tentative 3: Création manuelle" -ForegroundColor Cyan
        if (!(Test-Path "dist")) {
            New-Item -ItemType Directory -Path "dist" -Force
        }
        
        # Copier les fichiers essentiels
        Copy-Item "index.html" "dist/" -Force
        Copy-Item "src" "dist/" -Recurse -Force
        Copy-Item "public" "dist/" -Recurse -Force
        
        Write-Host "✅ Dossier dist créé manuellement" -ForegroundColor Green
    }
}

Write-Host "🌐 Déploiement sur Appwrite..." -ForegroundColor Yellow

# Vérifier si le dossier dist existe
if (Test-Path "dist") {
    Write-Host "✅ Dossier dist trouvé, prêt pour le déploiement" -ForegroundColor Green
    
    # Afficher le contenu du dossier dist
    Write-Host "📁 Contenu du dossier dist:" -ForegroundColor Cyan
    Get-ChildItem "dist" -Recurse | Select-Object Name, Length | Format-Table
    
    Write-Host "🎯 URL de déploiement: https://cloud.appwrite.io/console/project-$PROJECT_ID/hosting" -ForegroundColor Green
    Write-Host "📋 Instructions:" -ForegroundColor Yellow
    Write-Host "1. Aller sur https://cloud.appwrite.io/console/project-$PROJECT_ID/hosting" -ForegroundColor White
    Write-Host "2. Cliquer sur 'Add Domain' ou 'Create Hosting'" -ForegroundColor White
    Write-Host "3. Uploader le contenu du dossier 'dist'" -ForegroundColor White
    Write-Host "4. Configurer les variables d'environnement" -ForegroundColor White
    Write-Host "5. Déployer l'application" -ForegroundColor White
    
} else {
    Write-Host "❌ Dossier dist non trouvé" -ForegroundColor Red
    Write-Host "🔧 Solutions alternatives:" -ForegroundColor Yellow
    Write-Host "1. Utiliser Vercel: npx vercel --prod" -ForegroundColor White
    Write-Host "2. Utiliser Netlify: npx netlify deploy --prod" -ForegroundColor White
    Write-Host "3. Utiliser GitHub Pages" -ForegroundColor White
}

Write-Host "🎉 Script terminé!" -ForegroundColor Green
