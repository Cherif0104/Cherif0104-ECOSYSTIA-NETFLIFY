# 🧪 GUIDE DE TEST - FORMULAIRES COMPLETS

## 📅 Date : 15 Octobre 2025

---

## 🎯 OBJECTIF

Tester tous les **14 formulaires CRUD** créés pour s'assurer qu'ils fonctionnent parfaitement.

---

## 📋 CHECKLIST DE TEST

### ✅ Module Finance (3 formulaires)

#### 1.1 Test InvoiceFormModal
- [ ] Ouvrir Finance → "Nouvelle Facture"
- [ ] Vérifier champs : Client, Montant, Date, Statut
- [ ] Tester validation : Montant requis, Date requise
- [ ] Tester génération auto numéro facture
- [ ] Tester statuts : draft, sent, paid, overdue, partially_paid
- [ ] Tester paiements partiels
- [ ] Sauvegarder et vérifier création

#### 1.2 Test ExpenseFormModal
- [ ] Ouvrir Finance → "Nouvelle Dépense"
- [ ] Vérifier champs : Description, Montant, Catégorie, Statut
- [ ] Tester validation : Description min 5 caractères
- [ ] Tester 10 catégories prédéfinies
- [ ] Tester statuts : pending, approved, paid, rejected
- [ ] Tester upload reçus
- [ ] Sauvegarder et vérifier création

#### 1.3 Test BudgetFormModal
- [ ] Ouvrir Finance → "Nouveau Budget"
- [ ] Vérifier champs : Nom, Type, Période, Items
- [ ] Tester ajout/suppression items dynamiques
- [ ] Tester validation : Période cohérente
- [ ] Tester 4 types : monthly, quarterly, yearly, project
- [ ] Tester calculs totaux automatiques
- [ ] Sauvegarder et vérifier création

### ✅ Module CRM (3 formulaires)

#### 2.1 Test ContactFormModal
- [ ] Ouvrir CRM → "Nouveau Contact"
- [ ] Vérifier champs : Nom, Email, Téléphone, Tags
- [ ] Tester validation : Email valide, Téléphone valide
- [ ] Tester tags dynamiques (ajout/suppression)
- [ ] Tester 6 sources : website, referral, cold_call, social_media, event, other
- [ ] Tester statuts : active, inactive
- [ ] Sauvegarder et vérifier création

#### 2.2 Test LeadFormModal
- [ ] Ouvrir CRM → "Nouveau Lead"
- [ ] Vérifier champs : Nom, Email, Score, Statut
- [ ] Tester slider score 0-100
- [ ] Tester validation : Score dans range
- [ ] Tester 6 statuts : new, contacted, qualified, hot, cold, converted
- [ ] Tester tracking derniers contacts
- [ ] Sauvegarder et vérifier création

#### 2.3 Test InteractionFormModal
- [ ] Ouvrir CRM → "Nouvelle Interaction"
- [ ] Vérifier champs : Type, Description, Date, Résultat
- [ ] Tester 4 types : email, call, meeting, demo
- [ ] Tester sélection visuelle du type
- [ ] Tester validation : Description min 10 caractères
- [ ] Tester 3 résultats : successful, follow-up, closed
- [ ] Sauvegarder et vérifier création

### ✅ Module Goals (1 formulaire)

#### 3.1 Test ObjectiveFormModal
- [ ] Ouvrir Goals → "Nouvel Objectif"
- [ ] Vérifier champs : Titre, Description, Période, Priorité
- [ ] Tester 5 périodes : Q1, Q2, Q3, Q4, Annual
- [ ] Tester 3 priorités : high, medium, low
- [ ] Tester 4 statuts : active, completed, paused, cancelled
- [ ] Tester validation : Dates cohérentes
- [ ] Sauvegarder et vérifier création

### ✅ Module Time Tracking (1 formulaire)

#### 4.1 Test TimeEntryFormModal
- [ ] Ouvrir Time Tracking → "Nouvelle Entrée"
- [ ] Vérifier champs : Projet, Tâche, Heure début/fin, Type
- [ ] Tester calcul automatique heures
- [ ] Tester saisie manuelle directe
- [ ] Tester 3 types : normal, overtime, weekend
- [ ] Tester checkbox facturable
- [ ] Tester validation : Durée <= 24h
- [ ] Sauvegarder et vérifier création

