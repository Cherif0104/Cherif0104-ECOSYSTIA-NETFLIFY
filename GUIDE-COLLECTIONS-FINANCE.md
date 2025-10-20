# 📋 GUIDE : CRÉER LES COLLECTIONS FINANCE - APPWRITE

**Date** : 13 octobre 2025  
**Objectif** : Créer 5 collections pour le module Finance avancé  
**Durée estimée** : 15-20 minutes

---

## 🎯 COLLECTIONS À CRÉER

1. ✅ `demo_budgets` - Budgets de projets/bureaux
2. ✅ `demo_budget_lines` - Lignes de budget
3. ✅ `demo_budget_items` - Items de budget détaillés
4. ✅ `demo_recurring_invoices` - Factures récurrentes
5. ✅ `demo_recurring_expenses` - Dépenses récurrentes

---

## 🚀 ACCÈS À APPWRITE CONSOLE

### Étape 1 : Se connecter

1. Ouvrir : **https://cloud.appwrite.io/console**
2. Se connecter avec votre compte
3. Sélectionner le projet : **EcosystIA** (`68e54e9c002cb568cfec`)
4. Aller dans **Databases**
5. Sélectionner la base de données : **EcosystIA** (`68e56de100267007af6a`)

---

## 📦 COLLECTION 1 : BUDGETS

### Informations de base

- **ID de la collection** : `demo_budgets`
- **Nom** : `Demo Budgets`

### Attributs à créer

| Nom | Type | Taille | Requis | Par défaut | Description |
|-----|------|--------|--------|------------|-------------|
| `title` | String | 255 | ✅ Oui | - | Nom du budget |
| `type` | String | 50 | ✅ Oui | - | "Project" ou "Office" |
| `amount` | Float | - | ✅ Oui | - | Montant total alloué |
| `spent` | Float | - | ❌ Non | 0 | Montant dépensé |
| `remaining` | Float | - | ❌ Non | - | Montant restant |
| `projectId` | String | 50 | ❌ Non | - | ID du projet (si type=Project) |
| `startDate` | String | 50 | ✅ Oui | - | Date de début (ISO 8601) |
| `endDate` | String | 50 | ✅ Oui | - | Date de fin (ISO 8601) |
| `createdBy` | String | 50 | ✅ Oui | - | ID de l'utilisateur créateur |
| `createdAt` | String | 50 | ❌ Non | - | Date de création |
| `updatedAt` | String | 50 | ❌ Non | - | Date de mise à jour |

### Permissions

**Create** : 
- Role: `users` (tous les utilisateurs authentifiés)

**Read** :
- Role: `users`

**Update** :
- Role: `users`

**Delete** :
- Role: `users`

### Index (optionnel mais recommandé)

1. **Index par type**
   - Nom : `type_index`
   - Type : Key
   - Attributs : `type` (ASC)

2. **Index par projet**
   - Nom : `project_index`
   - Type : Key
   - Attributs : `projectId` (ASC)

---

## 📦 COLLECTION 2 : BUDGET LINES (Lignes de budget)

### Informations de base

- **ID de la collection** : `demo_budget_lines`
- **Nom** : `Demo Budget Lines`

### Attributs à créer

| Nom | Type | Taille | Requis | Par défaut | Description |
|-----|------|--------|--------|------------|-------------|
| `budgetId` | String | 50 | ✅ Oui | - | ID du budget parent |
| `name` | String | 255 | ✅ Oui | - | Nom de la ligne budgétaire |
| `category` | String | 100 | ✅ Oui | - | Catégorie (ex: "Personnel", "Marketing") |
| `amount` | Float | - | ✅ Oui | - | Montant alloué |
| `spent` | Float | - | ❌ Non | 0 | Montant dépensé |
| `remaining` | Float | - | ❌ Non | - | Montant restant |
| `description` | String | 1000 | ❌ Non | - | Description détaillée |
| `createdAt` | String | 50 | ❌ Non | - | Date de création |
| `updatedAt` | String | 50 | ❌ Non | - | Date de mise à jour |

### Permissions

**Create/Read/Update/Delete** : 
- Role: `users`

### Index

1. **Index par budget**
   - Nom : `budget_index`
   - Type : Key
   - Attributs : `budgetId` (ASC)

---

## 📦 COLLECTION 3 : BUDGET ITEMS (Items de budget)

### Informations de base

- **ID de la collection** : `demo_budget_items`
- **Nom** : `Demo Budget Items`

### Attributs à créer

