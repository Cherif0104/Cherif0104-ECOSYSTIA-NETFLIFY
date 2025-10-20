# 🧪 INSTRUCTIONS DE TEST MANUEL - MODULE PROJECTS

**Date** : 13 octobre 2025  
**Application** : ERP SENEGEL  
**Module testé** : Projects

---

## 🎯 OBJECTIF

Tester les améliorations du formulaire Projects et valider la persistance Appwrite.

---

## 🚀 PRÉPARATION

### 1. Lancer l'application

```bash
npm run dev
```

L'application devrait démarrer sur : `http://localhost:5174` (ou 5173)

### 2. Se connecter

**Credentials** :
- Email : `admin@ecosystia.com`
- Password : `Admin123!`

### 3. Accéder au module Projects

1. Dans la sidebar, cliquer sur **"Projects"**
2. Vous devriez voir la liste des projets existants (13 projets)

---

## 📋 TESTS À EFFECTUER

### TEST 1 : Validation du formulaire vide

**Objectif** : Vérifier que les erreurs de validation s'affichent correctement

**Étapes** :
1. Cliquer sur le bouton **"+ New Project"** (en haut à droite)
2. **NE RIEN REMPLIR**
3. Cliquer directement sur **"Sauvegarder"**

**Résultat attendu** :
- ✅ Un bloc rouge apparaît en haut du formulaire
- ✅ Liste des erreurs affichée :
  - "Le titre est requis"
  - "La description est requise"
  - "La date d'échéance est requise"
  - "Au moins un membre d'équipe est requis"
- ✅ Formulaire PAS fermé
- ✅ Aucun projet créé

**Statut** : ⬜ Passé / ⬜ Échoué

**Commentaires** : _________________________________

---

### TEST 2 : Validation du titre trop court

**Objectif** : Vérifier la validation de la longueur minimale

**Étapes** :
1. Dans le formulaire Projects ouvert
2. Titre : `AB` (2 caractères)
3. Description : `Une description valide avec plus de 10 caractères`
4. Date : Demain
5. Équipe : Sélectionner 1 membre
6. Cliquer sur **"Sauvegarder"**

**Résultat attendu** :
- ✅ Erreur affichée : "Le titre doit contenir au moins 3 caractères"
- ✅ Formulaire PAS fermé

**Statut** : ⬜ Passé / ⬜ Échoué

---

### TEST 3 : Validation de la description trop courte

**Objectif** : Vérifier la validation de la longueur minimale de la description

**Étapes** :
1. Titre : `Projet Test Valide`
2. Description : `Court` (5 caractères)
3. Date : Demain
4. Équipe : Sélectionner 1 membre
5. Cliquer sur **"Sauvegarder"**

**Résultat attendu** :
- ✅ Erreur affichée : "La description doit contenir au moins 10 caractères"
- ✅ Formulaire PAS fermé

**Statut** : ⬜ Passé / ⬜ Échoué

---

### TEST 4 : Création de projet valide

**Objectif** : Tester la création complète d'un projet avec persistance

**Étapes** :
1. Fermer le formulaire actuel (si ouvert)
2. Cliquer sur **"+ New Project"**
3. Remplir le formulaire :
   - **Titre** : `Test Persistance Appwrite - [VOTRE NOM]`
   - **Description** : `Ce projet teste la persistance des données dans Appwrite avec les nouvelles améliorations de validation et de feedback utilisateur.`
   - **Status** : `In Progress`
   - **Date d'échéance** : Sélectionner une date FUTURE (demain ou après)
   - **Équipe** : Sélectionner **2-3 membres** (maintenir Ctrl/Cmd)
4. Cliquer sur **"Sauvegarder"**

**Résultat attendu PENDANT le submit** :
- ✅ Bouton "Annuler" désactivé (grisé)
- ✅ Bouton "Sauvegarder" désactivé (grisé)
- ✅ Spinner animé visible
- ✅ Texte du bouton change en **"Enregistrement..."**
- ✅ Curseur "not-allowed" sur les boutons

**Résultat attendu APRÈS le submit** :
- ✅ Formulaire se ferme automatiquement
- ✅ **Notification Toast verte** apparaît en haut à droite :
  - Message : `Projet "[NOM]" créé avec succès ! 🎉`
  - Type : Succès (vert)
  - Disparaît après 4 secondes
- ✅ Projet apparaît dans la liste des projets
- ✅ Titre correct
- ✅ Description correcte
- ✅ Date correcte
- ✅ Équipe correcte

**Statut** : ⬜ Passé / ⬜ Échoué

---

### TEST 5 : Persistance après rafraîchissement 🔑 (TEST CRITIQUE)

**Objectif** : Vérifier que le projet est bien sauvegardé dans Appwrite

**Étapes** :
1. Après avoir créé le projet dans TEST 4
2. **Rafraîchir la page complètement** (F5 ou Ctrl+R)
3. Attendre le rechargement
4. Se reconnecter si nécessaire
5. Aller dans le module **Projects**
6. Chercher le projet créé : `Test Persistance Appwrite - [VOTRE NOM]`

**Résultat attendu** :
- ✅ Projet TOUJOURS PRÉSENT dans la liste
- ✅ Toutes les données intactes (titre, description, date, équipe)
- ✅ Aucune perte de données

