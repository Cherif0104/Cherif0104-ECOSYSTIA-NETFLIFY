# 📋 GUIDE : CRÉATION MANUELLE DES COLLECTIONS APPWRITE

> **Temps estimé:** 15-20 minutes  
> **Difficulté:** Facile

---

## 🎯 **POURQUOI CE GUIDE ?**

L'API Key Appwrite fonctionne uniquement avec le SDK serveur (`node-appwrite`). Pour activer rapidement la persistance, nous allons créer les collections **manuellement** via l'interface Appwrite.

---

## 📝 **COLLECTIONS À CRÉER**

### **1️⃣ Collection: `projects`**

#### **Créer la collection:**
- ID: `projects`
- Nom: `Projects`
- Permissions: 
  - Read: `role:all`
  - Create/Update: `role:member`
  - Delete: `role:admin`

#### **Attributs à ajouter:**

| Nom | Type | Taille | Requis | Par défaut |
|-----|------|--------|--------|------------|
| name | string | 255 | ✅ Oui | - |
| description | string | 2000 | ❌ Non | - |
| status | string | 50 | ✅ Oui | - |
| priority | string | 50 | ❌ Non | - |
| startDate | string | 50 | ❌ Non | - |
| endDate | string | 50 | ❌ Non | - |
| budget | float | - | ❌ Non | - |
| ownerId | string | 50 | ✅ Oui | - |
| teamMembers | string array | 50 | ❌ Non | - |
| progress | integer | - | ❌ Non | - |
| tags | string array | 100 | ❌ Non | - |
| category | string | 100 | ❌ Non | - |

---

### **2️⃣ Collection: `tasks`**

#### **Créer la collection:**
- ID: `tasks`
- Nom: `Tasks`

#### **Attributs à ajouter:**

| Nom | Type | Taille | Requis |
|-----|------|--------|--------|
| projectId | string | 50 | ✅ Oui |
| text | string | 500 | ✅ Oui |
| status | string | 50 | ❌ Non |
| priority | string | 50 | ❌ Non |
| assigneeId | string | 50 | ❌ Non |
| estimatedTime | float | - | ❌ Non |
| loggedTime | float | - | ❌ Non |
| dueDate | string | 50 | ❌ Non |

---

### **3️⃣ Collection: `risks`**

#### **Créer la collection:**
- ID: `risks`
- Nom: `Risks`

#### **Attributs à ajouter:**

| Nom | Type | Taille | Requis |
|-----|------|--------|--------|
| projectId | string | 50 | ✅ Oui |
| title | string | 255 | ✅ Oui |
| description | string | 1000 | ❌ Non |
| impact | string | 50 | ❌ Non |
| probability | string | 50 | ❌ Non |
| mitigationStrategy | string | 1000 | ❌ Non |

---

### **4️⃣ Collection: `invoices`**

#### **Attributs:**

| Nom | Type | Taille | Requis |
|-----|------|--------|--------|
| invoiceNumber | string | 100 | ✅ Oui |
| clientName | string | 255 | ✅ Oui |
| amount | float | - | ✅ Oui |
| dueDate | string | 50 | ✅ Oui |
| status | string | 50 | ❌ Non |
| recurringSourceId | integer | - | ❌ Non |

---

### **5️⃣ Collection: `expenses`**

#### **Attributs:**

| Nom | Type | Taille | Requis |
|-----|------|--------|--------|
| category | string | 100 | ✅ Oui |
| description | string | 500 | ✅ Oui |
| amount | float | - | ✅ Oui |
| date | string | 50 | ✅ Oui |
| dueDate | string | 50 | ❌ Non |
| status | string | 50 | ❌ Non |
| budgetItemId | string | 50 | ❌ Non |
| recurringSourceId | integer | - | ❌ Non |

---

### **6️⃣ Collection: `time_logs`**

#### **Attributs:**

| Nom | Type | Taille | Requis |
|-----|------|--------|--------|
| userId | string | 50 | ✅ Oui |
| projectId | string | 50 | ❌ Non |
| courseId | string | 50 | ❌ Non |
| taskId | string | 50 | ❌ Non |
| taskDescription | string | 500 | ❌ Non |
| hours | float | - | ✅ Oui |
| date | string | 50 | ✅ Oui |
| description | string | 1000 | ❌ Non |

---

### **7️⃣ Collection: `leave_requests`**

#### **Attributs:**

| Nom | Type | Taille | Requis |
|-----|------|--------|--------|
| userId | string | 50 | ✅ Oui |
| userName | string | 255 | ✅ Oui |
| userAvatar | url | 500 | ❌ Non |
| type | string | 100 | ✅ Oui |
| startDate | string | 50 | ✅ Oui |
| endDate | string | 50 | ✅ Oui |
| reason | string | 1000 | ❌ Non |
| status | string | 50 | ❌ Non |

---

### **8️⃣ Collection: `contacts`**

#### **Attributs:**

| Nom | Type | Taille | Requis |
|-----|------|--------|--------|
| name | string | 255 | ✅ Oui |
| workEmail | email | 255 | ❌ Non |
| personalEmail | email | 255 | ❌ Non |
| company | string | 255 | ❌ Non |
| status | string | 50 | ❌ Non |
| avatar | url | 500 | ❌ Non |
| officePhone | string | 20 | ❌ Non |
| mobilePhone | string | 20 | ❌ Non |
| whatsappNumber | string | 20 | ❌ Non |

---

## ✅ **VÉRIFICATION**

Après avoir créé toutes les collections:

1. Allez dans Appwrite Console
2. Naviguez vers votre base de données `68e56de100267007af6a`
3. Vérifiez que vous avez au minimum ces collections:
   - ✅ projects
   - ✅ tasks  
   - ✅ risks
   - ✅ invoices
   - ✅ expenses
   - ✅ time_logs
   - ✅ leave_requests
   - ✅ contacts

---

## 🚀 **APRÈS LA CRÉATION**

Une fois les collections créées:

1. **Redémarrez l'application:**
   ```bash
   npm run dev
   ```

2. **Testez la persistance:**
   - Créez un projet
   - Rafraîchissez la page (F5)
   - ✅ Le projet devrait toujours être là !

---

## 💡 **ALTERNATIVE RAPIDE**

**IMPORTANT:** Les collections principales (`projects`, `users`, etc.) **existent déjà** dans votre base de données Appwrite ! 

Vous pouvez vérifier dans votre console Appwrite que ces collections sont déjà créées. Il suffit de :

1. **Mettre à jour `services/appwriteService.ts`** avec les bons IDs de collections
2. **Tester la connexion**

Voulez-vous que je vérifie les collections existantes et mette à jour le code pour les utiliser ?

