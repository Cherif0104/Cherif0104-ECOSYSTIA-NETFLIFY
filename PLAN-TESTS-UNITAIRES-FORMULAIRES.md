# 🧪 PLAN TESTS UNITAIRES - FORMULAIRES ECOSYSTIA

## 📅 Date : 15 Octobre 2025

---

## 🎯 OBJECTIF

Créer des tests unitaires complets pour les formulaires critiques afin d'assurer la qualité et la stabilité du code.

---

## 📊 STRATÉGIE DE TEST

### Priorité des Tests

1. **🔴 Critique** : Formulaires Finance (3)
2. **🟡 Important** : Formulaires CRM (3)
3. **🟢 Standard** : Autres formulaires (8)

### Types de Tests

1. **Tests de Validation** : Règles de validation
2. **Tests de Composant** : Rendu et interactions
3. **Tests d'Intégration** : Services et API
4. **Tests d'Accessibilité** : Navigation clavier, screen readers

---

## 🛠️ CONFIGURATION

### Installation des Dépendances

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom
```

### Configuration Jest

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/components/forms/**/*.{ts,tsx}',
    'src/utils/validation.ts',
    'src/services/*Service.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Setup Tests

```typescript
// src/setupTests.ts
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

configure({ testIdAttribute: 'data-testid' });
```

---

## 🧪 TESTS PAR FORMULAIRE

### 1. **InvoiceFormModal** (Critique)

#### Tests de Validation

```typescript
// __tests__/InvoiceFormModal.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InvoiceFormModal } from '../components/forms/InvoiceFormModal';

