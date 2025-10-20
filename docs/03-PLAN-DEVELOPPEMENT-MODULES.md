# PLAN DE DÉVELOPPEMENT PAR MODULE - Ecosystia
## Spécifications Détaillées des Fonctionnalités
**Date:** 12 Octobre 2025

---

## 4. PLAN DE DÉVELOPPEMENT PAR MODULE

### MODULE 1: DASHBOARD

#### 4.1.1 Objectif
Afficher une vue d'ensemble personnalisée selon le rôle avec données temps réel depuis Appwrite.

#### 4.1.2 Fonctionnalités à Implémenter

**A. Chargement des Données**
- **Fonction:** `loadDashboardData()`
- **Traitement:**
  1. Fetch user profile from Appwrite
  2. Fetch projects where user is team member
  3. Fetch courses enrolled
  4. Fetch user's time logs (last 7 days)
  5. If manager: fetch team leave requests
  6. If manager: fetch financial summary
- **Requêtes Appwrite:**
  ```typescript
  const projects = await databases.listDocuments(
    DATABASE_ID,
    'projects',
    [Query.equal('team_ids', user.$id)]
  );
  ```

**B. Boutons et Actions**

| Bouton | Position | Rôle | Action | Requête API |
|--------|----------|------|--------|-------------|
| "View All Projects" | Section Projects | Tous | Navigation vers /projects | - |
| "View All Courses" | Section Courses | Tous | Navigation vers /courses | - |
| "View All Jobs" | Section Jobs | student, entrepreneur | Navigation vers /jobs | - |
| "Export Time Report" | Section Time | Tous | Génération Excel timesheet | Fetch time_logs (période) |
| "Approve Request" | Leave Requests | manager+ | Update leave_request status | `databases.updateDocument()` |
| "Reject Request" | Leave Requests | manager+ | Update leave_request status | `databases.updateDocument()` |

**C. Bouton Export - Spécifications Détaillées**

**Bouton:** "Export Time Report"
- **Type:** Button primary
- **Position:** Fin de section "Time Summary"
- **Icône:** `<i className="fas fa-file-excel"></i>`
- **Texte:** "Export Time Report"

