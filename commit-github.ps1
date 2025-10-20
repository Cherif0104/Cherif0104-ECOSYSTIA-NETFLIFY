# Script de commit automatique vers GitHub
Write-Host "🚀 COMMIT AUTOMATIQUE VERS GITHUB" -ForegroundColor Green

# Vérifier si Git est initialisé
if (!(Test-Path ".git")) {
    Write-Host "🔧 Initialisation de Git..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git initialisé" -ForegroundColor Green
}

# Ajouter tous les fichiers
Write-Host "📁 Ajout des fichiers..." -ForegroundColor Yellow
git add .

# Vérifier le statut
Write-Host "📊 Statut des fichiers:" -ForegroundColor Cyan
git status

# Faire le commit
Write-Host "💾 Création du commit..." -ForegroundColor Yellow
$commitMessage = "🚀 Ecosystia Workflow - Déploiement automatique configuré

✨ Fonctionnalités:
- Interface ultra-moderne
- 19 rôles d'authentification
- Modules complets (Projects, Goals, Time Tracking, etc.)
- Gestion d'équipe avancée
- Interconnexion des modules
- Persistance Appwrite

🔧 Configuration:
- Déploiement automatique Netlify
- Variables d'environnement configurées
- Base de données Appwrite
- Authentification hybride

🎯 Prêt pour la production!"

git commit -m $commitMessage

# Vérifier si un remote existe
$remoteExists = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Aucun remote GitHub configuré" -ForegroundColor Yellow
    Write-Host "📋 Étapes suivantes:" -ForegroundColor Cyan
    Write-Host "1. Créer un repository sur GitHub" -ForegroundColor White
    Write-Host "2. Exécuter: git remote add origin https://github.com/VOTRE_USERNAME/ecosystia-workflow.git" -ForegroundColor White
    Write-Host "3. Exécuter: git push -u origin main" -ForegroundColor White
} else {
    Write-Host "🌐 Push vers GitHub..." -ForegroundColor Yellow
    git push origin main
    Write-Host "✅ Push réussi!" -ForegroundColor Green
}

Write-Host "🎉 Commit terminé!" -ForegroundColor Green
Write-Host "📋 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. Créer un repository GitHub" -ForegroundColor White
Write-Host "2. Connecter à Netlify" -ForegroundColor White
Write-Host "3. Configurer le déploiement automatique" -ForegroundColor White
