# 🚀 GUIDE RAPIDE : CRÉER LES COLLECTIONS APPWRITE

## ⏱️ Temps estimé : 10-15 minutes

---

## 📋 **COLLECTIONS À CRÉER**

Allez dans votre console Appwrite → Base de données → **Créer une collection** pour chacune:

### **1. demo_projects** ⭐ (PRIORITAIRE)
- **ID** : `demo_projects`
- **Nom** : `Demo Projects`
- **Attributs** :
  - `name` (string, 255, requis)
  - `description` (string, 2000)
  - `status` (string, 50, requis)
  - `priority` (string, 50)
  - `startDate` (string, 50)
  - `endDate` (string, 50)
  - `budget` (float)
  - `ownerId` (string, 50, requis)
  - `progress` (integer)

### **2. demo_users**
- **ID** : `demo_users`
- **Nom** : `Demo Users`
- **Attributs** :
  - `firstName` (string, 100, requis)
  - `lastName` (string, 100, requis)
  - `email` (email, 255, requis)
  - `role` (string, 50, requis)
  - `avatar` (url, 500)
  - `phone` (string, 20)

### **3. demo_tasks**
- **ID** : `demo_tasks`
- **Nom** : `Demo Tasks`
- **Attributs** :
  - `projectId` (string, 50, requis)
  - `text` (string, 500, requis)
  - `status` (string, 50)
  - `priority` (string, 50)
  - `assigneeId` (string, 50)
  - `dueDate` (string, 50)

### **4. demo_invoices**
- **ID** : `demo_invoices`
- **Nom** : `Demo Invoices`
- **Attributs** :
  - `invoiceNumber` (string, 100, requis)
  - `clientName` (string, 255, requis)
  - `amount` (float, requis)
  - `dueDate` (string, 50, requis)
  - `status` (string, 50)

### **5. demo_expenses**
- **ID** : `demo_expenses`
- **Nom** : `Demo Expenses`
- **Attributs** :
  - `category` (string, 100, requis)
  - `description` (string, 500, requis)
  - `amount` (float, requis)
  - `date` (string, 50, requis)
  - `status` (string, 50)

### **6. demo_time_logs**
- **ID** : `demo_time_logs`
- **Nom** : `Demo Time Logs`
- **Attributs** :
  - `userId` (string, 50, requis)
  - `projectId` (string, 50)
  - `taskId` (string, 50)
  - `hours` (float, requis)
  - `date` (string, 50, requis)
  - `description` (string, 1000)

### **7. demo_leave_requests**
- **ID** : `demo_leave_requests`
- **Nom** : `Demo Leave Requests`
- **Attributs** :
  - `userId` (string, 50, requis)
  - `type` (string, 100, requis)
  - `startDate` (string, 50, requis)
  - `endDate` (string, 50, requis)
  - `reason` (string, 1000)
  - `status` (string, 50)

---

## ✅ **APRÈS CRÉATION**

1. Relancez l'application : `npm run dev`
2. Créez un projet
3. Rafraîchissez la page (F5)
4. **✅ Le projet devrait RESTER !**

---

## 🎯 **COLLECTIONS OPTIONNELLES (PLUS TARD)**

- `demo_courses`
- `demo_jobs`
- `demo_contacts`
- `demo_documents`
- `demo_risks`
- `demo_notifications`

---

**🚀 COMMENCEZ PAR `demo_projects` POUR TESTER LA PERSISTANCE !**

