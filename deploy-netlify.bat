@echo off
echo 🚀 DÉPLOIEMENT SENEGEL SUR NETLIFY
echo =====================================

echo.
echo 1. Vérification de l'état Git...
git status

echo.
echo 2. Ajout des fichiers modifiés...
git add .

echo.
echo 3. Commit des modifications...
git commit -m "🚀 Déploiement production - $(date)"

echo.
echo 4. Push vers GitHub...
git push origin main

echo.
echo 5. Build de production...
npm run build

echo.
echo ✅ DÉPLOIEMENT TERMINÉ !
echo.
echo 📋 Prochaines étapes :
echo 1. Aller sur https://netlify.com
echo 2. Se connecter avec GitHub
echo 3. Sélectionner le repository Cherif0104-ECOSYSTIA-NETFLIFY
echo 4. Configurer les variables d'environnement
echo 5. Déployer le site
echo.
echo 📖 Voir GUIDE-DEPLOIEMENT-NETLIFY.md pour plus de détails
echo.
pause
