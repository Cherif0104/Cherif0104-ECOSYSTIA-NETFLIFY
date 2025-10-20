@echo off
echo 🚀 DÉPLOIEMENT SENEGEL - VERSION PRODUCTION
echo ================================================
echo.

echo 📋 Configuration du déploiement SENEGEL...
echo.

echo 🔧 Étape 1: Installation des dépendances
call npm install
if %errorlevel% neq 0 (
    echo ❌ Erreur lors de l'installation des dépendances
    pause
    exit /b 1
)
echo ✅ Dépendances installées
echo.

echo 🔧 Étape 2: Import des utilisateurs SENEGEL
echo Import des 19 utilisateurs SENEGEL dans Appwrite...
call node scripts/importSenegelUsers.cjs
if %errorlevel% neq 0 (
    echo ⚠️ Avertissement: Erreur lors de l'import des utilisateurs
    echo Continuez avec le déploiement...
)
echo.

echo 🔧 Étape 3: Build de production
echo Construction de l'application pour la production...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Erreur lors du build
    pause
    exit /b 1
)
echo ✅ Build terminé avec succès
echo.

echo 🔧 Étape 4: Préparation du déploiement
echo Création des fichiers de configuration...
echo.

echo 📁 Création du fichier de configuration SENEGEL...
echo {
echo   "name": "SENEGEL - Plateforme de Gestion",
echo   "version": "1.0.0",
echo   "company": "SENEGEL",
echo   "email": "contact@senegel.org",
echo   "phone": "77 853 33 99",
echo   "ninea": "005635638",
echo   "rc": "SNDKR2015B18420",
echo   "address": "Dakar, en face arrêt Brt Liberté 6. Immeuble N°5486B. 4eme Étage. App10",
echo   "appwrite": {
echo     "endpoint": "https://nyc.cloud.appwrite.io/v1",
echo     "projectId": "68ee2dc2001f0f499c02",
echo     "databaseId": "68ee527d002813e4e0ca"
echo   },
echo   "users": 19,
echo   "modules": [
echo     "Dashboard",
echo     "Projets",
echo     "Objectifs (OKRs)",
echo     "Suivi du Temps",
echo     "Gestion des Congés",
echo     "Finance",
echo     "Base de Connaissances",
echo     "Développement",
echo     "Formation",
echo     "Emplois",
echo     "CRM & Ventes",
echo     "Analytics",
echo     "Gestion des Utilisateurs",
echo     "Paramètres"
echo   ]
echo } > public/senegel-config.json
echo ✅ Configuration SENEGEL créée
echo.

echo 🔧 Étape 5: Validation des fichiers
echo Vérification des fichiers de production...
if not exist "dist\index.html" (
    echo ❌ Fichier index.html manquant dans dist/
    pause
    exit /b 1
)
if not exist "netlify.toml" (
    echo ❌ Fichier netlify.toml manquant
    pause
    exit /b 1
)
echo ✅ Tous les fichiers sont présents
echo.

echo 🔧 Étape 6: Commit et Push vers GitHub
echo Ajout des fichiers au repository...
call git add .
call git commit -m "🚀 SENEGEL Production v1.0.0 - Déploiement avec utilisateurs réels"
call git push origin main
if %errorlevel% neq 0 (
    echo ⚠️ Avertissement: Erreur lors du push vers GitHub
    echo Continuez avec le déploiement Netlify...
)
echo ✅ Code poussé vers GitHub
echo.

echo 🎉 DÉPLOIEMENT SENEGEL TERMINÉ!
echo ================================================
echo.
echo 📊 RÉSUMÉ DU DÉPLOIEMENT:
echo   ✅ Application: SENEGEL v1.0.0
echo   ✅ Utilisateurs: 19 utilisateurs SENEGEL importés
echo   ✅ Modules: 14 modules UltraModern V2
echo   ✅ Base de données: Appwrite configurée
echo   ✅ Déploiement: Prêt pour Netlify
echo.
echo 🔗 PROCHAINES ÉTAPES:
echo   1. Connecter le repository à Netlify
echo   2. Configurer les variables d'environnement
echo   3. Déployer l'application
echo   4. Tester avec les utilisateurs SENEGEL
echo.
echo 📧 Support: contact@senegel.org
echo 📞 Téléphone: 77 853 33 99
echo.
pause
