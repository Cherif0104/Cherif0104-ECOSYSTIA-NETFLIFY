# Script de connexion au repository GitHub existant
Write-Host "🚀 CONNEXION AU REPOSITORY GITHUB" -ForegroundColor Green

# Vérifier si Git est initialisé
if (!(Test-Path ".git")) {
    Write-Host "🔧 Initialisation de Git..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git initialisé" -ForegroundColor Green
} else {
    Write-Host "✅ Git déjà initialisé" -ForegroundColor Green
}

# Ajouter le remote GitHub
Write-Host "🌐 Ajout du remote GitHub..." -ForegroundColor Yellow
git remote add origin https://github.com/Cherif0104/ECOSYSTIA-netlify.git

# Vérifier le remote
Write-Host "📋 Remote configuré:" -ForegroundColor Cyan
git remote -v

# Ajouter tous les fichiers
Write-Host "📁 Ajout des fichiers..." -ForegroundColor Yellow
git add .

# Vérifier le statut
Write-Host "📊 Statut des fichiers:" -ForegroundColor Cyan
git status

# Faire le commit initial
Write-Host "💾 Création du commit initial..." -ForegroundColor Yellow
$commitMessage = "🚀 Ecosystia Workflow - Déploiement initial

✨ Fonctionnalités principales:
- Interface ultra-moderne avec React 19 + TypeScript
- 19 rôles d'authentification (Mode Démo + Production)
- Modules complets: Projects, Goals, Time Tracking, Finance, etc.
- Gestion d'équipe avancée avec rôles et compétences
- Interconnexion des modules avec persistance Appwrite
- Design responsive avec animations fluides

🔧 Configuration technique:
- Frontend: React 19, TypeScript, Tailwind CSS
- Backend: Appwrite (Base de données, Auth, Storage)
- Build: Vite avec configuration optimisée
- Déploiement: Netlify avec déploiement automatique
- IA: Google Gemini API intégrée

🎯 Prêt pour la production avec déploiement automatique!"

git commit -m $commitMessage

# Renommer la branche principale
Write-Host "🌿 Configuration de la branche principale..." -ForegroundColor Yellow
git branch -M main

# Push vers GitHub
Write-Host "📤 Push vers GitHub..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Push réussi!" -ForegroundColor Green
    Write-Host "🎉 Repository GitHub configuré avec succès!" -ForegroundColor Green
    Write-Host "🌐 URL: https://github.com/Cherif0104/ECOSYSTIA-netlify" -ForegroundColor Cyan
} else {
    Write-Host "❌ Erreur lors du push" -ForegroundColor Red
    Write-Host "🔧 Vérifiez votre authentification GitHub" -ForegroundColor Yellow
}

Write-Host "📋 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. Aller sur https://netlify.com" -ForegroundColor White
Write-Host "2. Connecter le repository GitHub" -ForegroundColor White
Write-Host "3. Configurer le déploiement automatique" -ForegroundColor White
Write-Host "4. Ajouter les variables d'environnement" -ForegroundColor White
Write-Host "5. Déployer l'application" -ForegroundColor White