**Statut** : ⬜ Passé / ⬜ Échoué

---

### TEST 6 : Modification de projet

**Objectif** : Tester la modification et la persistance

**Étapes** :
1. Cliquer sur le projet créé précédemment
2. Cliquer sur **"Edit"** (icône crayon)
3. Modifier :
   - **Titre** : Ajouter ` - MODIFIÉ` à la fin
   - **Description** : Ajouter une phrase au début : `[MODIFICATION TEST] `
   - **Status** : Changer le statut
4. Cliquer sur **"Sauvegarder"**

**Résultat attendu PENDANT** :
- ✅ Loading state (boutons désactivés, spinner)

**Résultat attendu APRÈS** :
- ✅ Formulaire fermé
- ✅ **Notification Toast verte** :
  - Message : `Projet "[NOM]" mis à jour avec succès ! ✅`
- ✅ Modifications visibles dans la liste

**Statut** : ⬜ Passé / ⬜ Échoué

---

### TEST 7 : Persistance de la modification 🔑 (TEST CRITIQUE)

**Objectif** : Vérifier que la modification est persistante

**Étapes** :
1. Après avoir modifié le projet dans TEST 6
2. **Rafraîchir la page** (F5)
3. Aller dans Projects
4. Chercher le projet modifié

**Résultat attendu** :
- ✅ Modifications TOUJOURS PRÉSENTES
- ✅ Titre contient " - MODIFIÉ"
- ✅ Description contient "[MODIFICATION TEST]"
- ✅ Status modifié

**Statut** : ⬜ Passé / ⬜ Échoué

---

### TEST 8 : Compteur de caractères

**Objectif** : Vérifier que les compteurs fonctionnent

**Étapes** :
1. Ouvrir le formulaire de création de projet
2. Taper dans le champ **Titre**
3. Observer le compteur sous le champ

**Résultat attendu** :
- ✅ Compteur affiche `X/100 caractères` en temps réel
- ✅ Met à jour à chaque frappe
- ✅ Maximum 100 caractères (impossible de taper plus)

**Statut** : ⬜ Passé / ⬜ Échoué

---

### TEST 9 : Effacement des erreurs à la frappe

**Objectif** : Vérifier que les erreurs disparaissent quand l'utilisateur commence à corriger

**Étapes** :
1. Ouvrir le formulaire
2. Soumettre vide → Erreurs affichées
3. Commencer à taper dans le champ **Titre**

**Résultat attendu** :
- ✅ Bloc d'erreurs disparaît dès la première frappe
- ✅ Formulaire redevient propre

**Statut** : ⬜ Passé / ⬜ Échoué

---

### TEST 10 : Annulation pendant le chargement

**Objectif** : Vérifier que l'annulation est bloquée pendant le submit

**Étapes** :
1. Remplir un formulaire valide
2. Cliquer sur "Sauvegarder"
3. Pendant le loading, essayer de cliquer sur "Annuler"

**Résultat attendu** :
- ✅ Bouton "Annuler" désactivé (pas cliquable)
- ✅ Curseur "not-allowed"
- ✅ Impossible d'annuler pendant le submit

**Statut** : ⬜ Passé / ⬜ Échoué

---

## 📊 RÉCAPITULATIF DES TESTS

| # | Test | Statut | Commentaires |
|---|------|--------|--------------|
| 1 | Validation formulaire vide | ⬜ | |
| 2 | Titre trop court | ⬜ | |
| 3 | Description trop courte | ⬜ | |
| 4 | Création valide | ⬜ | |
| 5 | **Persistance après refresh** 🔑 | ⬜ | **CRITIQUE** |
| 6 | Modification | ⬜ | |
| 7 | **Persistance modification** 🔑 | ⬜ | **CRITIQUE** |
| 8 | Compteur caractères | ⬜ | |
| 9 | Effacement erreurs | ⬜ | |
| 10 | Annulation bloquée | ⬜ | |

**Score** : __ / 10 tests passés

---

## 🐛 BUGS IDENTIFIÉS

### Bug 1
**Description** : _________________________________  
**Sévérité** : ⬜ Critique / ⬜ Majeur / ⬜ Mineur  
**Étapes de reproduction** : _________________________________

### Bug 2
**Description** : _________________________________  
**Sévérité** : ⬜ Critique / ⬜ Majeur / ⬜ Mineur  
**Étapes de reproduction** : _________________________________

---

## ✅ VALIDATION FINALE

### Critères de validation

- ⬜ Tous les tests passés (10/10)
- ⬜ Aucun bug critique
- ⬜ Persistance validée (tests 5 et 7)
- ⬜ UX satisfaisante

### Décision

- ⬜ **VALIDÉ** : Module prêt pour la production
- ⬜ **CORRECTIONS REQUISES** : Bugs à corriger avant validation
- ⬜ **ÉCHEC** : Problèmes majeurs, refonte nécessaire

---

## 📝 NOTES ADDITIONNELLES

_________________________________

_________________________________

_________________________________

---

**Testeur** : _________________________________  
**Date du test** : _________________________________  
**Durée des tests** : _________________________________  
**Navigateur** : _________________________________  
**Version de l'app** : 1.0.0

---

**Signature** : ____________  
**Date** : ______________

