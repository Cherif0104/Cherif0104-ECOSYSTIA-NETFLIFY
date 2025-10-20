import React, { useState, useEffect } from 'react';
import { Expense } from '../../types';
import { financeService } from '../../services/financeService';
import { ValidationRules, FormValidator } from '../../utils/validation';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingExpense?: Expense | null;
}

const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingExpense
}) => {
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'pending' as 'pending' | 'paid' | 'approved' | 'rejected',
    budgetItemId: '',
    receipt: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Bureau',
    'Transport',
    'Équipement',
    'Marketing',
    'Formation',
    'Logiciels',
    'Salaires',
    'Loyer',
    'Utilities',
    'Autre'
  ];

  useEffect(() => {
    if (editingExpense) {
      setFormData({
        category: editingExpense.category,
        description: editingExpense.description,
        amount: editingExpense.amount.toString(),
        date: editingExpense.date,
        dueDate: editingExpense.dueDate || '',
        status: editingExpense.status,
        budgetItemId: editingExpense.budgetItemId || '',
        receipt: editingExpense.receipt || ''
      });
    } else {
      setFormData(prev => ({
        ...prev,
        date: new Date().toISOString().split('T')[0]
      }));
    }
  }, [editingExpense]);

  const validateForm = (): boolean => {
    const validator = new FormValidator();

    validator.validateField('category', formData.category, [
      ValidationRules.required()
    ]);

    validator.validateField('description', formData.description, [
      ValidationRules.required(),
      ValidationRules.minLength(5)
    ]);

    validator.validateField('amount', formData.amount, [
      ValidationRules.required(),
      ValidationRules.positiveNumber()
    ]);

    validator.validateField('date', formData.date, [
      ValidationRules.required()
    ]);

    setErrors(validator.getErrors());
    return !validator.hasErrors();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const expenseData: any = {
        category: formData.category,
        description: formData.description,
        amount: Number(formData.amount),
        date: formData.date,
        dueDate: formData.dueDate || undefined,
        status: formData.status,
        budgetItemId: formData.budgetItemId || undefined,
        receipt: formData.receipt || undefined
      };

      if (editingExpense) {
        await financeService.updateExpense(editingExpense.id, expenseData);
      } else {
        await financeService.createExpense(expenseData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur soumission dépense:', error);
      setErrors({ submit: 'Erreur lors de l\'enregistrement de la dépense' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingExpense ? 'Modifier la dépense' : 'Nouvelle dépense'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-600 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={3}
                placeholder="Décrivez la dépense..."
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length} caractères (minimum 5)
              </p>
            </div>

            {/* Montant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant (XOF) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="150000"
                min="0"
                step="1000"
              />
              {errors.amount && (
                <p className="text-red-600 text-sm mt-1">{errors.amount}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de la dépense <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date && (
                <p className="text-red-600 text-sm mt-1">{errors.date}</p>
              )}
            </div>

            {/* Date d'échéance (optionnel) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date d'échéance (optionnel)
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="pending">En attente</option>
                <option value="approved">Approuvée</option>
                <option value="paid">Payée</option>
                <option value="rejected">Rejetée</option>
              </select>
            </div>

            {/* Reçu (optionnel) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reçu / Pièce jointe (optionnel)
              </label>
              <input
                type="text"
                value={formData.receipt}
                onChange={(e) => handleChange('receipt', e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="URL ou référence du reçu"
              />
            </div>

            {/* Erreur générale */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                {errors.submit}
              </div>
            )}
          </div>

          {/* Boutons */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Enregistrement...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  {editingExpense ? 'Mettre à jour' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseFormModal;

