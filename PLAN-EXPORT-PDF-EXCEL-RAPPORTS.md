# 📊 PLAN EXPORT PDF/EXCEL - RAPPORTS ECOSYSTIA

## 📅 Date : 15 Octobre 2025

---

## 🎯 OBJECTIF

Implémenter les fonctionnalités d'export PDF et Excel pour générer des rapports professionnels à partir des données des modules.

---

## 📋 MODULES À EXPORTER

### 1. **Module Finance** (3 exports)

#### 1.1 Rapport Factures
- **Format** : PDF + Excel
- **Données** : Liste factures avec filtres
- **Colonnes** : Numéro, Client, Montant, Date, Statut, Paiement
- **Filtres** : Période, Statut, Client
- **Graphiques** : Évolution mensuelle, Répartition par statut

#### 1.2 Rapport Dépenses
- **Format** : PDF + Excel
- **Données** : Liste dépenses avec filtres
- **Colonnes** : Description, Catégorie, Montant, Date, Statut, Reçu
- **Filtres** : Période, Catégorie, Statut
- **Graphiques** : Répartition par catégorie, Évolution mensuelle

#### 1.3 Rapport Budgets
- **Format** : PDF + Excel
- **Données** : Budgets avec items détaillés
- **Colonnes** : Nom, Type, Période, Items, Total, Dépensé, Restant
- **Filtres** : Période, Type
- **Graphiques** : Répartition par type, Évolution des dépenses

### 2. **Module CRM** (3 exports)

#### 2.1 Rapport Contacts
- **Format** : PDF + Excel
- **Données** : Liste contacts avec interactions
- **Colonnes** : Nom, Email, Téléphone, Source, Statut, Dernière interaction
- **Filtres** : Source, Statut, Période
- **Graphiques** : Répartition par source, Évolution des contacts

#### 2.2 Rapport Leads
- **Format** : PDF + Excel
- **Données** : Pipeline des leads
- **Colonnes** : Nom, Email, Score, Statut, Source, Date création
- **Filtres** : Score, Statut, Source
- **Graphiques** : Répartition par score, Pipeline de conversion

#### 2.3 Rapport Interactions
- **Format** : PDF + Excel
- **Données** : Historique des interactions
- **Colonnes** : Type, Description, Date, Résultat, Contact
- **Filtres** : Type, Période, Résultat
- **Graphiques** : Répartition par type, Évolution des interactions

### 3. **Module Goals** (1 export)

#### 3.1 Rapport Objectifs
- **Format** : PDF + Excel
- **Données** : Objectifs et key results
- **Colonnes** : Titre, Période, Priorité, Statut, Progression, Key Results
- **Filtres** : Période, Priorité, Statut
- **Graphiques** : Répartition par priorité, Progression des objectifs

### 4. **Module Time Tracking** (1 export)

#### 4.1 Rapport Temps
- **Format** : PDF + Excel
- **Données** : Entrées de temps par projet
- **Colonnes** : Projet, Tâche, Date, Heures, Type, Facturable
- **Filtres** : Période, Projet, Type
- **Graphiques** : Répartition par projet, Évolution des heures

### 5. **Module Knowledge Base** (2 exports)

#### 5.1 Rapport Articles
- **Format** : PDF + Excel
- **Données** : Articles de la base de connaissances
- **Colonnes** : Titre, Catégorie, Type, Auteur, Statut, Vues, Rating
- **Filtres** : Catégorie, Type, Statut
- **Graphiques** : Répartition par catégorie, Articles populaires

#### 5.2 Rapport Catégories
- **Format** : PDF + Excel
- **Données** : Catégories avec statistiques
- **Colonnes** : Nom, Description, Couleur, Nombre d'articles
- **Filtres** : Couleur
- **Graphiques** : Répartition des articles par catégorie

### 6. **Module Courses** (2 exports)

#### 6.1 Rapport Cours
- **Format** : PDF + Excel
- **Données** : Cours et leçons
- **Colonnes** : Titre, Instructeur, Niveau, Catégorie, Prix, Statut, Inscriptions
- **Filtres** : Niveau, Catégorie, Statut
- **Graphiques** : Répartition par niveau, Évolution des inscriptions

#### 6.2 Rapport Leçons
- **Format** : PDF + Excel
- **Données** : Leçons par cours
- **Colonnes** : Titre, Cours, Durée, Ordre, Ressources
- **Filtres** : Cours, Durée
- **Graphiques** : Répartition des durées, Progression des cours

### 7. **Module Jobs** (2 exports)

#### 7.1 Rapport Offres
- **Format** : PDF + Excel
- **Données** : Offres d'emploi
- **Colonnes** : Titre, Entreprise, Localisation, Type, Niveau, Salaire, Statut, Candidatures
- **Filtres** : Type, Niveau, Département, Statut
- **Graphiques** : Répartition par type, Évolution des candidatures

#### 7.2 Rapport Candidatures
- **Format** : PDF + Excel
- **Données** : Candidatures par offre
- **Colonnes** : Nom, Email, Offre, Expérience, Compétences, Statut, Date
- **Filtres** : Offre, Statut, Expérience
- **Graphiques** : Pipeline de candidatures, Répartition par expérience

