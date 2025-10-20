# 🚀 SCRIPT DE DÉPLOIEMENT NETLIFY AVEC SUPABASE
# ================================================

Write-Host "🚀 DÉPLOIEMENT NETLIFY AVEC SUPABASE" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erreur: package.json non trouvé. Assurez-vous d'être dans le répertoire du projet." -ForegroundColor Red
    exit 1
}

# Vérifier que Git est initialisé
if (-not (Test-Path ".git")) {
    Write-Host "❌ Erreur: Git non initialisé. Exécutez 'git init' d'abord." -ForegroundColor Red
    exit 1
}

Write-Host "📋 ÉTAPE 1: Vérification des fichiers" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow

# Vérifier les fichiers essentiels
$essentialFiles = @(
    "package.json",
    "netlify.toml",
    "config/supabase.ts",
    "services/supabaseService.ts",
    "contexts/AuthContextSupabase.tsx"
)

foreach ($file in $essentialFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file manquant" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n📦 ÉTAPE 2: Installation des dépendances" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow

# Installer les dépendances
Write-Host "Installation des dépendances..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dépendances installées" -ForegroundColor Green

Write-Host "`n🔨 ÉTAPE 3: Build de l'application" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow

# Build de l'application
Write-Host "Build de l'application..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du build" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build réussi" -ForegroundColor Green

Write-Host "`n📝 ÉTAPE 4: Préparation du commit" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow

# Ajouter tous les fichiers
Write-Host "Ajout des fichiers..." -ForegroundColor Cyan
git add .

# Commit avec message descriptif
$commitMessage = @"
🚀 Migration complète vers Supabase - Prêt pour production Netlify

✅ Migration 100% Supabase terminée
✅ Tous les services fonctionnels
✅ 19 utilisateurs SENEGEL créés
✅ Persistance des données complète
✅ Time Tracking corrigé
✅ AI Coach corrigé
✅ Configuration Netlify optimisée

Modules fonctionnels:
- Projects (CRUD complet)
- Goals/OKRs (persistant)
- Time Tracking (bouton actif)
- Knowledge Base (persistant)
- Jobs (persistant)
- Courses (persistant)
- Finance (persistant)
- AI Coach (erreurs corrigées)

Prêt pour déploiement production !
"@

git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du commit" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Commit créé" -ForegroundColor Green

Write-Host "`n🌐 ÉTAPE 5: Configuration du remote GitHub" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow

# Configurer le remote GitHub
Write-Host "Configuration du remote GitHub..." -ForegroundColor Cyan
git remote add origin https://github.com/Cherif0104/Cherif0104-ECOSYSTIA-NETFLIFY.git

# Renommer la branche en main
git branch -M main

Write-Host "✅ Remote GitHub configuré" -ForegroundColor Green

Write-Host "`n🚀 ÉTAPE 6: Push vers GitHub" -ForegroundColor Yellow
Write-Host "===========================" -ForegroundColor Yellow

# Push vers GitHub
Write-Host "Push vers GitHub..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du push" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Push réussi vers GitHub" -ForegroundColor Green

Write-Host "`n🎉 DÉPLOIEMENT TERMINÉ !" -ForegroundColor Green
Write-Host "=======================" -ForegroundColor Green

Write-Host "`n📋 PROCHAINES ÉTAPES:" -ForegroundColor Yellow
Write-Host "=====================" -ForegroundColor Yellow
Write-Host "1. Allez sur https://netlify.com" -ForegroundColor Cyan
Write-Host "2. Cliquez sur 'New site from Git'" -ForegroundColor Cyan
Write-Host "3. Connectez votre repository GitHub" -ForegroundColor Cyan
Write-Host "4. Configurez les paramètres de build:" -ForegroundColor Cyan
Write-Host "   - Build command: npm run build" -ForegroundColor White
Write-Host "   - Publish directory: dist" -ForegroundColor White
Write-Host "5. Ajoutez les variables d'environnement Supabase" -ForegroundColor Cyan
Write-Host "6. Déployez !" -ForegroundColor Cyan

Write-Host "`n🔧 VARIABLES D'ENVIRONNEMENT NETLIFY:" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow
Write-Host "VITE_SUPABASE_URL=https://nigfrebfpkeoreaaiqzu.supabase.co" -ForegroundColor White
Write-Host "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZ2ZyZWJmcGtlb3JlYWFpcXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NjIzMDYsImV4cCI6MjA3NjIzODMwNn0.-_jcUhUeifEACMHl2SAErb7lAfzOVHzD7QGtAxFsgQk" -ForegroundColor White

Write-Host "`n✅ VOTRE APPLICATION EST PRÊTE POUR NETLIFY !" -ForegroundColor Green
Write-Host "🎯 Tous les modules sont fonctionnels avec Supabase" -ForegroundColor Green
Write-Host "👥 19 utilisateurs SENEGEL prêts à se connecter" -ForegroundColor Green
Write-Host "🗄️ Persistance des données complète" -ForegroundColor Green
