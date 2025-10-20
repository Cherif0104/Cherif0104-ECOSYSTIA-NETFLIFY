# 🧪 GUIDE DE TEST - PERSISTANCE MODULE PAR MODULE

## 📁 **MODULE PROJECTS** - ✅ CORRIGÉ

### **Problème identifié :**
- ❌ Erreur 403 lors de la création de projet
- ❌ `owner_id` manquant dans les données d'insertion
- ❌ Policies RLS bloquaient l'insertion

### **Solution appliquée :**
- ✅ Correction du composant `ProjectsUltraModernV2.tsx`
- ✅ Correction du service `supabaseDataService.ts`
- ✅ Utilisation d'`AuthUtils.getProjectInsertData()`

### **Test de validation :**
```bash
node test-projects-persistence.cjs
```

**Résultats :**
- ✅ Création: Projet créé avec owner_id correct
- ✅ Lecture: Projet visible après création
- ✅ Mise à jour: Projet modifié avec succès
- ✅ Suppression: Projet supprimé avec succès
- ✅ Persistance: Toutes les opérations CRUD fonctionnent

---

## 🎯 **MODULE GOALS** - À TESTER

### **Test à effectuer :**
1. Se connecter avec `rokhaya@senegel.org`
2. Aller dans le module Goals
3. Créer un nouvel objectif
4. Vérifier qu'il apparaît dans la liste
5. Modifier l'objectif
6. Supprimer l'objectif

### **Script de test :**
```bash
node test-goals-module-rls.cjs
```

---

## ⏰ **MODULE TIME TRACKING** - À TESTER

### **Test à effectuer :**
1. Se connecter avec `rokhaya@senegel.org`
2. Aller dans le module Time Tracking
3. Créer un nouveau time log
4. Vérifier qu'il apparaît dans la liste
5. Modifier le time log
6. Supprimer le time log

### **Script de test :**
```bash
node test-time-tracking-module-rls.cjs
```

---

## 🏖️ **MODULE LEAVE MANAGEMENT** - À TESTER

### **Test à effectuer :**
1. Se connecter avec `rokhaya@senegel.org`
2. Aller dans le module Leave Management
3. Créer une nouvelle demande de congé
4. Vérifier qu'elle apparaît dans la liste
5. Modifier la demande
6. Supprimer la demande

### **Script de test :**
```bash
node test-leave-management-module-rls.cjs
```

---

## 💰 **MODULE FINANCE** - À TESTER

### **Test à effectuer :**
1. Se connecter avec `rokhaya@senegel.org`
2. Aller dans le module Finance
3. Créer un nouveau budget
4. Créer une nouvelle dépense
5. Créer une nouvelle facture
6. Vérifier que toutes les données apparaissent
7. Modifier et supprimer les données

### **Script de test :**
```bash
node test-finance-module-rls.cjs
```

---

## 📊 **MODULES CRM ET ANALYTICS** - À TESTER

### **Test à effectuer :**
1. Se connecter avec `rokhaya@senegel.org` (Manager)
2. Aller dans le module CRM
3. Créer un nouveau contact
4. Créer un nouveau lead
5. Vérifier que les données apparaissent
6. Tester avec un utilisateur Sales
7. Tester avec un utilisateur sans droits CRM

### **Script de test :**
```bash
node test-crm-analytics-modules-rls.cjs
```

---

## 🔧 **CORRECTIONS APPLIQUÉES**

### **1. Module Projects :**
- ✅ `ProjectsUltraModernV2.tsx` : Suppression du paramètre `user.id` dans `projectService.create()`
- ✅ `supabaseDataService.ts` : Support de `project.ownerId || project.owner_id`
- ✅ `projectService.ts` : Utilisation d'`AuthUtils.getProjectInsertData()`

### **2. Erreurs console non critiques :**
- ⚠️ `cdn.tailwindcss.com should not be used in production` - Avertissement Tailwind
- ⚠️ `Multiple GoTrueClient instances detected` - Avertissement Supabase
- ⚠️ `Gemini API key not found` - Avertissement API Gemini

---

## 🎯 **PROCHAINES ÉTAPES**

### **1. Tester chaque module dans l'application :**
1. **Projects** ✅ - Corrigé et testé
2. **Goals** - À tester
3. **Time Tracking** - À tester
4. **Leave Management** - À tester
5. **Finance** - À tester
6. **CRM & Analytics** - À tester

### **2. Vérifier la persistance :**
- ✅ Création de données
- ✅ Lecture de données
- ✅ Mise à jour de données
- ✅ Suppression de données
- ✅ Isolation entre utilisateurs

### **3. Corriger les erreurs restantes :**
- 🔧 Adapter les autres modules si nécessaire
- 🔧 Vérifier les services de chaque module
- 🔧 Tester l'isolation des données

---

## 🚀 **INSTRUCTIONS DE TEST**

### **Pour tester chaque module :**

1. **Ouvrir l'application** : `http://localhost:5177`
2. **Se connecter** avec `rokhaya@senegel.org` / `Senegel2024!`
3. **Aller dans le module** à tester
4. **Créer des données** (projet, objectif, time log, etc.)
5. **Vérifier la persistance** :
   - Les données apparaissent-elles ?
   - Restent-elles après refresh ?
   - Peut-on les modifier ?
   - Peut-on les supprimer ?
6. **Tester l'isolation** :
   - Se déconnecter
   - Se connecter avec un autre utilisateur
   - Vérifier qu'il ne voit pas les données du premier utilisateur

### **En cas d'erreur :**
- Vérifier la console pour les erreurs 403
- Vérifier que l'`owner_id` ou `user_id` est correct
- Vérifier que les policies RLS sont actives
- Utiliser les scripts de test pour diagnostiquer

---

## ✅ **RÉSULTAT ATTENDU**

**Chaque module doit :**
- ✅ Permettre la création de données
- ✅ Afficher les données créées
- ✅ Permettre la modification des données
- ✅ Permettre la suppression des données
- ✅ Maintenir la persistance après refresh
- ✅ Isoler les données entre utilisateurs
- ✅ Respecter les permissions par rôle

**🔒 Le système doit être sécurisé, persistant et fonctionnel !**