---

## 🛠️ IMPLÉMENTATION TECHNIQUE

### 1. **Dépendances à Installer**

```bash
# PDF Generation
npm install jspdf jspdf-autotable html2canvas

# Excel Generation
npm install xlsx file-saver

# Charts for PDF
npm install chart.js chartjs-adapter-date-fns
```

### 2. **Service d'Export**

```typescript
// services/exportService.ts
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export class ExportService {
  // Export PDF
  async exportToPDF(data: any[], columns: any[], title: string, filters?: any) {
    const doc = new jsPDF();
    
    // En-tête
    doc.setFontSize(20);
    doc.text(title, 14, 22);
    
    // Filtres appliqués
    if (filters) {
      doc.setFontSize(10);
      doc.text(`Filtres: ${JSON.stringify(filters)}`, 14, 30);
    }
    
    // Tableau
    doc.autoTable({
      head: [columns.map(col => col.header)],
      body: data.map(row => columns.map(col => row[col.key])),
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    // Sauvegarder
    doc.save(`${title}_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  // Export Excel
  async exportToExcel(data: any[], columns: any[], title: string, filters?: any) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    
    // Ajouter feuille
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Données');
    
    // Ajouter feuille filtres si nécessaire
    if (filters) {
      const filtersSheet = XLSX.utils.json_to_sheet([filters]);
      XLSX.utils.book_append_sheet(workbook, filtersSheet, 'Filtres');
    }
    
    // Sauvegarder
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${title}_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  // Export avec graphiques
  async exportWithCharts(data: any[], config: ExportConfig) {
    // Implémentation pour PDF avec graphiques
    const canvas = await this.generateChart(data, config.chart);
    const imgData = canvas.toDataURL('image/png');
    
    const doc = new jsPDF();
    doc.addImage(imgData, 'PNG', 14, 14, 180, 100);
    
    // Ajouter tableau
    doc.autoTable({
      head: [config.columns.map(col => col.header)],
      body: data.map(row => config.columns.map(col => row[col.key])),
      startY: 120
    });
    
    doc.save(`${config.title}_${new Date().toISOString().split('T')[0]}.pdf`);
  }
}
```

### 3. **Composant d'Export**

```typescript
// components/ExportModal.tsx
import React, { useState } from 'react';
import { ExportService } from '../services/exportService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  columns: any[];
  title: string;
  filters?: any;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  data,
  columns,
  title,
  filters
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const exportService = new ExportService();

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportService.exportToPDF(data, columns, title, filters);
    } catch (error) {
      console.error('Erreur export PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      await exportService.exportToExcel(data, columns, title, filters);
    } catch (error) {
      console.error('Erreur export Excel:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">Exporter les données</h3>
        
        <div className="space-y-4">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50"
          >
            {isExporting ? 'Export en cours...' : 'Exporter en PDF'}
          </button>
          
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isExporting ? 'Export en cours...' : 'Exporter en Excel'}
          </button>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
```

### 4. **Intégration dans les Modules**

```typescript
// components/FinanceUltraModern.tsx
import { ExportModal } from './ExportModal';

export const FinanceUltraModern = () => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportData, setExportData] = useState([]);

  const handleExportInvoices = () => {
    // Préparer données pour export
    const data = invoices.map(invoice => ({
      numero: invoice.number,
      client: invoice.client,
      montant: invoice.amount,
      date: invoice.date,
      statut: invoice.status,
      paiement: invoice.paidAmount
    }));

    const columns = [
      { key: 'numero', header: 'Numéro' },
      { key: 'client', header: 'Client' },
      { key: 'montant', header: 'Montant' },
      { key: 'date', header: 'Date' },
      { key: 'statut', header: 'Statut' },
      { key: 'paiement', header: 'Paiement' }
    ];

    setExportData(data);
    setShowExportModal(true);
  };

  return (
    <div>
      {/* Bouton d'export */}
      <button
        onClick={handleExportInvoices}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Exporter Factures
      </button>

      {/* Modal d'export */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={exportData}
        columns={columns}
        title="Rapport Factures"
        filters={currentFilters}
      />
    </div>
  );
};
```

---

## 📊 FONCTIONNALITÉS AVANCÉES

### 1. **Filtres Avancés**

```typescript
// components/ExportFilters.tsx
export const ExportFilters = ({ onApplyFilters }) => {
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    status: '',
    category: '',
    // ... autres filtres
  });

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label>Période</label>
        <input
          type="date"
          value={filters.dateRange.start}
          onChange={(e) => setFilters({
            ...filters,
            dateRange: { ...filters.dateRange, start: e.target.value }
          })}
        />
      </div>
      {/* Autres filtres */}
    </div>
  );
};
```

### 2. **Templates Personnalisés**

```typescript
// services/templateService.ts
export class TemplateService {
  getTemplate(module: string, type: string) {
    const templates = {
      finance: {
        invoices: {
          columns: ['numero', 'client', 'montant', 'date', 'statut'],
          title: 'Rapport Factures',
          chart: 'monthlyEvolution'
        },
        expenses: {
          columns: ['description', 'category', 'amount', 'date'],
          title: 'Rapport Dépenses',
          chart: 'categoryDistribution'
        }
      }
      // ... autres modules
    };

    return templates[module]?.[type] || null;
  }
}
```

### 3. **Planification d'Exports**

```typescript
// services/scheduledExportService.ts
export class ScheduledExportService {
  async scheduleExport(config: ExportConfig, schedule: string) {
    // Implémentation pour exports programmés
    // Ex: tous les lundis à 9h
  }

