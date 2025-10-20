# 📊 GUIDE CRÉATION COLLECTIONS APPWRITE - ECOSYSTIA

**Date:** Octobre 2025  
**Version:** 1.0.0

---

## 🎯 **COLLECTIONS À CRÉER**

Voici la liste complète des collections à créer dans votre base de données Appwrite (`68e56de100267007af6a`).

### ⚠️ **RÈGLES IMPORTANTES**
- **Pas d'accents** dans les noms de collections
- **Maximum 36 caractères**
- **Caractères autorisés:** a-z, A-Z, 0-9, underscore (_)
- **Ne pas commencer** par un underscore

---

## 📋 **LISTE DES COLLECTIONS**

### **1. users**
**Attributes:**
- `firstName` (string, 255) - required
- `lastName` (string, 255) - required
- `email` (string, 255) - required, unique
- `avatar` (string, 500)
- `role` (string, 50) - required
- `skills` (string, 1000)
- `phone` (string, 20)

### **2. projects**
**Attributes:**
- `name` (string, 255) - required
- `description` (string, 2000)
- `status` (string, 50) - required
- `priority` (string, 50)
- `startDate` (string, 50)
- `endDate` (string, 50)
- `budget` (integer)
- `ownerId` (string, 50) - required
- `teamMembers` (string[], array)
- `progress` (integer)
- `tags` (string[], array)
- `category` (string, 100)

### **3. tasks**
**Attributes:**
- `projectId` (string, 50) - required
- `text` (string, 500) - required
- `status` (string, 50)
- `priority` (string, 50)
- `assigneeId` (string, 50)
- `estimatedTime` (integer)
- `loggedTime` (integer)
- `dueDate` (string, 50)

### **4. courses**
**Attributes:**
- `title` (string, 255) - required
- `description` (string, 2000)
- `instructor` (string, 255) - required
- `duration` (string, 100)
- `level` (string, 50)
- `status` (string, 50)
- `enrolled` (integer)
- `roleId` (string, 100)

### **5. jobs**
**Attributes:**
- `title` (string, 255) - required
- `description` (string, 2000)
- `company` (string, 255)
- `location` (string, 255)
- `salary` (integer)
- `type` (string, 50)
- `status` (string, 50)
- `requirements` (string, 2000)

### **6. invoices**
**Attributes:**
- `invoiceNumber` (string, 100) - required
- `clientName` (string, 255) - required
- `amount` (float) - required
- `dueDate` (string, 50) - required
- `status` (string, 50)
- `recurringSourceId` (integer)

### **7. expenses**
**Attributes:**
- `category` (string, 100) - required
- `description` (string, 500) - required
- `amount` (float) - required
- `date` (string, 50) - required
- `dueDate` (string, 50)
- `status` (string, 50)
- `budgetItemId` (string, 50)
- `recurringSourceId` (integer)

### **8. time_logs**
**Attributes:**
- `userId` (string, 50) - required
- `projectId` (string, 50)
- `courseId` (string, 50)
- `taskId` (string, 50)
- `taskDescription` (string, 500)
- `hours` (float) - required
- `date` (string, 50) - required
- `description` (string, 1000)

### **9. leave_requests**
**Attributes:**
- `userId` (string, 50) - required
- `userName` (string, 255) - required
- `userAvatar` (string, 500)
- `type` (string, 100) - required
- `startDate` (string, 50) - required
- `endDate` (string, 50) - required
- `reason` (string, 1000)
- `status` (string, 50)

### **10. contacts**
**Attributes:**
- `name` (string, 255) - required
- `workEmail` (string, 255)
- `personalEmail` (string, 255)
- `company` (string, 255)
- `status` (string, 50)
- `avatar` (string, 500)
- `officePhone` (string, 20)
- `mobilePhone` (string, 20)
- `whatsappNumber` (string, 20)

### **11. documents**
**Attributes:**
- `title` (string, 255) - required
- `content` (string, 10000) - required
- `createdAt` (string, 50)
- `createdBy` (string, 255)

### **12. risks**
**Attributes:**
- `projectId` (string, 50) - required
- `title` (string, 255) - required
- `description` (string, 1000)
- `impact` (string, 50)
- `probability` (string, 50)
- `mitigationStrategy` (string, 1000)

### **13. objectives**
**Attributes:**
- `projectId` (string, 50)
- `title` (string, 255) - required
- `quarter` (string, 50)
- `status` (string, 50)

