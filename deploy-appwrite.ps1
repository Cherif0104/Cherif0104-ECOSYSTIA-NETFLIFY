#!/usr/bin/env pwsh

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 DÉPLOIEMENT ERP SENEGEL - APPWRITE HOSTING" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Étape 1 : Vérifier que le build existe
if (-Not (Test-Path -Path "dist")) {
    Write-Host "❌ Le dossier dist/ n'existe pas" -ForegroundColor Red
    Write-Host "📦 Lancement du build de production..." -ForegroundColor Yellow
    Write-Host ""
    
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "❌ Erreur lors du build" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "✅ Build réussi" -ForegroundColor Green
} else {
    Write-Host "✅ Build de production trouvé (dist/)" -ForegroundColor Green
}

Write-Host ""
Write-Host "───────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Étape 2 : Se connecter à Appwrite
Write-Host "🔐 Connexion à Appwrite Cloud..." -ForegroundColor Yellow
Write-Host ""
Write-Host "   ℹ️  Si ce n'est pas déjà fait, vous allez devoir :" -ForegroundColor Blue
Write-Host "      1. Autoriser dans votre navigateur" -ForegroundColor Blue
Write-Host "      2. Revenir ici pour continuer" -ForegroundColor Blue
Write-Host ""

appwrite login

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Erreur lors de la connexion" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Solution :" -ForegroundColor Yellow
    Write-Host "   1. Vérifiez votre connexion internet" -ForegroundColor White
    Write-Host "   2. Réessayez : appwrite login" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "✅ Connexion réussie" -ForegroundColor Green
Write-Host ""
Write-Host "───────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Étape 3 : Créer un bucket de storage public pour le frontend
Write-Host "📦 Configuration du hosting sur Appwrite..." -ForegroundColor Yellow
Write-Host ""
Write-Host "   Project ID: 68e54e9c002cb568cfec" -ForegroundColor Blue
Write-Host "   Database ID: 68e56de100267007af6a" -ForegroundColor Blue
Write-Host ""

# Note: Appwrite ne supporte pas encore le hosting statique direct via CLI
# On va utiliser le Storage comme workaround
Write-Host "   ℹ️  Appwrite ne supporte pas encore le static hosting direct" -ForegroundColor Blue
Write-Host "   ℹ️  Nous allons déployer manuellement via la console" -ForegroundColor Blue
Write-Host ""

Write-Host "───────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Étape 4 : Instructions manuelles
Write-Host "📋 INSTRUCTIONS DE DÉPLOIEMENT MANUEL" -ForegroundColor Cyan
Write-Host ""
Write-Host "Suivez ces étapes dans la console Appwrite :" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Ouvrir la console : https://cloud.appwrite.io/console" -ForegroundColor White
Write-Host ""
Write-Host "2️⃣  Sélectionner le projet : ERP SENEGEL (68e54e9c002cb568cfec)" -ForegroundColor White
Write-Host ""
Write-Host "3️⃣  OPTION A - Via Storage (simple) :" -ForegroundColor Green
Write-Host "   • Aller dans Storage" -ForegroundColor White
Write-Host "   • Créer un bucket : 'frontend' (public read)" -ForegroundColor White
Write-Host "   • Uploader tous les fichiers du dossier dist/" -ForegroundColor White
Write-Host "   • Utiliser index.html comme point d'entrée" -ForegroundColor White
Write-Host ""
Write-Host "4️⃣  OPTION B - Via Vercel (recommandé) :" -ForegroundColor Green
Write-Host "   • Installer Vercel CLI : npm i -g vercel" -ForegroundColor White
Write-Host "   • Lancer : vercel --prod" -ForegroundColor White
Write-Host "   • Suivre les instructions" -ForegroundColor White
Write-Host ""
Write-Host "5️⃣  OPTION C - Via Netlify :" -ForegroundColor Green
Write-Host "   • Installer Netlify CLI : npm i -g netlify-cli" -ForegroundColor White
Write-Host "   • Lancer : netlify deploy --prod --dir=dist" -ForegroundColor White
Write-Host ""

Write-Host "───────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Proposer Vercel comme alternative rapide
Write-Host "⚡ DÉPLOIEMENT RAPIDE AVEC VERCEL (Recommandé)" -ForegroundColor Cyan
Write-Host ""
$response = Read-Host "Voulez-vous déployer sur Vercel maintenant ? (O/N)"

if ($response -eq "O" -or $response -eq "o" -or $response -eq "Y" -or $response -eq "y") {
    Write-Host ""
    Write-Host "🚀 Installation de Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
    
    Write-Host ""
    Write-Host "🌐 Déploiement sur Vercel..." -ForegroundColor Yellow
    Write-Host ""
    vercel --prod
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Déploiement Vercel réussi !" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 Votre application est en ligne !" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Erreur lors du déploiement Vercel" -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "ℹ️  Vous pouvez déployer manuellement plus tard" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Commandes disponibles :" -ForegroundColor Yellow
    Write-Host "  • Vercel : vercel --prod" -ForegroundColor White
    Write-Host "  • Netlify : netlify deploy --prod --dir=dist" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ SCRIPT TERMINÉ" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Afficher le résumé
Write-Host "📊 RÉSUMÉ" -ForegroundColor Yellow
Write-Host ""
Write-Host "  ✅ Build de production : dist/" -ForegroundColor Green
Write-Host "  ✅ Appwrite CLI : Installée et connectée" -ForegroundColor Green
Write-Host "  ✅ Documentation : DEPLOIEMENT-APPWRITE-HOSTING.md" -ForegroundColor Green
Write-Host ""
Write-Host "📂 Fichiers livrés :" -ForegroundColor Yellow
Write-Host "  • dist/ - Build de production" -ForegroundColor White
Write-Host "  • appwrite.json - Configuration Appwrite" -ForegroundColor White
Write-Host "  • vercel.json - Configuration Vercel" -ForegroundColor White
Write-Host "  • 20+ documents de documentation" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Prochaines étapes :" -ForegroundColor Yellow
Write-Host "  1. Tester l'application déployée" -ForegroundColor White
Write-Host "  2. Ajouter le domaine dans Appwrite Platforms" -ForegroundColor White
Write-Host "  3. Partager l'URL avec IMPULCIA" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