  async getScheduledExports() {
    // Récupérer exports programmés
  }
}
```

---

## 🎨 DESIGN DES RAPPORTS

### 1. **Template PDF**

```typescript
// templates/pdfTemplate.ts
export const PDFTemplate = {
  header: {
    logo: 'assets/logo.png',
    title: 'ECOSYSTIA',
    subtitle: 'Rapport de Données'
  },
  footer: {
    pageNumber: true,
    date: true,
    company: 'SENEGELE'
  },
  styles: {
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    fontFamily: 'Arial'
  }
};
```

### 2. **Template Excel**

```typescript
// templates/excelTemplate.ts
export const ExcelTemplate = {
  header: {
    title: 'ECOSYSTIA - Rapport de Données',
    date: new Date().toLocaleDateString('fr-FR')
  },
  styles: {
    header: {
      fill: { fgColor: { rgb: '2563eb' } },
      font: { color: { rgb: 'ffffff' }, bold: true }
    },
    data: {
      font: { size: 10 }
    }
  }
};
```

---

## 📈 MÉTRIQUES ET ANALYTICS

### 1. **Suivi des Exports**

```typescript
// services/exportAnalytics.ts
export class ExportAnalytics {
  async trackExport(module: string, type: string, format: string) {
    // Enregistrer métriques d'export
    await this.recordExport({
      module,
      type,
      format,
      timestamp: new Date(),
      userId: getCurrentUser().id
    });
  }

  async getExportStats(period: string) {
    // Récupérer statistiques d'export
  }
}
```

### 2. **Dashboard Exports**

```typescript
// components/ExportDashboard.tsx
export const ExportDashboard = () => {
  const [stats, setStats] = useState(null);

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-blue-100 p-4 rounded">
        <h3>Exports PDF</h3>
        <p className="text-2xl font-bold">{stats?.pdfCount || 0}</p>
      </div>
      <div className="bg-green-100 p-4 rounded">
        <h3>Exports Excel</h3>
        <p className="text-2xl font-bold">{stats?.excelCount || 0}</p>
      </div>
      <div className="bg-purple-100 p-4 rounded">
        <h3>Total Exports</h3>
        <p className="text-2xl font-bold">{stats?.totalCount || 0}</p>
      </div>
    </div>
  );
};
```

---

## 🚀 IMPLÉMENTATION

### Phase 1 : Export de Base (3-4h)

1. **Service d'Export** (1h)
   - Créer ExportService
   - Implémenter PDF et Excel
   - Tests de base

2. **Composant ExportModal** (1h)
   - Interface utilisateur
   - Gestion des états
   - Intégration service

3. **Intégration Finance** (1h)
   - Export factures
   - Export dépenses
   - Export budgets

### Phase 2 : Modules Restants (4-5h)

4. **CRM** (1h)
5. **Goals** (30min)
6. **Time Tracking** (30min)
7. **Knowledge Base** (1h)
8. **Courses** (1h)
9. **Jobs** (1h)

### Phase 3 : Fonctionnalités Avancées (3-4h)

10. **Filtres Avancés** (1h)
11. **Templates Personnalisés** (1h)
12. **Graphiques PDF** (1h)
13. **Analytics** (1h)

---

## 📊 RÉSULTATS ATTENDUS

### Fonctionnalités
- ✅ **14 types d'export** (PDF + Excel)
- ✅ **Filtres avancés** pour tous les modules
- ✅ **Templates personnalisés** par module
- ✅ **Graphiques intégrés** dans PDF
- ✅ **Analytics d'export** complet

### Performance
- ✅ **Export rapide** (< 5s pour 1000 lignes)
- ✅ **Fichiers optimisés** (taille réduite)
- ✅ **Interface responsive** pour tous devices
- ✅ **Gestion d'erreurs** robuste

### UX
- ✅ **Interface intuitive** pour export
- ✅ **Prévisualisation** des données
- ✅ **Progression** de l'export
- ✅ **Notifications** de succès/erreur

---

## 🎯 PROCHAINES ÉTAPES

### Immédiat
1. Installer dépendances PDF/Excel
2. Créer ExportService de base
3. Implémenter ExportModal

### Court terme
4. Intégrer dans tous les modules
5. Ajouter filtres avancés
6. Créer templates personnalisés

### Moyen terme
7. Ajouter graphiques PDF
8. Implémenter analytics
9. Optimiser performances

---

**Guide créé le** : 15 Octobre 2025  
**Version** : 1.0  
**Statut** : ⏳ Prêt pour implémentation
