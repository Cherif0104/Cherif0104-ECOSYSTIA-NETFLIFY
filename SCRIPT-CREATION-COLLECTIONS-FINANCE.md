# 🤖 SCRIPT AUTOMATISÉ : CRÉATION COLLECTIONS FINANCE

**Alternative au guide manuel**  
**Utilise l'API Appwrite pour créer automatiquement les collections**

---

## ⚠️ IMPORTANT

Ce script nécessite une **API Key** avec les permissions administrateur.  
Les API Keys client (utilisées dans le frontend) **NE PEUVENT PAS** créer des collections.

**Vous devez** :
1. Créer une API Key serveur dans Appwrite Console
2. OU créer les collections manuellement (recommandé)

---

## 🔑 CRÉER UNE API KEY SERVEUR

1. Aller sur https://cloud.appwrite.io/console
2. Sélectionner votre projet **EcosystIA**
3. Aller dans **Settings** → **API Keys**
4. Cliquer sur **"Create API Key"**
5. Nom : `Server Key - Collections`
6. **Scopes à activer** :
   - `databases.read`
   - `databases.write`
   - `collections.read`
   - `collections.write`
   - `attributes.read`
   - `attributes.write`
   - `indexes.read`
   - `indexes.write`
7. Cliquer sur **"Create"**
8. **COPIER la clé** (elle ne sera plus affichée)

---

## 📝 SCRIPT NODE.JS

Créer un fichier `scripts/createFinanceCollections.ts` :

