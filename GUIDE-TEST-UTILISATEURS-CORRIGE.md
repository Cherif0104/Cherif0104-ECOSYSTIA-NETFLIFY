# 🧪 GUIDE DE TEST - UTILISATEURS CORRIGÉS

## 🔐 **Informations de connexion mises à jour**

### **Mot de passe universel :** `Senegel2024!`

---

## 👥 **Utilisateurs de test avec accès CRM et Analytics**

### 👑 **Super Administrateurs (Accès Analytics + CRM)**
- **Email :** `admin@senegel.org`
- **Mot de passe :** `Senegel2024!`
- **Rôle :** `super_administrator`
- **Accès :** Tous les modules + Analytics + CRM

- **Email :** `pape@senegel.org`
- **Mot de passe :** `Senegel2024!`
- **Rôle :** `super_administrator`
- **Accès :** Tous les modules + Analytics + CRM

### 👨‍💼 **Managers (Accès CRM)**
- **Email :** `rokhaya@senegel.org`
- **Mot de passe :** `Senegel2024!`
- **Rôle :** `manager`
- **Accès :** Tous les modules + CRM

- **Email :** `lyamadoudia@gmail.com`
- **Mot de passe :** `Senegel2024!`
- **Rôle :** `manager`
- **Accès :** Tous les modules + CRM

- **Email :** `cnyafouna@gmail.com`
- **Mot de passe :** `Senegel2024!`
- **Rôle :** `manager`
- **Accès :** Tous les modules + CRM

### 📊 **Analyst (Accès Analytics)**
- **Email :** `nabyaminatoul08@gmail.com`
- **Mot de passe :** `Senegel2024!`
- **Rôle :** `analyst`
- **Accès :** Tous les modules + Analytics

### 💼 **Sales (Accès CRM)**
- **Email :** `adjadiallo598@gmail.com`
- **Mot de passe :** `Senegel2024!`
- **Rôle :** `sales`
- **Accès :** Tous les modules + CRM

- **Email :** `gningue04@gmail.com`
- **Mot de passe :** `Senegel2024!`
- **Rôle :** `sales`
- **Accès :** Tous les modules + CRM

---

## 🧪 **Tests à effectuer**

### 1. **Test d'authentification**
- [ ] Se connecter avec chaque utilisateur
- [ ] Vérifier que le rôle s'affiche correctement (plus de `(staff)`)
- [ ] Vérifier que la session persiste

### 2. **Test d'accès CRM**
- [ ] Se connecter avec un utilisateur `manager` ou `sales`
- [ ] Vérifier que le module "CRM & Sales" est visible dans la sidebar
- [ ] Cliquer sur "CRM & Sales" et vérifier l'accès

### 3. **Test d'accès Analytics**
- [ ] Se connecter avec un utilisateur `super_administrator` ou `analyst`
- [ ] Vérifier que le module "Analytics" est visible dans la sidebar
- [ ] Cliquer sur "Analytics" et vérifier l'accès

### 4. **Test des modules AI**
- [ ] Se connecter avec n'importe quel utilisateur
- [ ] Aller dans "AI Coach" - vérifier qu'il n'y a plus d'erreur 404
- [ ] Aller dans "Gen AI Lab" - vérifier le fonctionnement
- [ ] Tester la création de sessions et recommandations

### 5. **Test de persistance**
- [ ] Créer des données dans chaque module
- [ ] Rafraîchir la page
- [ ] Vérifier que les données persistent

---

## 🔧 **Corrections apportées**

### ✅ **Problèmes résolus :**
1. **Collection `ai_recommendations` créée** dans Supabase
2. **Comptes d'authentification Supabase créés** avec les bons rôles
3. **IDs utilisateurs synchronisés** entre Supabase Auth et la table `users`
4. **Mots de passe standardisés** : `Senegel2024!`

### 🎯 **Résultats attendus :**
- ✅ Plus d'erreur 404 sur `ai_recommendations`
- ✅ Rôles utilisateurs corrects affichés (plus de `(staff)`)
- ✅ Accès CRM pour les utilisateurs `manager` et `sales`
- ✅ Accès Analytics pour les utilisateurs `super_administrator` et `analyst`
- ✅ Persistance complète de toutes les données

---

## 🚀 **URL de test**

**Local :** `http://localhost:5175/`

**Production :** `https://senegel-workflow.netlify.app/`

---

## 📞 **Support**

En cas de problème, vérifier :
1. Que le serveur de développement est démarré (`npm run dev`)
2. Que la connexion Supabase est active
3. Que les variables d'environnement sont correctes
4. Les logs de la console pour les erreurs
