# ⚙️ CONFIGURATION APPWRITE - ECOSYSTIA

## 📋 INFORMATIONS DE VOTRE BASE DE DONNÉES

Basé sur les captures d'écran fournies, voici votre configuration Appwrite :

### 🔧 Configuration requise pour le fichier `.env`

Créez un fichier `.env` à la racine du projet avec :

```env
# Configuration Appwrite pour Ecosystia
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=68e54e9c002cb568cfec
VITE_APPWRITE_DATABASE_ID=68e56de100267007af6a
VITE_APPWRITE_STORAGE_BUCKET_ID=files
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## 📊 COLLECTIONS CONFIGURÉES

### ✅ Collections avec données existantes
- **utilisateurs_de_démo** : 19 utilisateurs (tous les rôles)
- **projets_de_démo** : 13 projets
- **projets** : 6 projets
- **demandes_de_congé** : 9 demandes
- **transactions financières** : 4 transactions
- **emplois** : 2 offres d'emploi
- **journaux de temps** : 3 entrées
- **utilisateurs_étendus** : 4 utilisateurs

### 🔄 Collections vides à migrer
- badges
- certifications
- cours
- clients_crm
- crm_leads
- cours_de_démo
- dépenses_de_démo
- factures_de_démo
- démo_jobs
- demandes_de_congé_de_démo
- journaux_de_temps_de_démo
- inscriptions
- documents_de_connaissance
- notifications
- rapports
- tâches

## 🚀 ÉTAPES DE CONFIGURATION

### 1. Créer le fichier .env
```bash
# Dans le terminal, à la racine du projet
echo "VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1" > .env
echo "VITE_APPWRITE_PROJECT_ID=68e54e9c002cb568cfec" >> .env
echo "VITE_APPWRITE_DATABASE_ID=68e56de100267007af6a" >> .env
echo "VITE_APPWRITE_STORAGE_BUCKET_ID=files" >> .env
echo "VITE_GEMINI_API_KEY=your_gemini_api_key_here" >> .env
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Lancer l'application
```bash
npm run dev
```

### 4. Tester la connexion Appwrite
Ouvrir la console du navigateur et vérifier qu'il n'y a pas d'erreurs de connexion.

## 🔑 CLÉS API APPWRITE

### Pour créer une clé API :
1. Aller sur https://cloud.appwrite.io/console
2. Sélectionner votre projet "ÉcosystIA"
3. Aller dans "Intégrations" → "Clés API"
4. Cliquer sur "+ Créer une clé API"
5. Copier la clé générée

### Pour créer une clé de développement :
1. Aller dans "Intégrations" → "Clés de développement"
2. Cliquer sur "+ Créer une clé de développement"
3. Cette clé contourne les limites CORS pour le développement

## 📈 MIGRATION DES DONNÉES

### Script de migration automatique
Le fichier `services/migrationService.ts` contient tous les scripts nécessaires :

```typescript
import { migrateAllData, checkAppwriteConnection } from './services/migrationService';

// Vérifier la connexion
await checkAppwriteConnection();

// Migrer toutes les données
await migrateAllData();
```

### Données à migrer :
- **19 utilisateurs** → utilisateurs_de_démo
- **18 projets** → projets + projets_de_démo
- **12 cours** → cours + cours_de_démo
- **25 tâches** → tâches
- **Journaux de temps** → journaux de temps
- **Factures/Dépenses** → transactions financières
- **Contacts** → clients_crm

## 🧪 TESTS DE VALIDATION

### 1. Test de connexion
```bash
npm run dev
# → Vérifier que l'app se charge sans erreur
# → Console : "✅ Connexion Appwrite OK"
```

### 2. Test des modules
- **Dashboard** → Voir les métriques Appwrite
- **Projects** → Créer/modifier un projet
- **Courses** → Voir les cours migrés
- **Finance** → Voir les transactions

### 3. Test des exports
- **PDF** → Générer un rapport
- **Excel** → Exporter des données

## 🔧 DÉPANNAGE

### Erreur "API Key must be set"
- Vérifier que le fichier `.env` existe
- Redémarrer le serveur de développement
- Vérifier que les variables commencent par `VITE_`

### Erreur de connexion Appwrite
- Vérifier l'URL de l'endpoint
- Vérifier l'ID du projet
- Vérifier les permissions de la clé API

### Données non affichées
- Vérifier que les collections existent
- Vérifier les permissions de lecture
- Utiliser le mode fallback (données mockées)

## 📊 MÉTRIQUES ACTUELLES

D'après votre dashboard Appwrite :
- **Base de données** : 60 lignes
- **Authentification** : 1 utilisateur
- **Stockage** : 0 B
- **Fonctions** : 0 exécutions

## 🎯 OBJECTIFS DE MIGRATION

### Avant (Mock data)
- ❌ Données non persistantes
- ❌ Pas de sauvegarde
- ❌ Limité à 1 utilisateur

### Après (Appwrite)
- ✅ Données persistantes
- ✅ Sauvegarde automatique
- ✅ Multi-utilisateurs (19 rôles)
- ✅ API REST complète
- ✅ Authentification intégrée

---

**🚀 ECOSYSTIA est prêt pour Appwrite !**

