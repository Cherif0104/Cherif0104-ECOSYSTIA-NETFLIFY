import React, { useState, useEffect } from 'react';
import { Budget } from '../../types';
import { financeService } from '../../services/financeService';
import { ValidationRules, FormValidator } from '../../utils/validation';

interface BudgetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingBudget?: Budget | null;
}

const BudgetFormModal: React.FC<BudgetFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingBudget
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'project' as 'project' | 'department' | 'annual' | 'monthly',
    totalAmount: '',
    spentAmount: '0',
    startDate: '',
    endDate: '',
    items: [] as Array<{ name: string; amount: number; spent: number }>
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingBudget) {
      setFormData({
        name: editingBudget.name,
        type: editingBudget.type,
        totalAmount: editingBudget.totalAmount.toString(),
        spentAmount: editingBudget.spentAmount?.toString() || '0',
        startDate: editingBudget.startDate,
        endDate: editingBudget.endDate,
        items: editingBudget.items || []
      });
    }
  }, [editingBudget]);

  const validateForm = (): boolean => {
    const validator = new FormValidator();

    validator.validateField('name', formData.name, [
      ValidationRules.required(),
      ValidationRules.minLength(3)
    ]);

    validator.validateField('totalAmount', formData.totalAmount, [
      ValidationRules.required(),
      ValidationRules.positiveNumber()
    ]);

    validator.validateField('startDate', formData.startDate, [
      ValidationRules.required()
    ]);

    validator.validateField('endDate', formData.endDate, [
      ValidationRules.required()
    ]);

    // Vérifier que la date de fin est après la date de début
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
        validator.setError('endDate', 'La date de fin doit être après la date de début');
      }
    }

    setErrors(validator.getErrors());
    return !validator.hasErrors();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const budgetData: any = {
        name: formData.name,
        type: formData.type,
        totalAmount: Number(formData.totalAmount),
        spentAmount: Number(formData.spentAmount),
        startDate: formData.startDate,
        endDate: formData.endDate,
        items: formData.items
      };

      if (editingBudget) {
        await financeService.updateBudget(editingBudget.id, budgetData);
      } else {
        await financeService.createBudget(budgetData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur soumission budget:', error);
      setErrors({ submit: 'Erreur lors de l\'enregistrement du budget' });
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

  const addBudgetItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', amount: 0, spent: 0 }]
    }));
  };

  const updateBudgetItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeBudgetItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingBudget ? 'Modifier le budget' : 'Nouveau budget'}
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
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du budget <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Budget Marketing Q1 2025"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="project">Projet</option>
                <option value="department">Département</option>
                <option value="annual">Annuel</option>
                <option value="monthly">Mensuel</option>
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && (
                  <p className="text-red-600 text-sm mt-1">{errors.startDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && (
                  <p className="text-red-600 text-sm mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* Montants */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant total (XOF) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => handleChange('totalAmount', e.target.value)}
                  className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.totalAmount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="5000000"
                  min="0"
                  step="100000"
                />
                {errors.totalAmount && (
                  <p className="text-red-600 text-sm mt-1">{errors.totalAmount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant dépensé (XOF)
                </label>
                <input
                  type="number"
                  value={formData.spentAmount}
                  onChange={(e) => handleChange('spentAmount', e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                  step="100000"
                />
              </div>
            </div>

            {/* Items budgétaires */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Items budgétaires (optionnel)
                </label>
                <button
                  type="button"
                  onClick={addBudgetItem}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  <i className="fas fa-plus mr-1"></i>
                  Ajouter un item
                </button>
              </div>

              {formData.items.length > 0 && (
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateBudgetItem(index, 'name', e.target.value)}
                        className="border border-gray-300 rounded px-3 py-1.5 flex-1 text-sm"
                        placeholder="Nom de l'item"
                      />
                      <input
                        type="number"
                        value={item.amount}
                        onChange={(e) => updateBudgetItem(index, 'amount', Number(e.target.value))}
                        className="border border-gray-300 rounded px-3 py-1.5 w-32 text-sm"
                        placeholder="Montant"
                        min="0"
                      />
                      <input
                        type="number"
                        value={item.spent}
                        onChange={(e) => updateBudgetItem(index, 'spent', Number(e.target.value))}
                        className="border border-gray-300 rounded px-3 py-1.5 w-32 text-sm"
                        placeholder="Dépensé"
                        min="0"
                      />
                      <button
                        type="button"
                        onClick={() => removeBudgetItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                  {editingBudget ? 'Mettre à jour' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetFormModal;