| Nom | Type | Taille | Requis | Par défaut | Description |
|-----|------|--------|--------|------------|-------------|
| `budgetLineId` | String | 50 | ✅ Oui | - | ID de la ligne budgétaire |
| `description` | String | 500 | ✅ Oui | - | Description de l'item |
| `amount` | Float | - | ✅ Oui | - | Montant de l'item |
| `date` | String | 50 | ✅ Oui | - | Date de la dépense |
| `reference` | String | 100 | ❌ Non | - | Référence (facture, bon de commande) |
| `status` | String | 50 | ❌ Non | "pending" | Statut (pending, approved, rejected) |
| `createdBy` | String | 50 | ❌ Non | - | ID de l'utilisateur |
| `createdAt` | String | 50 | ❌ Non | - | Date de création |

### Permissions

**Create/Read/Update/Delete** : 
- Role: `users`

### Index

1. **Index par ligne budgétaire**
   - Nom : `budget_line_index`
   - Type : Key
   - Attributs : `budgetLineId` (ASC)

---

## 📦 COLLECTION 4 : RECURRING INVOICES (Factures récurrentes)

### Informations de base

- **ID de la collection** : `demo_recurring_invoices`
- **Nom** : `Demo Recurring Invoices`

### Attributs à créer

| Nom | Type | Taille | Requis | Par défaut | Description |
|-----|------|--------|--------|------------|-------------|
| `frequency` | String | 50 | ✅ Oui | - | Fréquence (monthly, quarterly, yearly) |
| `clientName` | String | 255 | ✅ Oui | - | Nom du client |
| `clientEmail` | String | 255 | ❌ Non | - | Email du client |
| `amount` | Float | - | ✅ Oui | - | Montant de la facture |
| `description` | String | 1000 | ❌ Non | - | Description |
| `nextDate` | String | 50 | ✅ Oui | - | Prochaine date de facturation |
| `lastDate` | String | 50 | ❌ Non | - | Dernière date de facturation |
| `status` | String | 50 | ❌ Non | "active" | Statut (active, paused, cancelled) |
| `createdBy` | String | 50 | ✅ Oui | - | ID de l'utilisateur créateur |
| `createdAt` | String | 50 | ❌ Non | - | Date de création |
| `updatedAt` | String | 50 | ❌ Non | - | Date de mise à jour |

### Permissions

**Create/Read/Update/Delete** : 
- Role: `users`

### Index

1. **Index par statut**
   - Nom : `status_index`
   - Type : Key
   - Attributs : `status` (ASC)

2. **Index par prochaine date**
   - Nom : `next_date_index`
   - Type : Key
   - Attributs : `nextDate` (ASC)

---

## 📦 COLLECTION 5 : RECURRING EXPENSES (Dépenses récurrentes)

### Informations de base

- **ID de la collection** : `demo_recurring_expenses`
- **Nom** : `Demo Recurring Expenses`

### Attributs à créer

| Nom | Type | Taille | Requis | Par défaut | Description |
|-----|------|--------|--------|------------|-------------|
| `frequency` | String | 50 | ✅ Oui | - | Fréquence (monthly, quarterly, yearly) |
| `category` | String | 100 | ✅ Oui | - | Catégorie de dépense |
| `amount` | Float | - | ✅ Oui | - | Montant de la dépense |
| `description` | String | 1000 | ✅ Oui | - | Description |
| `vendor` | String | 255 | ❌ Non | - | Fournisseur |
| `nextDate` | String | 50 | ✅ Oui | - | Prochaine date de paiement |
| `lastDate` | String | 50 | ❌ Non | - | Dernière date de paiement |
| `status` | String | 50 | ❌ Non | "active" | Statut (active, paused, cancelled) |
| `createdBy` | String | 50 | ✅ Oui | - | ID de l'utilisateur créateur |
| `createdAt` | String | 50 | ❌ Non | - | Date de création |
| `updatedAt` | String | 50 | ❌ Non | - | Date de mise à jour |

### Permissions

**Create/Read/Update/Delete** : 
- Role: `users`

### Index

1. **Index par catégorie**
   - Nom : `category_index`
   - Type : Key
   - Attributs : `category` (ASC)

2. **Index par statut**
   - Nom : `status_index`
   - Type : Key
   - Attributs : `status` (ASC)

---

## 📝 PROCÉDURE PAS À PAS

### Pour chaque collection :

1. **Créer la collection**
   - Dans Appwrite Console → Databases → Votre base de données
   - Cliquer sur **"Create Collection"**
   - Entrer l'**ID** (ex: `demo_budgets`)
   - Entrer le **Nom** (ex: `Demo Budgets`)
   - Cliquer sur **"Create"**

