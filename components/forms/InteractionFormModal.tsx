import React, { useState, useEffect } from 'react';
import { Interaction } from '../../types';
import { crmService } from '../../services/crmService';
import { ValidationRules, FormValidator } from '../../utils/validation';

interface InteractionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contactId: string;
}

const InteractionFormModal: React.FC<InteractionFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  contactId
}) => {
  const [formData, setFormData] = useState({
    type: 'email' as 'email' | 'call' | 'meeting' | 'demo',
    description: '',
    date: new Date().toISOString().split('T')[0],
    outcome: 'successful' as 'successful' | 'follow-up' | 'closed'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const interactionTypes = [
    { value: 'email', label: 'Email', icon: 'fa-envelope' },
    { value: 'call', label: 'Appel téléphonique', icon: 'fa-phone' },
    { value: 'meeting', label: 'Réunion', icon: 'fa-calendar' },
    { value: 'demo', label: 'Démonstration', icon: 'fa-presentation' }
  ];

  const validateForm = (): boolean => {
    const validator = new FormValidator();

    validator.validateField('type', formData.type, [
      ValidationRules.required()
    ]);

    validator.validateField('description', formData.description, [
      ValidationRules.required(),
      ValidationRules.minLength(10)
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
      const interactionData: Omit<Interaction, 'id' | 'contactId' | 'createdAt'> = {
        type: formData.type,
        description: formData.description,
        date: formData.date,
        outcome: formData.outcome
      };

      await crmService.logInteraction(contactId, interactionData);

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur soumission interaction:', error);
      setErrors({ submit: 'Erreur lors de l\'enregistrement de l\'interaction' });
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
              Nouvelle interaction
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'interaction <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {interactionTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleChange('type', type.value)}
                    className={`p-4 border-2 rounded-lg transition-all text-left ${
                      formData.type === type.value
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <i className={`fas ${type.icon} text-2xl mb-2 ${
                      formData.type === type.value ? 'text-purple-600' : 'text-gray-400'
                    }`}></i>
                    <p className={`font-medium ${
                      formData.type === type.value ? 'text-purple-900' : 'text-gray-700'
                    }`}>
                      {type.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={4}
                placeholder="Décrivez l'interaction avec le contact..."
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length} caractères (minimum 10)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.date && (
                  <p className="text-red-600 text-sm mt-1">{errors.date}</p>
                )}
              </div>

              {/* Résultat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Résultat <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.outcome}
                  onChange={(e) => handleChange('outcome', e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="successful">Réussi</option>
                  <option value="follow-up">À suivre</option>
                  <option value="closed">Clôturé</option>
                </select>
              </div>
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
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
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
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InteractionFormModal;