### ✅ Module Knowledge Base (2 formulaires)

#### 5.1 Test ArticleFormModal
- [ ] Ouvrir Knowledge Base → "Nouvel Article"
- [ ] Vérifier champs : Titre, Résumé, Contenu, Catégorie, Tags
- [ ] Tester validation : Titre requis, Contenu min 100 caractères
- [ ] Tester résumé max 200 caractères
- [ ] Tester 4 types : article, tutorial, faq, guide
- [ ] Tester tags dynamiques (au moins 1 requis)
- [ ] Tester 3 statuts : draft, published, archived
- [ ] Tester auteur auto-rempli
- [ ] Sauvegarder et vérifier création

#### 5.2 Test CategoryFormModal
- [ ] Ouvrir Knowledge Base → "Nouvelle Catégorie"
- [ ] Vérifier champs : Nom, Description, Couleur
- [ ] Tester sélection couleur visuelle
- [ ] Tester 5 couleurs : blue, green, purple, orange, red
- [ ] Tester validation : Nom unique
- [ ] Sauvegarder et vérifier création

### ✅ Module Courses (2 formulaires)

#### 6.1 Test CourseFormModal
- [ ] Ouvrir Courses → "Nouveau Cours"
- [ ] Vérifier champs : Titre, Instructeur, Durée, Niveau, Prix
- [ ] Tester 3 niveaux : beginner, intermediate, advanced
- [ ] Tester 8 catégories prédéfinies
- [ ] Tester conversion heures ↔ minutes
- [ ] Tester prix en XOF
- [ ] Tester 3 statuts : draft, active, completed
- [ ] Sauvegarder et vérifier création

#### 6.2 Test LessonFormModal
- [ ] Ouvrir Courses → "Nouvelle Leçon"
- [ ] Vérifier champs : Titre, Cours parent, Durée, Ordre, URL vidéo
- [ ] Tester ordre auto-suggéré
- [ ] Tester validation : Ordre unique
- [ ] Tester URL vidéo (validation URL)
- [ ] Tester ressources dynamiques (ajout/suppression liens)
- [ ] Tester durée en minutes
- [ ] Sauvegarder et vérifier création

### ✅ Module Jobs (2 formulaires)

#### 7.1 Test JobFormModal
- [ ] Ouvrir Jobs → "Nouvelle Offre"
- [ ] Vérifier champs : Titre, Entreprise, Localisation, Salaire, Compétences
- [ ] Tester 5 types contrat : CDI, CDD, Full-time, Part-time, Contract
- [ ] Tester 10 départements prédéfinis
- [ ] Tester 4 niveaux : junior, intermediate, senior, expert
- [ ] Tester validation : Salaire min < max
- [ ] Tester compétences requises (tags)
- [ ] Tester exigences dynamiques
- [ ] Tester avantages dynamiques
- [ ] Tester date limite (validation future)
- [ ] Sauvegarder et vérifier création

#### 7.2 Test ApplicationFormModal
- [ ] Ouvrir Jobs → "Nouvelle Candidature"
- [ ] Vérifier champs : Nom, Email, Téléphone, CV, Lettre motivation
- [ ] Tester validation : Email valide, Téléphone format international
- [ ] Tester CV URL obligatoire
- [ ] Tester lettre motivation min 50 caractères
- [ ] Tester expérience >= 0
- [ ] Tester compétences tags
- [ ] Tester 5 statuts pipeline
- [ ] Tester notes internes (admin)
- [ ] Sauvegarder et vérifier création

---

## 🔍 TESTS DE VALIDATION

### Test 1 : Champs Requis
Pour chaque formulaire, tester :
- [ ] Soumission sans remplir champs requis
- [ ] Vérifier messages d'erreur en français
- [ ] Vérifier que le formulaire ne se soumet pas

### Test 2 : Validation Format
Pour chaque formulaire, tester :
- [ ] Email invalide → erreur
- [ ] Téléphone invalide → erreur
- [ ] URL invalide → erreur
- [ ] Nombre négatif → erreur
- [ ] Date passée (si applicable) → erreur

### Test 3 : Validation Métier
Pour chaque formulaire, tester :
- [ ] Montant facture > 0
- [ ] Heure fin > heure début
- [ ] Salaire min < salaire max
- [ ] Durée > 0
- [ ] Score lead 0-100