2. **Ajouter les attributs**
   - Dans la collection créée, aller dans l'onglet **"Attributes"**
   - Cliquer sur **"Create Attribute"**
   - Pour chaque attribut :
     - Sélectionner le **Type** (String, Float, etc.)
     - Entrer le **Key** (nom de l'attribut)
     - Définir la **Size** (pour les String)
     - Cocher **"Required"** si nécessaire
     - Définir **"Default Value"** si nécessaire
     - Cliquer sur **"Create"**

3. **Configurer les permissions**
   - Aller dans l'onglet **"Settings"**
   - Scroller jusqu'à **"Permissions"**
   - Cliquer sur **"Update Permissions"**
   - Pour chaque permission (Create, Read, Update, Delete) :
     - Cliquer sur **"Add a role"**
     - Sélectionner **"Any"** → **"Users"** (tous les utilisateurs authentifiés)
     - Cliquer sur **"Add"**
   - Cliquer sur **"Update"**

4. **Créer les index (optionnel)**
   - Aller dans l'onglet **"Indexes"**
   - Cliquer sur **"Create Index"**
   - Suivre les spécifications ci-dessus

---

## ✅ CHECKLIST DE VALIDATION

### Après création de toutes les collections

- [ ] 5 collections créées dans Appwrite
- [ ] Tous les attributs ajoutés pour chaque collection
- [ ] Permissions configurées (users : Create, Read, Update, Delete)
- [ ] Index créés (recommandé)
- [ ] Tester avec l'application

### Test rapide

```typescript
// Tester dans la console du navigateur (après connexion)
import { budgetService } from './services/financeService';

const testBudget = await budgetService.create({
  title: "Test Budget",
  type: "Office",
  amount: 10000,
  startDate: "2025-10-01",
  endDate: "2025-12-31"
}, "user_id_test");

console.log('✅ Budget créé:', testBudget);
```

---

## 🎯 ORDRE DE CRÉATION RECOMMANDÉ

1. **En premier** : `demo_budgets` (prioritaire)
2. **Ensuite** : `demo_budget_lines`
3. **Puis** : `demo_budget_items`
4. **Ensuite** : `demo_recurring_invoices`
5. **Enfin** : `demo_recurring_expenses`

---

## 🆘 PROBLÈMES COURANTS

### Problème 1 : Erreur "Invalid collection ID"

**Cause** : ID contient des caractères interdits  
**Solution** : Utiliser uniquement `a-z`, `A-Z`, `0-9`, `_` (underscore)

### Problème 2 : Erreur "Attribute already exists"

**Cause** : Attribut déjà créé  
**Solution** : Vérifier la liste des attributs existants

### Problème 3 : Permissions non appliquées

**Cause** : Permissions non sauvegardées  
**Solution** : Vérifier que vous avez cliqué sur "Update" après ajout des rôles

---

## 📊 RÉCAPITULATIF

### Collections Finance

| Collection | Attributs | Index | Utilisation |
|-----------|-----------|-------|-------------|
| `demo_budgets` | 11 | 2 | Budgets principaux |
| `demo_budget_lines` | 9 | 1 | Lignes budgétaires |
| `demo_budget_items` | 8 | 1 | Items détaillés |
| `demo_recurring_invoices` | 11 | 2 | Factures auto |
| `demo_recurring_expenses` | 11 | 2 | Dépenses auto |
| **TOTAL** | **50 attributs** | **8 index** | **Module Finance complet** |

---

## 🚀 APRÈS CRÉATION

Une fois toutes les collections créées :

1. ✅ **Vérifier** que les services fonctionnent :
   ```bash
   npm run dev
   ```

2. ✅ **Tester** la création d'un budget :
   - Ouvrir l'app
   - Aller dans Finance
   - Créer un budget
   - Refresh (F5)
   - ✅ Budget présent

3. ✅ **Déployer** :
   ```bash
   npm run build
   npm run deploy
   ```

---

## 🎉 FÉLICITATIONS !

Une fois ces 5 collections créées, votre **module Finance sera 100% fonctionnel** avec :

- ✅ Gestion des budgets complète
- ✅ Suivi détaillé des dépenses
- ✅ Factures et dépenses récurrentes
- ✅ Calculs automatiques
- ✅ Persistance totale dans Appwrite

---

**Date** : 13 octobre 2025  
**Statut** : 📋 **GUIDE PRÊT - À EXÉCUTER**  
**Durée estimée** : 15-20 minutes  
**Difficulté** : ⭐⭐ (Moyenne)