describe('InvoiceFormModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Validation', () => {
    test('affiche erreur si client vide', async () => {
      render(<InvoiceFormModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      
      const submitButton = screen.getByRole('button', { name: /créer/i });
      await userEvent.click(submitButton);

      expect(screen.getByText('Client requis')).toBeInTheDocument();
    });

    test('affiche erreur si montant invalide', async () => {
      render(<InvoiceFormModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      
      const amountInput = screen.getByLabelText(/montant/i);
      await userEvent.type(amountInput, '-100');
      
      const submitButton = screen.getByRole('button', { name: /créer/i });
      await userEvent.click(submitButton);

      expect(screen.getByText('Montant doit être positif')).toBeInTheDocument();
    });

    test('affiche erreur si date vide', async () => {
      render(<InvoiceFormModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      
      const submitButton = screen.getByRole('button', { name: /créer/i });
      await userEvent.click(submitButton);

      expect(screen.getByText('Date requise')).toBeInTheDocument();
    });
  });

  describe('Fonctionnalités', () => {
    test('génère numéro facture automatiquement', () => {
      render(<InvoiceFormModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      
      const invoiceNumber = screen.getByDisplayValue(/FAC-\d{6}/);
      expect(invoiceNumber).toBeInTheDocument();
    });

    test('calcule paiements partiels correctement', async () => {
      render(<InvoiceFormModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      
      const amountInput = screen.getByLabelText(/montant/i);
      await userEvent.type(amountInput, '1000');
      
      const paidAmountInput = screen.getByLabelText(/montant payé/i);
      await userEvent.type(paidAmountInput, '300');
      
      const remainingAmount = screen.getByDisplayValue('700');
      expect(remainingAmount).toBeInTheDocument();
    });
  });

  describe('Soumission', () => {
    test('soumet formulaire avec données valides', async () => {
      render(<InvoiceFormModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      
      await userEvent.type(screen.getByLabelText(/client/i), 'Client Test');
      await userEvent.type(screen.getByLabelText(/montant/i), '1000');
      await userEvent.type(screen.getByLabelText(/date/i), '2025-12-31');
      
      const submitButton = screen.getByRole('button', { name: /créer/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          client: 'Client Test',
          amount: 1000,
          date: '2025-12-31',
          status: 'draft'
        });
      });
    });
  });
});
```

### 2. **ExpenseFormModal** (Critique)

#### Tests de Validation

```typescript
// __tests__/ExpenseFormModal.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExpenseFormModal } from '../components/forms/ExpenseFormModal';

describe('ExpenseFormModal', () => {
  test('affiche erreur si description trop courte', async () => {
    render(<ExpenseFormModal isOpen={true} onClose={jest.fn()} onSubmit={jest.fn()} />);
    
    const descriptionInput = screen.getByLabelText(/description/i);
    await userEvent.type(descriptionInput, 'abc');
    
    const submitButton = screen.getByRole('button', { name: /créer/i });
    await userEvent.click(submitButton);

    expect(screen.getByText('Description doit contenir au moins 5 caractères')).toBeInTheDocument();
  });

  test('affiche toutes les catégories prédéfinies', () => {
    render(<ExpenseFormModal isOpen={true} onClose={jest.fn()} onSubmit={jest.fn()} />);
    
    const categorySelect = screen.getByLabelText(/catégorie/i);
    await userEvent.click(categorySelect);

    expect(screen.getByText('Marketing')).toBeInTheDocument();
    expect(screen.getByText('Voyage')).toBeInTheDocument();
    expect(screen.getByText('Équipement')).toBeInTheDocument();
    // ... autres catégories
  });
});
```

### 3. **BudgetFormModal** (Critique)

#### Tests de Fonctionnalités

```typescript
// __tests__/BudgetFormModal.test.tsx
describe('BudgetFormModal', () => {
  test('ajoute item budgétaire dynamiquement', async () => {
    render(<BudgetFormModal isOpen={true} onClose={jest.fn()} onSubmit={jest.fn()} />);
    
    const addItemButton = screen.getByRole('button', { name: /ajouter item/i });
    await userEvent.click(addItemButton);

    expect(screen.getByLabelText(/nom item/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/montant item/i)).toBeInTheDocument();
  });

  test('supprime item budgétaire', async () => {
    render(<BudgetFormModal isOpen={true} onClose={jest.fn()} onSubmit={jest.fn()} />);
    
    // Ajouter un item
    const addItemButton = screen.getByRole('button', { name: /ajouter item/i });
    await userEvent.click(addItemButton);
    
    // Le supprimer
    const removeButton = screen.getByRole('button', { name: /supprimer/i });
    await userEvent.click(removeButton);

    expect(screen.queryByLabelText(/nom item/i)).not.toBeInTheDocument();
  });

  test('calcule total automatiquement', async () => {
    render(<BudgetFormModal isOpen={true} onClose={jest.fn()} onSubmit={jest.fn()} />);
    
    // Ajouter 2 items
    const addItemButton = screen.getByRole('button', { name: /ajouter item/i });
    await userEvent.click(addItemButton);
    
    await userEvent.type(screen.getByLabelText(/montant item/i), '500');
    
    await userEvent.click(addItemButton);
    await userEvent.type(screen.getAllByLabelText(/montant item/i)[1], '300');

    expect(screen.getByDisplayValue('800')).toBeInTheDocument();
  });
});
```

---

## 🔧 TESTS UTILITAIRES

### Tests de Validation

```typescript
// __tests__/validation.test.ts
import { ValidationRules, FormValidator } from '../utils/validation';

describe('ValidationRules', () => {
  describe('required', () => {
    test('valide valeur non vide', () => {
      const rule = ValidationRules.required();
      expect(rule('test')).toBe(true);
    });

    test('invalide valeur vide', () => {
      const rule = ValidationRules.required();
      expect(rule('')).toBe(false);
    });
  });

  describe('email', () => {
    test('valide email correct', () => {
      const rule = ValidationRules.email();
      expect(rule('test@example.com')).toBe(true);
    });

    test('invalide email incorrect', () => {
      const rule = ValidationRules.email();
      expect(rule('invalid-email')).toBe(false);
    });
  });

  describe('minLength', () => {
    test('valide longueur minimale', () => {
      const rule = ValidationRules.minLength(5);
      expect(rule('hello')).toBe(true);
    });

    test('invalide longueur insuffisante', () => {
      const rule = ValidationRules.minLength(5);
      expect(rule('hi')).toBe(false);
    });
  });
});

describe('FormValidator', () => {
  test('valide champ avec règles multiples', () => {
    const validator = new FormValidator();
    
    validator.validateField('email', 'test@example.com', [
      ValidationRules.required(),
      ValidationRules.email()
    ]);

    expect(validator.hasErrors()).toBe(false);
  });

  test('détecte erreurs multiples', () => {
    const validator = new FormValidator();
    
    validator.validateField('email', 'invalid', [
      ValidationRules.required(),
      ValidationRules.email()
    ]);

    expect(validator.hasErrors()).toBe(true);
    expect(validator.getErrors().email).toContain('Format email invalide');
  });
});
```

### Tests de Services

```typescript
// __tests__/services/financeService.test.ts
import { financeService } from '../../services/financeService';

// Mock Appwrite
jest.mock('../../services/appwriteService', () => ({
  databases: {
    createDocument: jest.fn(),
    updateDocument: jest.fn(),
    deleteDocument: jest.fn(),
    listDocuments: jest.fn(),
  },
}));

describe('financeService', () => {
  describe('createInvoice', () => {
    test('crée facture avec données valides', async () => {
      const invoiceData = {
        client: 'Client Test',
        amount: 1000,
        date: '2025-12-31',
        status: 'draft'
      };

      const result = await financeService.createInvoice(invoiceData);
      
      expect(result).toBeDefined();
      expect(result.client).toBe('Client Test');
    });

    test('gère erreur création facture', async () => {
      // Mock erreur
      const mockCreateDocument = require('../../services/appwriteService').databases.createDocument;
      mockCreateDocument.mockRejectedValue(new Error('Erreur Appwrite'));

      await expect(financeService.createInvoice({})).rejects.toThrow('Erreur Appwrite');
    });
  });
});
```

---

## 📊 COUVERTURE DE TEST

### Objectifs de Couverture

| Composant | Lignes | Branches | Fonctions | Statements |
|-----------|--------|----------|-----------|------------|
| **InvoiceFormModal** | 90% | 85% | 95% | 90% |
| **ExpenseFormModal** | 90% | 85% | 95% | 90% |
| **BudgetFormModal** | 90% | 85% | 95% | 90% |
| **ContactFormModal** | 85% | 80% | 90% | 85% |
| **LeadFormModal** | 85% | 80% | 90% | 85% |
| **InteractionFormModal** | 85% | 80% | 90% | 85% |
| **Validation Utils** | 95% | 90% | 100% | 95% |
| **Services** | 80% | 75% | 85% | 80% |

### Métriques Globales

- **Lignes** : 85%
- **Branches** : 80%
- **Fonctions** : 90%
- **Statements** : 85%

---

## 🚀 IMPLÉMENTATION

### Phase 1 : Tests Critiques (2-3h)

1. **InvoiceFormModal** (1h)
   - Tests validation
   - Tests fonctionnalités
   - Tests soumission

2. **ExpenseFormModal** (1h)
   - Tests validation
   - Tests catégories
   - Tests statuts

3. **BudgetFormModal** (1h)
   - Tests items dynamiques
   - Tests calculs
   - Tests validation

### Phase 2 : Tests Importants (2-3h)

4. **ContactFormModal** (1h)
5. **LeadFormModal** (1h)
6. **InteractionFormModal** (1h)

### Phase 3 : Tests Utilitaires (1-2h)

7. **Validation Utils** (1h)
8. **Services** (1h)

### Phase 4 : Tests Accessibilité (1h)

9. **Navigation clavier**
10. **Screen readers**
11. **ARIA labels**

---

## 📋 COMMANDES DE TEST

### Exécution des Tests

```bash
# Tous les tests
npm test

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm run test:watch

# Tests spécifiques
npm test InvoiceFormModal

# Tests avec debug
npm run test:debug
```

### Scripts Package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    "test:debug": "jest --detectOpenHandles",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

---

## 🎯 RÉSULTATS ATTENDUS

### Qualité
- ✅ **85% couverture** de code
- ✅ **0 bug** critique
- ✅ **100% validation** testée
- ✅ **Accessibilité** vérifiée

### Maintenance
- ✅ **Tests rapides** (< 30s)
- ✅ **Tests fiables** (pas de flaky tests)
- ✅ **Documentation** claire
- ✅ **CI/CD** intégré

### Développement
- ✅ **Confiance** dans les refactorings
- ✅ **Détection précoce** des bugs
- ✅ **Documentation vivante** du code
- ✅ **Onboarding** facilité

---

## 🚀 PROCHAINES ÉTAPES

### Immédiat
1. Installer dépendances de test
2. Configurer Jest et Testing Library
3. Créer premiers tests critiques

### Court terme
4. Implémenter tests tous formulaires
5. Ajouter tests services
6. Configurer CI/CD

### Moyen terme
7. Tests d'intégration
8. Tests E2E
9. Tests de performance

---

**Guide créé le** : 15 Octobre 2025  
**Version** : 1.0  
**Statut** : ⏳ Prêt pour implémentation