### **14. key_results**
**Attributes:**
- `objectiveId` (string, 50) - required
- `title` (string, 255) - required
- `current` (float)
- `target` (float)
- `unit` (string, 50)

### **15. meetings**
**Attributes:**
- `title` (string, 255) - required
- `description` (string, 1000)
- `startTime` (string, 50) - required
- `endTime` (string, 50) - required
- `attendeeIds` (string[], array)
- `location` (string, 255)

### **16. recurring_invoices**
**Attributes:**
- `clientName` (string, 255) - required
- `amount` (float) - required
- `frequency` (string, 50)
- `lastGeneratedDate` (string, 50)
- `endDate` (string, 50)

### **17. recurring_expenses**
**Attributes:**
- `category` (string, 100) - required
- `description` (string, 500) - required
- `amount` (float) - required
- `frequency` (string, 50)
- `lastGeneratedDate` (string, 50)
- `endDate` (string, 50)

### **18. budgets**
**Attributes:**
- `name` (string, 255) - required
- `year` (integer) - required
- `totalBudget` (float) - required

### **19. budget_lines**
**Attributes:**
- `budgetId` (string, 50) - required
- `category` (string, 255) - required
- `allocated` (float) - required

### **20. budget_items**
**Attributes:**
- `budgetLineId` (string, 50) - required
- `name` (string, 255) - required
- `allocated` (float) - required
- `spent` (float)

---

## 🚀 **PROCÉDURE DE CRÉATION**

### **Méthode 1: Via l'Interface Appwrite**

1. **Accéder à la console Appwrite:**
   - URL: https://cloud.appwrite.io/console
   - Se connecter avec vos identifiants

2. **Sélectionner le projet:**
   - Project ID: `68e54e9c002cb568cfec`

3. **Accéder à la base de données:**
   - Database ID: `68e56de100267007af6a`

4. **Pour chaque collection:**
   - Cliquer sur "Create Collection"
   - Entrer le nom (ex: `users`)
   - Créer les attributs selon la liste ci-dessus
   - Définir les permissions appropriées

### **Méthode 2: Via Script (Recommandé)**

Créer un script `setup-collections.js`:

```javascript
import { Client, Databases, ID } from 'appwrite';

const client = new Client()
    .setEndpoint('https://sfo.cloud.appwrite.io/v1')
    .setProject('68e54e9c002cb568cfec')
    .setKey('YOUR_API_KEY'); // Utiliser une clé API avec permissions

const databases = new Databases(client);
const databaseId = '68e56de100267007af6a';

async function createCollections() {
    // Exemple pour la collection users
    try {
        await databases.createCollection(
            databaseId,
            'users',
            'users'
        );
        
        // Créer les attributs
        await databases.createStringAttribute(databaseId, 'users', 'firstName', 255, true);
        await databases.createStringAttribute(databaseId, 'users', 'lastName', 255, true);
        await databases.createStringAttribute(databaseId, 'users', 'email', 255, true);
        // ... autres attributs
        
        console.log('✅ Collection users créée');
    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

createCollections();
```

---

## 🔐 **PERMISSIONS**

Pour chaque collection, définir les permissions:

### **Permissions par défaut:**
- **Read:** `role:all`
- **Create:** `role:member`
- **Update:** `role:member`
- **Delete:** `role:admin`

### **Permissions spéciales:**

#### **users:**
- Read: `role:all`
- Create: `role:admin`
- Update: `role:admin`
- Delete: `role:admin`

#### **projects:**
- Read: `role:member`
- Create: `role:manager`
- Update: `role:manager`
- Delete: `role:manager`

#### **invoices/expenses:**
- Read: `role:member`
- Create: `role:manager`
- Update: `role:manager`
- Delete: `role:admin`

---

## ✅ **VÉRIFICATION**

Après création, vérifier que:
1. ✅ Toutes les collections sont créées
2. ✅ Les attributs correspondent
3. ✅ Les permissions sont configurées
4. ✅ Les index sont créés si nécessaire

---

## 🔧 **COMMANDE DE TEST**

Pour tester la connexion:

```bash
npm run test-appwrite
```

Ou dans le code:

```typescript
import { testConnection } from './services/dataService';

const isConnected = await testConnection();
console.log(isConnected ? '✅ Connecté' : '❌ Échec');
```

---

**🎯 Une fois toutes les collections créées, l'application sera prête pour la production !**


