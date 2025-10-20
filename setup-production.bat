@echo off
echo 🚀 Configuration de la production SENEGEL...
echo.

echo 📦 Installation des dépendances...
call npm install

echo.
echo 🔧 Configuration des collections Appwrite...
call npx ts-node scripts/setupProductionCollections.ts

echo.
echo ✅ Configuration terminée!
echo.
echo 📋 Prochaines étapes:
echo 1. Vérifiez les collections dans Appwrite Console
echo 2. Testez l'authentification
echo 3. Lancez l'application: npm run dev
echo.
pause
