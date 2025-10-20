# 🔧 GUIDE SCRIPTS DÉVELOPPEMENT CONTINU

## 🚀 Scripts Disponibles

### 1. Script PowerShell (Recommandé)
```powershell
# Utilisation
.\dev-continu.ps1 "Message de commit" [type]

# Exemples
.\dev-continu.ps1 "Ajout persistance Finance" persist
.\dev-continu.ps1 "Correction bug Knowledge Base" fix
.\dev-continu.ps1 "Amélioration UX Development" improve
.\dev-continu.ps1 "Nouvelle fonctionnalité Courses" feat
.\dev-continu.ps1 "Déploiement v1.1.0" deploy
.\dev-continu.ps1 "Mise à jour documentation" docs
```

### 2. Script Batch (Windows)
```cmd
# Utilisation
dev-continu.bat "Message de commit" [type]

# Exemples
dev-continu.bat "Ajout persistance Finance" persist
dev-continu.bat "Correction bug Knowledge Base" fix
dev-continu.bat "Amélioration UX Development" improve
```

## 📋 Types de Commit

| Type | Emoji | Description | Exemple |
|------|-------|-------------|---------|
| `feat` | ✨ | Nouvelle fonctionnalité | "Ajout export PDF" |
| `fix` | 🐛 | Correction de bug | "Correction formulaire" |
| `improve` | 💡 | Amélioration existante | "Amélioration performance" |
| `persist` | 💾 | Implémentation persistance | "Persistance module Finance" |
| `deploy` | 🚀 | Déploiement/version | "Déploiement v1.2.0" |
| `docs` | 📚 | Documentation | "Mise à jour README" |

## 🔄 Workflow de Développement

### 1. Développement Local
```bash
# Démarrer le serveur de développement
npm run dev

# Tester les modifications
# Ouvrir http://localhost:5173
```

### 2. Commit et Déploiement
```powershell
# Utiliser le script de développement continu
.\dev-continu.ps1 "Description des modifications" [type]
```

### 3. Vérification
- Le script fait automatiquement :
  - `git add .`
  - `git commit -m "message"`
  - `git push origin main`
  - `npm run build`
- Netlify déploie automatiquement
- Vérifier l'URL Netlify

## 🎯 Modules en Cours de Développement

### Phase 1 : Persistance Complète
- [ ] **Finance** - Implémentation CRUD complet
- [ ] **Knowledge Base** - Articles et catégories
- [ ] **Development** - Déploiements et bugs
- [ ] **Courses** - Cours et leçons
- [ ] **Jobs** - Offres et candidatures

### Phase 2 : Fonctionnalités Avancées
- [ ] **CRM & Sales** - Contacts et leads
- [ ] **AI Coach** - Sessions et recommandations
- [ ] **Gen AI Lab** - Expérimentations IA
- [ ] **Course Management** - Gestion complète
- [ ] **Settings** - Configuration système

## 📊 Suivi des Déploiements

### Dashboard de Suivi
- **URL Netlify** : [À configurer]
- **Dernier déploiement** : [Timestamp]
- **Modules fonctionnels** : 4/14
- **Modules en cours** : 10/14

### Logs de Déploiement
- **GitHub** : Voir l'historique des commits
- **Netlify** : Voir les logs de build
- **Supabase** : Voir les logs de base de données

## 🔧 Configuration Requise

### Variables d'Environnement Netlify
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_NAME=SENEGEL
VITE_APP_ENV=production
```

### Configuration Supabase
- **URL de production** configurée
- **CORS** autorisé pour Netlify
- **RLS** activé pour sécurité

## 🎉 Avantages du Déploiement Continu

### ✅ Pour le Client
- **Visibilité** en temps réel des progrès
- **Tests** immédiats des nouvelles fonctionnalités
- **Feedback** rapide et itératif

### ✅ Pour le Développement
- **Déploiement** automatique à chaque commit
- **Tests** en conditions réelles
- **Rollback** facile si problème
- **Historique** complet des modifications

---

**Développement continu activé !** 🔄
**Chaque commit = Déploiement automatique !** 🚀
