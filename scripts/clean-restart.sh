#!/bin/bash

# Script de nettoyage et redémarrage pour corriger les erreurs de cache
echo "🧹 Nettoyage du cache et redémarrage..."

# Arrêter le serveur s'il tourne
echo "🛑 Arrêt du serveur de développement..."
pkill -f "vite" || true

# Nettoyer le cache
echo "🧹 Nettoyage du cache..."
rm -rf node_modules/.vite
rm -rf dist
rm -rf .vite

# Réinstaller les dépendances si nécessaire
echo "📦 Vérification des dépendances..."
npm install

# Redémarrer le serveur
echo "🚀 Redémarrage du serveur de développement..."
npm run dev
