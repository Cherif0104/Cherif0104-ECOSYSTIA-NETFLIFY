# 🔐 INFORMATIONS UTILISATEURS POUR TESTER ANALYTICS & CRM

## 🎯 Utilisateurs avec Accès aux Modules Analytics et CRM

### 👑 **SUPER ADMINISTRATEUR**
- **Email** : `admin@senegel.org`
- **Nom** : Super Admin
- **Rôle** : `super_admin`
- **Accès** : Tous les modules (Analytics, CRM, etc.)

### 👨‍💼 **ADMINISTRATEUR**
- **Email** : `pape@senegel.org`
- **Nom** : Alioune Badara Pape SAMB
- **Rôle** : `administrator`
- **Accès** : Tous les modules (Analytics, CRM, etc.)

### 👩‍💼 **MANAGERS**
- **Email** : `rokhaya@senegel.org`
- **Nom** : Rokhaya BODIAN
- **Rôle** : `manager`
- **Accès** : Analytics, CRM, Gestion des équipes

- **Email** : `lyamadoudia@gmail.com`
- **Nom** : Amadou Dia LY
- **Rôle** : `manager`
- **Accès** : Analytics, CRM, Gestion des équipes

- **Email** : `cnyafouna@gmail.com`
- **Nom** : Charles NYAFOUNA
- **Rôle** : `manager`
- **Accès** : Analytics, CRM, Gestion des équipes

### 📊 **ANALYSTE**
- **Email** : `nabyaminatoul08@gmail.com`
- **Nom** : Amy DIAGNE
- **Rôle** : `analyst`
- **Accès** : Analytics, Rapports, Tableaux de bord

### 💰 **FINANCE**
- **Email** : `awadiagne1003@gmail.com`
- **Nom** : Awa DIAGNE
- **Rôle** : `finance`
- **Accès** : Analytics financiers, CRM financier

### 💼 **SALES**
- **Email** : `adjadiallo598@gmail.com`
- **Nom** : Adja Mame Sarr DIALLO
- **Rôle** : `sales`
- **Accès** : CRM, Analytics commerciaux

- **Email** : `gningue04@gmail.com`
- **Nom** : Oumar GNINGUE
- **Rôle** : `sales`
- **Accès** : CRM, Analytics commerciaux

---

## 🚀 **INSTRUCTIONS DE TEST**

### 1. **Connexion**
1. Aller sur `http://localhost:5173`
2. Cliquer sur "Se connecter"
3. Utiliser l'un des emails ci-dessus
4. Mot de passe : `Senegel2024!`

### 2. **Test du Module Analytics**
- **URL** : `http://localhost:5173/#/analytics`
- **Utilisateurs recommandés** :
  - `admin@senegel.org` (Super Admin)
  - `pape@senegel.org` (Administrator)
  - `nabyaminatoul08@gmail.com` (Analyst)

### 3. **Test du Module CRM**
- **URL** : `http://localhost:5173/#/crm`
- **Utilisateurs recommandés** :
  - `admin@senegel.org` (Super Admin)
  - `adjadiallo598@gmail.com` (Sales)
  - `rokhaya@senegel.org` (Manager)

---

## 🔍 **FONCTIONNALITÉS À TESTER**

### Analytics
- [ ] Tableaux de bord interactifs
- [ ] Rapports personnalisés
- [ ] Métriques de performance
- [ ] Export des données
- [ ] Filtres avancés

### CRM
- [ ] Gestion des contacts
- [ ] Pipeline de ventes
- [ ] Suivi des opportunités
- [ ] Rapports commerciaux
- [ ] Intégration avec Analytics

---

## ⚠️ **NOTES IMPORTANTES**

1. **Mot de passe commun** : `Senegel2024!` pour tous les utilisateurs
2. **Rôles hiérarchiques** : Super Admin > Admin > Manager > Analyst/Sales/Finance
3. **Accès conditionnel** : Certains modules peuvent nécessiter des permissions spécifiques
4. **Données de test** : Les modules peuvent contenir des données mockées pour les tests

---

## 🐛 **EN CAS DE PROBLÈME**

Si vous rencontrez des erreurs :
1. Vérifier que le serveur est lancé : `npm run dev`
2. Vérifier la console du navigateur pour les erreurs
3. Essayer avec un autre utilisateur du même rôle
4. Contacter l'équipe de développement

---

*Utilisez ces informations pour tester efficacement les modules Analytics et CRM ! 🚀*