### Test 4 : Comportement UI
Pour chaque formulaire, tester :
- [ ] Loading state pendant soumission
- [ ] Désactivation bouton pendant soumission
- [ ] Messages de succès après création
- [ ] Fermeture modal après succès
- [ ] Reset formulaire après fermeture

---

## 🐛 TESTS D'ERREUR

### Test 1 : Erreurs Réseau
- [ ] Simuler perte connexion
- [ ] Vérifier message d'erreur approprié
- [ ] Vérifier que le formulaire reste ouvert

### Test 2 : Erreurs Serveur
- [ ] Simuler erreur 500
- [ ] Vérifier message d'erreur approprié
- [ ] Vérifier que les données ne sont pas perdues

### Test 3 : Validation Côté Serveur
- [ ] Tester doublons (nom unique, email unique)
- [ ] Vérifier messages d'erreur serveur
- [ ] Vérifier que les erreurs s'affichent correctement

---

## 📊 RÉSULTATS ATTENDUS

### Succès (✅)
- [ ] Tous les 14 formulaires s'ouvrent
- [ ] Validation fonctionne correctement
- [ ] Messages d'erreur en français
- [ ] Création d'entités réussie
- [ ] UI responsive et moderne
- [ ] Loading states appropriés

### Échecs à Corriger (❌)
- [ ] Formulaire ne s'ouvre pas
- [ ] Validation ne fonctionne pas
- [ ] Messages d'erreur en anglais
- [ ] Création échoue
- [ ] UI cassée
- [ ] Pas de loading state

---

## 🚀 INSTRUCTIONS DE TEST

### 1. Préparation
```bash
# S'assurer que l'app fonctionne
npm run dev

# Ouvrir http://localhost:5173
```

### 2. Ordre de Test
1. **Finance** (3 formulaires)
2. **CRM** (3 formulaires)
3. **Goals** (1 formulaire)
4. **Time Tracking** (1 formulaire)
5. **Knowledge Base** (2 formulaires)
6. **Courses** (2 formulaires)
7. **Jobs** (2 formulaires)

### 3. Pour Chaque Formulaire
1. Cliquer sur le bouton "Nouveau..."
2. Tester validation (champs vides)
3. Remplir correctement
4. Tester validation (formats invalides)
5. Remplir correctement
6. Soumettre
7. Vérifier création
8. Fermer modal

### 4. Documentation des Bugs
Si un bug est trouvé, noter :
- Module concerné
- Formulaire concerné
- Étapes pour reproduire
- Comportement attendu
- Comportement observé
- Capture d'écran (si possible)

---

## ✅ CRITÈRES DE SUCCÈS

### Fonctionnel
- [ ] 14/14 formulaires fonctionnent
- [ ] 100% validation correcte
- [ ] 100% création réussie
- [ ] 0 bug critique

### UX/UI
- [ ] Interface moderne et cohérente
- [ ] Messages d'erreur clairs
- [ ] Loading states appropriés
- [ ] Responsive design

### Technique
- [ ] Code TypeScript strict
- [ ] Pas d'erreur console
- [ ] Performance acceptable
- [ ] Accessibilité de base

---

## 📝 RAPPORT DE TEST

### Résumé
- **Formulaires testés** : ___/14
- **Succès** : ___/14
- **Bugs trouvés** : ___
- **Bugs critiques** : ___

### Détail par Module
- **Finance** : ___/3 formulaires
- **CRM** : ___/3 formulaires
- **Goals** : ___/1 formulaire
- **Time Tracking** : ___/1 formulaire
- **Knowledge Base** : ___/2 formulaires
- **Courses** : ___/2 formulaires
- **Jobs** : ___/2 formulaires

### Bugs Identifiés
1. **Module** : ___
   **Formulaire** : ___
   **Description** : ___
   **Priorité** : ___

2. **Module** : ___
   **Formulaire** : ___
   **Description** : ___
   **Priorité** : ___

### Recommandations
- [ ] Corriger bugs critiques
- [ ] Améliorer UX si nécessaire
- [ ] Optimiser performance si nécessaire
- [ ] Ajouter tests unitaires si nécessaire

---

**Guide créé le** : 15 Octobre 2025  
**Version** : 1.0  
**Statut** : ✅ Prêt pour test

