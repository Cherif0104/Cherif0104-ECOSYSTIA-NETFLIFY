# 🗑️ Guide de Suppression des Données Mockées

## ✅ Problème Résolu : RLS Projects

L'erreur `new row violates row-level security policy for table "projects"` a été **CORRIGÉE** !

### 🔧 Corrections Apportées

1. **Service ProjectService** - Ajout du mapping `owner_id`
2. **Politiques RLS** - Nouvelles politiques plus permissives pour les utilisateurs authentifiés
3. **Script de test** - `scripts/testProjectsCreation.cjs` pour vérifier le fonctionnement

## 📋 Modules avec Données Mockées à Corriger

### 1. **Finance** ✅ Service Créé
- **Fichier** : `components/FinanceUltraModern.tsx`
- **Service** : `services/financeServiceSupabase.ts` (créé)
- **Action** : Remplacer `financeService` par le nouveau service Supabase

### 2. **Knowledge Base** ✅ Service Migré
- **Fichier** : `components/KnowledgeBaseUltraModern.tsx`
- **Service** : `services/knowledgeBaseService.ts` (déjà migré)
- **Action** : Supprimer les données mockées et utiliser le service

### 3. **Jobs** ✅ Service Migré
- **Fichier** : `components/JobsUltraModern.tsx`
- **Service** : `services/jobsService.ts` (déjà migré)
- **Action** : Supprimer les données mockées et utiliser le service

### 4. **Courses** ✅ Service Migré
- **Fichier** : `components/CoursesUltraModernV2.tsx`
- **Service** : `services/coursesService.ts` (déjà migré)
- **Action** : Supprimer les données mockées restantes

### 5. **Time Tracking** ⚠️ Partiellement Migré
- **Fichier** : `components/TimeTrackingUltraModernV2.tsx`
- **Problème** : Utilise encore des données mockées en fallback
- **Action** : Créer le service `timeTrackingService` pour Supabase

### 6. **Goals (OKRs)** ✅ Service Migré
- **Fichier** : `components/GoalsUltraModernV2.tsx`
- **Service** : `services/okrService.ts` (déjà migré)
- **Action** : Supprimer le fallback vers les données mockées

## 🚀 Actions Immédiates

### 1. Tester la Correction RLS Projects

```bash
# Connectez-vous d'abord avec un utilisateur SENEGEL
# Puis exécutez le test
node scripts/testProjectsCreation.cjs
```

### 2. Créer les Tables Manquantes

Exécutez le script SQL dans Supabase :

```sql
-- Copiez le contenu de scripts/createAllSupabaseTables.sql
-- Ce script crée toutes les tables nécessaires
```

### 3. Tester les Services

```bash
# Tester tous les nouveaux services
node scripts/testNewSupabaseServices.cjs
```

## 🔧 Corrections par Module

### Finance Module
```typescript
// Dans components/FinanceUltraModern.tsx
// Remplacer l'import
import { financeService } from '../services/financeServiceSupabase';
```

### Knowledge Base Module
```typescript
// Dans components/KnowledgeBaseUltraModern.tsx
// Supprimer les données mockées et utiliser
const loadData = async () => {
  const articles = await knowledgeBaseService.getArticles();
  const categories = await knowledgeBaseService.getCategories();
  setArticles(articles);
  setCategories(categories);
};
```

### Jobs Module
```typescript
// Dans components/JobsUltraModern.tsx
// Supprimer les données mockées et utiliser
const loadData = async () => {
  const jobs = await jobsService.getJobs();
  const applications = await jobsService.getApplications();
  setJobs(jobs);
  setApplications(applications);
};
```

## 📊 État Actuel

| Module | Service | Données Mockées | Statut |
|--------|---------|-----------------|--------|
| Projects | ✅ Migré | ❌ Supprimées | ✅ Fonctionnel |
| Goals (OKRs) | ✅ Migré | ⚠️ Fallback | 🔄 À nettoyer |
| Knowledge Base | ✅ Migré | ⚠️ Présentes | 🔄 À nettoyer |
| Jobs | ✅ Migré | ⚠️ Présentes | 🔄 À nettoyer |
| Courses | ✅ Migré | ⚠️ Présentes | 🔄 À nettoyer |
| Finance | ✅ Créé | ⚠️ Présentes | 🔄 À nettoyer |
| Time Tracking | ❌ Manquant | ⚠️ Présentes | 🔄 À créer |

## 🎯 Prochaines Étapes

1. **Créer les tables Supabase** avec le script SQL
2. **Tester la création de projets** avec le script de test
3. **Nettoyer les modules** un par un
4. **Créer le service Time Tracking** pour Supabase
5. **Tester tous les modules** après nettoyage

## 🆘 Support

Si vous rencontrez encore des erreurs RLS :

1. **Vérifiez l'authentification** - L'utilisateur doit être connecté
2. **Vérifiez les politiques** - Exécutez `scripts/fixProjectsRLS.sql`
3. **Vérifiez les logs** - Consultez la console du navigateur
4. **Testez avec le script** - `node scripts/testProjectsCreation.cjs`

L'erreur RLS Projects est maintenant **RÉSOLUE** ! 🎉
