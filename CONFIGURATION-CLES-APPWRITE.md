# 🔑 CONFIGURATION DES CLÉS APPWRITE - ECOSYSTIA

## 📊 VOS INFORMATIONS APPWRITE

Basé sur vos captures d'écran :

### 🔧 Configuration requise
```env
# Fichier .env à créer à la racine du projet
VITE_APPWRITE_ENDPOINT=https://sfo.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=68e54e9c002cb568cfec
VITE_APPWRITE_DATABASE_ID=68e56de100267007af6a
VITE_APPWRITE_STORAGE_BUCKET_ID=files
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## 🚀 ÉTAPES DE CRÉATION DES CLÉS

### 1. Créer une Clé API (Production)

#### Dans votre dashboard Appwrite :
1. **Aller dans** : "Intégrations" → "Clés API"
2. **Cliquer sur** : "+ Créer une clé API"
3. **Configurer** :
   - **Nom** : "Ecosystia Production"
   - **Permissions** :
     - ✅ **Databases** (Read, Write, Create, Update, Delete)
     - ✅ **Storage** (Read, Write, Create, Update, Delete)
     - ✅ **Users** (Read, Write, Create, Update, Delete)
     - ✅ **Functions** (Execute)
4. **Copier** la clé générée

### 2. Créer une Clé de développement

#### Dans votre dashboard Appwrite :
1. **Aller dans** : "Intégrations" → "Clés de développement"
2. **Cliquer sur** : "+ Créer une clé de développement"
3. **Avantages** :
   - ✅ Contourne les erreurs CORS
   - ✅ Limites de débit plus élevées
   - ✅ Idéal pour le développement local
4. **Copier** la clé générée

## 📝 CONFIGURATION COMPLÈTE

### Fichier .env (à créer)
```env
# Configuration Appwrite
VITE_APPWRITE_ENDPOINT=https://sfo.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=68e54e9c002cb568cfec
VITE_APPWRITE_DATABASE_ID=68e56de100267007af6a
VITE_APPWRITE_STORAGE_BUCKET_ID=files

# Clés API (remplacer par vos vraies clés)
VITE_APPWRITE_API_KEY=your_production_api_key_here
VITE_APPWRITE_DEV_KEY=your_development_key_here

# Clé Gemini (optionnel)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Fichier .env.development (optionnel)
```env
# Configuration développement
VITE_APPWRITE_ENDPOINT=https://sfo.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=68e54e9c002cb568cfec
VITE_APPWRITE_DATABASE_ID=68e56de100267007af6a
VITE_APPWRITE_API_KEY=your_development_key_here
```

### Fichier .env.production (optionnel)
```env
# Configuration production
VITE_APPWRITE_ENDPOINT=https://sfo.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=68e54e9c002cb568cfec
VITE_APPWRITE_DATABASE_ID=68e56de100267007af6a
VITE_APPWRITE_API_KEY=your_production_api_key_here
```

## 🔧 MISE À JOUR DU SERVICE APPWRITE

### services/appwriteService.ts
```typescript
import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

const client = new Client();

// Configuration avec vos vraies valeurs
client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(import.meta.env.VITE_APPWRITE_API_KEY); // Nouvelle ligne pour l'API key

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const STORAGE_BUCKET_ID = import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID;

export { ID, Query };
```

## 🧪 TEST DE CONNEXION

### Script de test
```typescript
// test-connection.ts
import { databases, DATABASE_ID } from './services/appwriteService';

const testConnection = async () => {
  try {
    const response = await databases.list(DATABASE_ID);
    console.log('✅ Connexion Appwrite réussie !');
    console.log('📊 Collections disponibles:', response.collections);
    return true;
  } catch (error) {
    console.error('❌ Erreur connexion Appwrite:', error);
    return false;
  }
};

// Lancer le test
testConnection();
```

## 🔐 SÉCURITÉ DES CLÉS

### ⚠️ IMPORTANT - Sécurité
- ❌ **NE JAMAIS** commiter les clés dans Git
- ✅ **TOUJOURS** utiliser des variables d'environnement
- ✅ **AJOUTER** `.env` dans `.gitignore`
- ✅ **ROTATION** des clés régulièrement

### Permissions recommandées
```json
{
  "databases": ["read", "write", "create", "update", "delete"],
  "storage": ["read", "write", "create", "update", "delete"],
  "users": ["read", "write", "create", "update", "delete"],
  "functions": ["execute"]
}
```

## 🚀 LANCEMENT DE L'APPLICATION

### Après configuration
```bash
# 1. Créer le fichier .env avec vos clés
# 2. Installer les dépendances
npm install

# 3. Lancer l'application
npm run dev

# 4. Tester la connexion
# → Ouvrir http://localhost:5173
# → Vérifier la console pour "✅ Connexion Appwrite réussie !"
```

## 📊 VALIDATION

### Checklist de validation
- [ ] Fichier `.env` créé avec les bonnes valeurs
- [ ] Clé API créée avec les bonnes permissions
- [ ] Clé de développement créée (optionnel)
- [ ] Application se lance sans erreur
- [ ] Console affiche "Connexion Appwrite réussie"
- [ ] Données s'affichent dans l'interface

## 🆘 DÉPANNAGE

### Erreurs communes
1. **"Invalid API key"** → Vérifier la clé dans .env
2. **"CORS error"** → Utiliser la clé de développement
3. **"Project not found"** → Vérifier l'ID du projet
4. **"Database not found"** → Vérifier l'ID de la base de données

---

**🎉 ECOSYSTIA est prêt pour Appwrite avec vos clés API !**