**Traitement au Clic:**
```typescript
const handleExportTimeReport = async () => {
  // 1. Afficher loader
  setIsExporting(true);
  
  try {
    // 2. Fetch time logs de l'utilisateur
    const timeLogs = await databases.listDocuments(
      DATABASE_ID,
      'time_logs',
      [
        Query.equal('user_id', user.$id),
        Query.orderDesc('date'),
        Query.limit(1000)
      ]
    );
    
    // 3. Préparer données pour Excel
    const dataForExcel = timeLogs.documents.map(log => ({
      'Date': new Date(log.date).toLocaleDateString(),
      'Entity Type': log.entity_type,
      'Entity': log.entity_title,
      'Duration (hours)': (log.duration / 60).toFixed(2),
      'Description': log.description
    }));
    
    // 4. Générer fichier Excel
    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Time Logs");
    
    // 5. Télécharger
    XLSX.writeFile(workbook, `time_report_${user.name}_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    // 6. Afficher toast de succès
    showToast('Time report exported successfully!', 'success');
    
  } catch (error) {
    console.error('Export error:', error);
    showToast('Failed to export time report', 'error');
  } finally {
    setIsExporting(false);
  }
};
```

#### 4.1.3 Fichiers à Modifier
- `components/Dashboard.tsx` - Remplacer props mockées par hooks Appwrite
- `services/appwriteService.ts` - Créer fonctions fetch dashboard data
- Ajouter bibliothèque `xlsx`

---

### MODULE 2: PROJECTS (Gestion de Projets)

#### 4.2.1 Objectif
CRUD complet de projets avec persistance Appwrite + exports PDF.

#### 4.2.2 Fonctionnalités à Implémenter

**A. Liste des Projets**

**Fonction:** `loadProjects()`
- **Traitement:**
  1. Fetch projects where user has access (team member or manager)
  2. For each project, count tasks, risks
  3. Display in grid/list view
  4. Apply filters (status, date range)

**Requête:**
```typescript
const projects = await databases.listDocuments(
  DATABASE_ID,
  'projects',
  [
    Query.or([
      Query.equal('team_ids', user.$id),
      Query.equal('created_by', user.$id)
    ]),
    Query.orderDesc('created_at')
  ]
);
```

**B. Création de Projet**

**Bouton:** "Create New Project"
- **Position:** Header de la page Projects
- **Icône:** `<i className="fas fa-plus"></i>`
- **Texte:** "Create New Project"

**Traitement au Clic:**
1. Ouvrir modal avec formulaire
2. Champs: title, description, due_date, team (multi-select users)
3. Option "AI Enhance" - génère tasks/risks via Gemini
4. Validation côté client
5. Envoi à Appwrite

**Code Traitement:**
```typescript
const handleCreateProject = async (projectData) => {
  try {
    setIsCreating(true);
    
    // 1. Créer le projet
    const newProject = await databases.createDocument(
      DATABASE_ID,
      'projects',
      ID.unique(),
      {
        title: projectData.title,
        description: projectData.description,
        status: 'Not Started',
        due_date: projectData.dueDate,
        team_ids: projectData.teamIds,
        created_by: user.$id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    );
    
    // 2. Si AI Enhance activé, générer tasks
    if (projectData.useAI) {
      const aiTasks = await geminiService.enhanceProjectTasks(
        projectData.description,
        selectedTeamMembers
      );
      
      // 3. Créer tasks en batch
      for (const taskData of aiTasks) {
        await databases.createDocument(
          DATABASE_ID,
          'tasks',
          ID.unique(),
          {
            project_id: newProject.$id,
            text: taskData.text,
            status: 'To Do',
            priority: taskData.priority,
            assignee_id: taskData.assigneeId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        );
      }
      
      // 4. Générer risques par IA
      const aiRisks = await geminiService.identifyRisks(projectData.description);
      for (const riskData of aiRisks) {
        await databases.createDocument(
          DATABASE_ID,
          'risks',
          ID.unique(),
          {
            project_id: newProject.$id,
            description: riskData.description,
            likelihood: riskData.likelihood,
            impact: riskData.impact,
            mitigation_strategy: riskData.mitigationStrategy,
            created_at: new Date().toISOString()
          }
        );
      }
    }
    
    // 5. Fermer modal et recharger liste
    setShowModal(false);
    await loadProjects();
    showToast('Project created successfully!', 'success');
    
  } catch (error) {
    console.error('Create project error:', error);
    showToast(`Failed to create project: ${error.message}`, 'error');
  } finally {
    setIsCreating(false);
  }
};
```

**C. Gestion des Tâches (Kanban)**

**Fonction:** `loadProjectTasks(projectId)`
- **Traitement:**
  1. Fetch tasks for project
  2. Group by status (To Do, In Progress, Done)
  3. Enable drag & drop between columns
  4. Update status on drop

**Requête:**
```typescript
const tasks = await databases.listDocuments(
  DATABASE_ID,
  'tasks',
  [
    Query.equal('project_id', projectId),
    Query.orderAsc('created_at')
  ]
);
```

**D. Drag & Drop - Changement de Statut**

**Traitement onDrop:**
```typescript
const handleTaskDrop = async (taskId, newStatus) => {
  try {
    await databases.updateDocument(
      DATABASE_ID,
      'tasks',
      taskId,
      {
        status: newStatus,
        updated_at: new Date().toISOString()
      }
    );
    
    // Recharger tasks
    await loadProjectTasks(currentProjectId);
    
  } catch (error) {
    console.error('Update task error:', error);
    showToast('Failed to update task', 'error');
  }
};
```

**E. Boutons d'Export**

**Bouton:** "Export Project Report (PDF)"
- **Position:** Header du projet (page détail)
- **Icône:** `<i className="fas fa-file-pdf"></i>`
- **Texte:** "Export Report"

**Traitement au Clic:**
```typescript
const handleExportProjectPDF = async (projectId) => {
  try {
    setIsExporting(true);
    
    // 1. Fetch project complet avec relations
    const project = await databases.getDocument(DATABASE_ID, 'projects', projectId);
    
    const tasks = await databases.listDocuments(
      DATABASE_ID,
      'tasks',
      [Query.equal('project_id', projectId)]
    );
    
    const risks = await databases.listDocuments(
      DATABASE_ID,
      'risks',
      [Query.equal('project_id', projectId)]
    );
    
    // 2. Initialiser jsPDF
    const doc = new jsPDF();
    
    // 3. Header
    doc.setFontSize(20);
    doc.text('Project Report: ' + project.title, 20, 20);
    
    doc.setFontSize(12);
    doc.text('Generated on: ' + new Date().toLocaleDateString(), 20, 30);
    doc.text('Status: ' + project.status, 20, 40);
    doc.text('Due Date: ' + new Date(project.due_date).toLocaleDateString(), 20, 50);
    
    // 4. Description
    doc.setFontSize(14);
    doc.text('Description', 20, 65);
    doc.setFontSize(10);
    const splitDescription = doc.splitTextToSize(project.description, 170);
    doc.text(splitDescription, 20, 75);
    
    let yPos = 75 + (splitDescription.length * 5) + 10;
    
    // 5. Tasks Table
    doc.setFontSize(14);
    doc.text('Tasks', 20, yPos);
    yPos += 10;
    
    const taskData = tasks.documents.map(t => [
      t.text,
      t.status,
      t.priority,
      t.assignee_name || 'Unassigned'
    ]);
    
    doc.autoTable({
      head: [['Task', 'Status', 'Priority', 'Assignee']],
      body: taskData,
      startY: yPos,
      theme: 'grid'
    });
    
    yPos = doc.lastAutoTable.finalY + 10;
    
    // 6. Risks Table
    if (risks.documents.length > 0) {
      doc.setFontSize(14);
      doc.text('Risks', 20, yPos);
      yPos += 10;
      
      const riskData = risks.documents.map(r => [
        r.description,
        r.likelihood,
        r.impact
      ]);
      
      doc.autoTable({
        head: [['Description', 'Likelihood', 'Impact']],
        body: riskData,
        startY: yPos,
        theme: 'grid'
      });
    }
    
    // 7. Sauvegarder
    doc.save(`project_${project.title}_${new Date().toISOString().split('T')[0]}.pdf`);
    
    showToast('Project report exported successfully!', 'success');
    
  } catch (error) {
    console.error('Export PDF error:', error);
    showToast('Failed to export project report', 'error');
  } finally {
    setIsExporting(false);
  }
};
```

**Bouton:** "Export Tasks (Excel)"
- **Position:** Au-dessus du Kanban board
- **Icône:** `<i className="fas fa-file-excel"></i>`
- **Texte:** "Export Tasks"

**Traitement:**
```typescript
const handleExportTasksExcel = async (projectId) => {
  try {
    // Fetch tasks
    const tasks = await databases.listDocuments(
      DATABASE_ID,
      'tasks',
      [Query.equal('project_id', projectId)]
    );
    
    // Préparer données
    const taskData = tasks.documents.map(t => ({
      'Task': t.text,
      'Status': t.status,
      'Priority': t.priority,
      'Assignee': t.assignee_name || 'Unassigned',
      'Estimated Time (h)': t.estimated_time ? (t.estimated_time / 60).toFixed(2) : '-',
      'Logged Time (h)': t.logged_time ? (t.logged_time / 60).toFixed(2) : '0',
      'Due Date': t.due_date ? new Date(t.due_date).toLocaleDateString() : '-'
    }));
    
    // Générer Excel
    const worksheet = XLSX.utils.json_to_sheet(taskData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");
    
    XLSX.writeFile(workbook, `tasks_project_${projectId}_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    showToast('Tasks exported successfully!', 'success');
    
  } catch (error) {
    console.error('Export tasks error:', error);
    showToast('Failed to export tasks', 'error');
  }
};
```

#### 4.2.3 Fichiers à Modifier
- `components/Projects.tsx`
- `services/appwriteService.ts`
- Ajouter `jspdf`, `jspdf-autotable`, `xlsx`

---

### MODULE 3: GOALS & OKRs

#### 4.3.1 Objectif
Gestion des objectifs et résultats clés avec persistance.

#### 4.3.2 Fonctionnalités à Implémenter

**A. Création d'Objectif**

**Bouton:** "Create Objective"
- **Position:** Header de la page Goals
- **Texte:** "+ Create Objective"

**Traitement:**
```typescript
const handleCreateObjective = async (objectiveData) => {
  try {
    // 1. Créer l'objectif
    const newObjective = await databases.createDocument(
      DATABASE_ID,
      'objectives',
      ID.unique(),
      {
        project_id: objectiveData.projectId,
        title: objectiveData.title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    );
    
    // 2. Créer les key results
    for (const kr of objectiveData.keyResults) {
      await databases.createDocument(
        DATABASE_ID,
        'key_results',
        ID.unique(),
        {
          objective_id: newObjective.$id,
          title: kr.title,
          current: kr.current || 0,
          target: kr.target,
          unit: kr.unit,
          updated_at: new Date().toISOString()
        }
      );
    }
    
    // 3. Recharger
    await loadObjectives();
    showToast('Objective created successfully!', 'success');
    
  } catch (error) {
    console.error('Create objective error:', error);
    showToast('Failed to create objective', 'error');
  }
};
```

**B. Update Key Result Progress**

**Élément:** Input number dans chaque Key Result card
- **Type:** Input field
- **Label:** "Current value"
- **onBlur:** Met à jour la valeur

**Traitement:**
```typescript
const handleUpdateKeyResult = async (krId, newValue) => {
  try {
    await databases.updateDocument(
      DATABASE_ID,
      'key_results',
      krId,
      {
        current: parseFloat(newValue),
        updated_at: new Date().toISOString()
      }
    );
    
    // Recharger pour recalculer %
    await loadObjectives();
    
  } catch (error) {
    console.error('Update KR error:', error);
    showToast('Failed to update progress', 'error');
  }
};
```

**C. Export OKRs (PDF)**

**Bouton:** "Export OKRs Report"
- **Position:** Header de page
- **Icône:** `<i className="fas fa-file-pdf"></i>`

**Traitement:**
```typescript
const handleExportOKRsPDF = async (projectId) => {
  try {
    // 1. Fetch objectives avec KRs
    const objectives = await databases.listDocuments(
      DATABASE_ID,
      'objectives',
      [Query.equal('project_id', projectId)]
    );
    
    // Fetch tous les KRs pour ces objectives
    const allKRs = [];
    for (const obj of objectives.documents) {
      const krs = await databases.listDocuments(
        DATABASE_ID,
        'key_results',
        [Query.equal('objective_id', obj.$id)]
      );
      allKRs.push({ objective: obj, keyResults: krs.documents });
    }
    
    // 2. Générer PDF
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('OKRs Report', 20, 20);
    
    let yPos = 35;
    
    for (const item of allKRs) {
      // Objective
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`Objective: ${item.objective.title}`, 20, yPos);
      yPos += 10;
      
      // Key Results
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      
      for (const kr of item.keyResults) {
        const progress = ((kr.current / kr.target) * 100).toFixed(1);
        doc.text(
          `  • ${kr.title}: ${kr.current} / ${kr.target} ${kr.unit} (${progress}%)`,
          25,
          yPos
        );
        yPos += 7;
      }
      
      yPos += 5;
    }
    
    doc.save(`okrs_${new Date().toISOString().split('T')[0]}.pdf`);
    showToast('OKRs report exported!', 'success');
    
  } catch (error) {
    console.error('Export OKRs error:', error);
    showToast('Failed to export OKRs', 'error');
  }
};
```

#### 4.3.3 Fichiers à Modifier
- `components/Goals.tsx`
- `services/appwriteService.ts`

---

### MODULE 4: FINANCE

#### 4.4.1 Objectif
Gestion complète des finances avec exports Excel et génération récurrente automatique.

#### 4.4.2 Fonctionnalités à Implémenter

**A. Création Facture**

**Bouton:** "Create Invoice"
- **Position:** Onglet Invoices, header
- **Texte:** "+ Create Invoice"

**Traitement:**
```typescript
const handleCreateInvoice = async (invoiceData) => {
  try {
    // 1. Upload receipt si présent
    let receiptId = null;
    if (invoiceData.receiptFile) {
      const receiptUpload = await storage.createFile(
        STORAGE_BUCKET_ID,
        ID.unique(),
        invoiceData.receiptFile
      );
      receiptId = receiptUpload.$id;
    }
    
    // 2. Générer numéro de facture auto
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    
    // 3. Créer document
    const newInvoice = await databases.createDocument(
      DATABASE_ID,
      'invoices',
      ID.unique(),
      {
        invoice_number: invoiceNumber,
        client_name: invoiceData.clientName,
        amount: parseFloat(invoiceData.amount),
        due_date: invoiceData.dueDate,
        status: invoiceData.status || 'Draft',
        receipt_id: receiptId,
        created_by: user.$id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    );
    
    // 4. Recharger et fermer modal
    await loadInvoices();
    setShowModal(false);
    showToast('Invoice created successfully!', 'success');
    
  } catch (error) {
    console.error('Create invoice error:', error);
    showToast('Failed to create invoice', 'error');
  }
};
```

**B. Update Statut Facture**

**Élément:** Dropdown dans chaque facture card
- **Options:** Draft, Sent, Paid, Overdue, Partially Paid
- **onChange:** Met à jour le statut

**Traitement:**
```typescript
const handleUpdateInvoiceStatus = async (invoiceId, newStatus) => {
  try {
    const updateData = {
      status: newStatus,
      updated_at: new Date().toISOString()
    };
    
    // Si passage à Paid, enregistrer date paiement
    if (newStatus === 'Paid') {
      updateData.paid_date = new Date().toISOString();
      updateData.paid_amount = invoice.amount;
    }
    
    await databases.updateDocument(
      DATABASE_ID,
      'invoices',
      invoiceId,
      updateData
    );
    
    await loadInvoices();
    showToast('Invoice status updated!', 'success');
    
  } catch (error) {
    console.error('Update invoice error:', error);
    showToast('Failed to update invoice', 'error');
  }
};
```

**C. Export Factures (Excel)**

**Bouton:** "Export Invoices"
- **Position:** Header onglet Invoices
- **Icône:** `<i className="fas fa-file-excel"></i>`

**Traitement:**
```typescript
const handleExportInvoices = async (filters = {}) => {
  try {
    // 1. Fetch invoices avec filtres
    const queries = [Query.orderDesc('created_at')];
    if (filters.status) queries.push(Query.equal('status', filters.status));
    if (filters.startDate) queries.push(Query.greaterThanEqual('due_date', filters.startDate));
    if (filters.endDate) queries.push(Query.lessThanEqual('due_date', filters.endDate));
    
    const invoices = await databases.listDocuments(
      DATABASE_ID,
      'invoices',
      queries
    );
    
    // 2. Préparer données
    const invoiceData = invoices.documents.map(inv => ({
      'Invoice Number': inv.invoice_number,
      'Client': inv.client_name,
      'Amount': inv.amount.toFixed(2),
      'Due Date': new Date(inv.due_date).toLocaleDateString(),
      'Status': inv.status,
      'Paid Amount': inv.paid_amount ? inv.paid_amount.toFixed(2) : '-',
      'Paid Date': inv.paid_date ? new Date(inv.paid_date).toLocaleDateString() : '-'
    }));
    
    // 3. Générer Excel
    const worksheet = XLSX.utils.json_to_sheet(invoiceData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");
    
    // Ajouter totaux
    const totalAmount = invoices.documents.reduce((sum, inv) => sum + inv.amount, 0);
    const totalPaid = invoices.documents.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0);
    
    XLSX.utils.sheet_add_aoa(worksheet, [
      [],
      ['TOTAL', '', totalAmount.toFixed(2)],
      ['TOTAL PAID', '', totalPaid.toFixed(2)],
      ['REMAINING', '', (totalAmount - totalPaid).toFixed(2)]
    ], { origin: -1 });
    
    XLSX.writeFile(workbook, `invoices_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    showToast('Invoices exported successfully!', 'success');
    
  } catch (error) {
    console.error('Export invoices error:', error);
    showToast('Failed to export invoices', 'error');
  }
};
```

**D. Export Dépenses (Excel)**

**Traitement similaire aux factures**

**E. Génération Automatique Récurrentes**

**Fonction à exécuter au démarrage de l'app:**
```typescript
const generateRecurringItems = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // === FACTURES RÉCURRENTES ===
    const recurringInvoices = await databases.listDocuments(
      DATABASE_ID,
      'recurring_invoices',
      [Query.lessThanEqual('last_generated_date', today.toISOString())]
    );
    
    for (const ri of recurringInvoices.documents) {
      const lastGen = new Date(ri.last_generated_date);
      const nextGen = new Date(lastGen);
      
      // Calculer prochaine date selon fréquence
      if (ri.frequency === 'Monthly') nextGen.setMonth(nextGen.getMonth() + 1);
      else if (ri.frequency === 'Quarterly') nextGen.setMonth(nextGen.getMonth() + 3);
      else if (ri.frequency === 'Annually') nextGen.setFullYear(nextGen.getFullYear() + 1);
      
      // Si date atteinte et pas encore expiré
      if (today >= nextGen && (!ri.end_date || today <= new Date(ri.end_date))) {
        // Générer nouvelle facture
        await databases.createDocument(
          DATABASE_ID,
          'invoices',
          ID.unique(),
          {
            invoice_number: `INV-${Date.now().toString().slice(-6)}`,
            client_name: ri.client_name,
            amount: ri.amount,
            due_date: nextGen.toISOString(),
            status: 'Sent',
            recurring_source_id: ri.$id,
            created_by: ri.created_by,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        );
        
        // Mettre à jour last_generated_date
        await databases.updateDocument(
          DATABASE_ID,
          'recurring_invoices',
          ri.$id,
          {
            last_generated_date: today.toISOString()
          }
        );
      }
    }
    
    // === DÉPENSES RÉCURRENTES === (similaire)
    const recurringExpenses = await databases.listDocuments(
      DATABASE_ID,
      'recurring_expenses',
      [Query.lessThanEqual('last_generated_date', today.toISOString())]
    );
    
    for (const re of recurringExpenses.documents) {
      const lastGen = new Date(re.last_generated_date);
      const nextGen = new Date(lastGen);
      
      if (re.frequency === 'Monthly') nextGen.setMonth(nextGen.getMonth() + 1);
      else if (re.frequency === 'Quarterly') nextGen.setMonth(nextGen.getMonth() + 3);
      else if (re.frequency === 'Annually') nextGen.setFullYear(nextGen.getFullYear() + 1);
      
      if (today >= nextGen && (!re.end_date || today <= new Date(re.end_date))) {
        await databases.createDocument(
          DATABASE_ID,
          'expenses',
          ID.unique(),
          {
            category: re.category,
            description: re.description,
            amount: re.amount,
            date: today.toISOString(),
            due_date: nextGen.toISOString(),
            status: 'Unpaid',
            recurring_source_id: re.$id,
            created_by: re.created_by,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        );
        
        await databases.updateDocument(
          DATABASE_ID,
          'recurring_expenses',
          re.$id,
          {
            last_generated_date: today.toISOString()
          }
        );
      }
    }
    
  } catch (error) {
    console.error('Generate recurring items error:', error);
  }
};
```

**Appeler dans App.tsx:**
```typescript
useEffect(() => {
  if (user) {
    generateRecurringItems();
  }
}, [user]);
```

#### 4.4.3 Fichiers à Modifier
- `components/Finance.tsx`
- `services/appwriteService.ts`
- `App.tsx`

---

### MODULE 5: TIME TRACKING

#### 4.5.1 Boutons et Actions

**Bouton:** "Log Time"
- **Traitement:** Créer document dans `time_logs` collection

**Bouton:** "Export Timesheet (Excel)"
- **Traitement:** Similaire à export Dashboard mais avec filtres avancés

---

### MODULE 6: COURSES

#### 4.6.1 Boutons et Actions

**Bouton:** "Enroll"
- **Traitement:** Créer document dans `user_course_progress`

**Bouton:** "Mark as Complete" (leçon)
- **Traitement:** Ajouter lesson ID dans `completed_lessons` array

**Bouton:** "Upload Evidence Document"
- **Traitement:** Upload vers Appwrite Storage + lier au module

---

### MODULE 7: CRM

#### 4.7.1 Export Contacts (Excel)

**Bouton:** "Export Contacts"
```typescript
const handleExportContacts = async () => {
  const contacts = await databases.listDocuments(DATABASE_ID, 'contacts');
  
  const contactData = contacts.documents.map(c => ({
    'Name': c.name,
    'Company': c.company,
    'Work Email': c.work_email,
    'Mobile': c.mobile_phone || '-',
    'Status': c.status
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(contactData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");
  
  XLSX.writeFile(workbook, `contacts_${new Date().toISOString().split('T')[0]}.xlsx`);
};
```

---

## 5. SYSTÈME D'IMPORT/EXPORT

### 5.1 Modules Nécessitant Export

| Module | Format | Priorité | Contenu |
|--------|--------|----------|---------|
| Dashboard | Excel | 🔴 | Time logs utilisateur |
| Projects | PDF | 🔴 | Rapport projet complet |
| Projects | Excel | 🔴 | Liste de tâches |
| Finance | Excel | 🔴 | Factures + dépenses |
| Time Tracking | Excel | 🔴 | Timesheet détaillé |
| CRM | Excel | 🟠 | Liste contacts |
| Goals/OKRs | PDF | 🟠 | Rapport OKRs |
| Leave Requests | Excel | 🟡 | Historique congés |
| Jobs | Excel | 🟡 | Liste offres + candidats |

### 5.2 Templates de Base

**Excel Template (XLSX):**
```typescript
// utils/exportUtils.ts
export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Data') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Styling (optionnel)
  const wscols = Object.keys(data[0] || {}).map(() => ({ wch: 20 }));
  worksheet['!cols'] = wscols;
  
  XLSX.writeFile(workbook, filename);
};
```

**PDF Template (jsPDF):**
```typescript
// utils/exportUtils.ts
export const exportToPDF = (title: string, content: any, filename: string) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.text(title, 20, 20);
  
  // Metadata
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
  
  // Content (tables avec autoTable)
  if (Array.isArray(content)) {
    doc.autoTable({
      head: [Object.keys(content[0])],
      body: content.map(item => Object.values(item)),
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 8 }
    });
  }
  
  doc.save(filename);
};
```

---

## 6. PLANNING DE RÉALISATION (8 HEURES)

### Phase 1: Setup (1h)
- [x] 0h00-0h20: Créer projet Appwrite, collections, indexes
- [x] 0h20-0h40: Installer dépendances (appwrite, jspdf, xlsx)
- [x] 0h40-1h00: Créer services Appwrite (appwriteService.ts)

### Phase 2: Authentication (1h)
- [x] 1h00-1h30: Implémenter vraie auth (Login/Signup)
- [x] 1h30-2h00: AuthContext avec Appwrite SDK

### Phase 3: Migration Données Core (2h30)
- [x] 2h00-2h30: Users, Projects, Tasks, Risks
- [x] 2h30-3h00: Courses, Jobs
- [x] 3h00-3h30: Finance (Invoices, Expenses)
- [x] 3h30-4h00: CRM, TimeLogs, Meetings
- [x] 4h00-4h30: Tests CRUD basiques

### Phase 4: Exports (2h)
- [x] 4h30-5h00: Exports Excel (Dashboard, Finance, CRM)
- [x] 5h00-5h30: Exports PDF (Projects, OKRs)
- [x] 5h30-6h00: Tests exports
- [x] 6h00-6h30: Ajustements UI (boutons export)

### Phase 5: Renommage & Tests (1h)
- [x] 6h30-6h45: Renommer en Ecosystia (branding)
- [x] 6h45-7h15: Tests complets
- [x] 7h15-7h30: Corrections bugs critiques

### Phase 6: Déploiement & Documentation (30min)
- [x] 7h30-7h45: Build production
- [x] 7h45-8h00: Documentation livraison