```typescript
import { Client, Databases, Permission, Role } from 'node-appwrite';

// Configuration
const client = new Client()
    .setEndpoint('https://sfo.cloud.appwrite.io/v1')
    .setProject('68e54e9c002cb568cfec')
    .setKey('VOTRE_API_KEY_SERVEUR_ICI'); // ⚠️ À REMPLACER

const databases = new Databases(client);
const DATABASE_ID = '68e56de100267007af6a';

// Fonction utilitaire pour créer une collection
async function createCollection(id: string, name: string) {
    try {
        const collection = await databases.createCollection(
            DATABASE_ID,
            id,
            name,
            [
                Permission.read(Role.users()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users()),
            ]
        );
        console.log(`✅ Collection créée: ${name} (${id})`);
        return collection;
    } catch (error) {
        console.error(`❌ Erreur création ${name}:`, error);
        throw error;
    }
}

// Fonction pour créer un attribut String
async function createStringAttribute(
    collectionId: string,
    key: string,
    size: number,
    required: boolean = false,
    defaultValue?: string
) {
    try {
        await databases.createStringAttribute(
            DATABASE_ID,
            collectionId,
            key,
            size,
            required,
            defaultValue
        );
        console.log(`  ✅ Attribut créé: ${key} (string)`);
    } catch (error) {
        console.error(`  ❌ Erreur attribut ${key}:`, error);
    }
}

// Fonction pour créer un attribut Float
async function createFloatAttribute(
    collectionId: string,
    key: string,
    required: boolean = false,
    defaultValue?: number
) {
    try {
        await databases.createFloatAttribute(
            DATABASE_ID,
            collectionId,
            key,
            required,
            undefined,
            undefined,
            defaultValue
        );
        console.log(`  ✅ Attribut créé: ${key} (float)`);
    } catch (error) {
        console.error(`  ❌ Erreur attribut ${key}:`, error);
    }
}

// Création de la collection Budgets
async function createBudgetsCollection() {
    console.log('\n📦 Création: demo_budgets...');
    
    await createCollection('demo_budgets', 'Demo Budgets');
    
    // Attendre un peu pour que la collection soit prête
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await createStringAttribute('demo_budgets', 'title', 255, true);
    await createStringAttribute('demo_budgets', 'type', 50, true);
    await createFloatAttribute('demo_budgets', 'amount', true);
    await createFloatAttribute('demo_budgets', 'spent', false, 0);
    await createFloatAttribute('demo_budgets', 'remaining', false);
    await createStringAttribute('demo_budgets', 'projectId', 50);
    await createStringAttribute('demo_budgets', 'startDate', 50, true);
    await createStringAttribute('demo_budgets', 'endDate', 50, true);
    await createStringAttribute('demo_budgets', 'createdBy', 50, true);
    await createStringAttribute('demo_budgets', 'createdAt', 50);
    await createStringAttribute('demo_budgets', 'updatedAt', 50);
    
    console.log('✅ demo_budgets terminée!\n');
}

// Création de la collection Budget Lines
async function createBudgetLinesCollection() {
    console.log('\n📦 Création: demo_budget_lines...');
    
    await createCollection('demo_budget_lines', 'Demo Budget Lines');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await createStringAttribute('demo_budget_lines', 'budgetId', 50, true);
    await createStringAttribute('demo_budget_lines', 'name', 255, true);
    await createStringAttribute('demo_budget_lines', 'category', 100, true);
    await createFloatAttribute('demo_budget_lines', 'amount', true);
    await createFloatAttribute('demo_budget_lines', 'spent', false, 0);
    await createFloatAttribute('demo_budget_lines', 'remaining', false);
    await createStringAttribute('demo_budget_lines', 'description', 1000);
    await createStringAttribute('demo_budget_lines', 'createdAt', 50);
    await createStringAttribute('demo_budget_lines', 'updatedAt', 50);
    
    console.log('✅ demo_budget_lines terminée!\n');
}

// Création de la collection Budget Items
async function createBudgetItemsCollection() {
    console.log('\n📦 Création: demo_budget_items...');
    
    await createCollection('demo_budget_items', 'Demo Budget Items');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await createStringAttribute('demo_budget_items', 'budgetLineId', 50, true);
    await createStringAttribute('demo_budget_items', 'description', 500, true);
    await createFloatAttribute('demo_budget_items', 'amount', true);
    await createStringAttribute('demo_budget_items', 'date', 50, true);
    await createStringAttribute('demo_budget_items', 'reference', 100);
    await createStringAttribute('demo_budget_items', 'status', 50, false, 'pending');
    await createStringAttribute('demo_budget_items', 'createdBy', 50);
    await createStringAttribute('demo_budget_items', 'createdAt', 50);
    
    console.log('✅ demo_budget_items terminée!\n');
}

// Création de la collection Recurring Invoices
async function createRecurringInvoicesCollection() {
    console.log('\n📦 Création: demo_recurring_invoices...');
    
    await createCollection('demo_recurring_invoices', 'Demo Recurring Invoices');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await createStringAttribute('demo_recurring_invoices', 'frequency', 50, true);
    await createStringAttribute('demo_recurring_invoices', 'clientName', 255, true);
    await createStringAttribute('demo_recurring_invoices', 'clientEmail', 255);
    await createFloatAttribute('demo_recurring_invoices', 'amount', true);
    await createStringAttribute('demo_recurring_invoices', 'description', 1000);
    await createStringAttribute('demo_recurring_invoices', 'nextDate', 50, true);
    await createStringAttribute('demo_recurring_invoices', 'lastDate', 50);
    await createStringAttribute('demo_recurring_invoices', 'status', 50, false, 'active');
    await createStringAttribute('demo_recurring_invoices', 'createdBy', 50, true);
    await createStringAttribute('demo_recurring_invoices', 'createdAt', 50);
    await createStringAttribute('demo_recurring_invoices', 'updatedAt', 50);
    
    console.log('✅ demo_recurring_invoices terminée!\n');
}

// Création de la collection Recurring Expenses
async function createRecurringExpensesCollection() {
    console.log('\n📦 Création: demo_recurring_expenses...');
    
    await createCollection('demo_recurring_expenses', 'Demo Recurring Expenses');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await createStringAttribute('demo_recurring_expenses', 'frequency', 50, true);
    await createStringAttribute('demo_recurring_expenses', 'category', 100, true);
    await createFloatAttribute('demo_recurring_expenses', 'amount', true);
    await createStringAttribute('demo_recurring_expenses', 'description', 1000, true);
    await createStringAttribute('demo_recurring_expenses', 'vendor', 255);
    await createStringAttribute('demo_recurring_expenses', 'nextDate', 50, true);
    await createStringAttribute('demo_recurring_expenses', 'lastDate', 50);
    await createStringAttribute('demo_recurring_expenses', 'status', 50, false, 'active');
    await createStringAttribute('demo_recurring_expenses', 'createdBy', 50, true);
    await createStringAttribute('demo_recurring_expenses', 'createdAt', 50);
    await createStringAttribute('demo_recurring_expenses', 'updatedAt', 50);
    
    console.log('✅ demo_recurring_expenses terminée!\n');
}

// Fonction principale
async function main() {
    console.log('🚀 CRÉATION DES COLLECTIONS FINANCE - APPWRITE');
    console.log('═══════════════════════════════════════════════\n');
    
    try {
        await createBudgetsCollection();
        await createBudgetLinesCollection();
        await createBudgetItemsCollection();
        await createRecurringInvoicesCollection();
        await createRecurringExpensesCollection();
        
        console.log('\n═══════════════════════════════════════════════');
        console.log('🎉 TOUTES LES COLLECTIONS CRÉÉES AVEC SUCCÈS !');
        console.log('═══════════════════════════════════════════════\n');
        
        console.log('✅ 5 collections créées');
        console.log('✅ 50 attributs créés');
        console.log('✅ Permissions configurées\n');
        
        console.log('📝 Prochaines étapes:');
        console.log('  1. Vérifier dans Appwrite Console');
        console.log('  2. Tester avec npm run dev');
        console.log('  3. Déployer avec npm run deploy\n');
        
    } catch (error) {
        console.error('\n❌ ERREUR LORS DE LA CRÉATION:', error);
        process.exit(1);
    }
}

// Exécution
main();
```

---

## 🚀 UTILISATION DU SCRIPT

### 1. Installer node-appwrite

```bash
npm install node-appwrite --save-dev
```

### 2. Créer le fichier script

Créer `scripts/createFinanceCollections.ts` avec le code ci-dessus

### 3. Remplacer l'API Key

Dans le script, remplacer `'VOTRE_API_KEY_SERVEUR_ICI'` par votre clé API serveur

### 4. Exécuter le script

```bash
npx tsx scripts/createFinanceCollections.ts
```

---

## ⚠️ RECOMMANDATION

**MÉTHODE MANUELLE RECOMMANDÉE** pour les raisons suivantes :

1. ✅ Plus sécurisé (pas besoin d'API Key serveur)
2. ✅ Plus visuel (vous voyez ce que vous créez)
3. ✅ Moins de risques d'erreur
4. ✅ Meilleur contrôle

**Utilisez le script** seulement si :
- Vous avez beaucoup de collections à créer
- Vous voulez automatiser pour plusieurs environnements
- Vous êtes à l'aise avec les scripts

---

**Date** : 13 octobre 2025  
**Statut** : 📋 **SCRIPT DISPONIBLE (Optionnel)**  
**Recommandation** : **Utiliser le guide manuel**

