import React, { useState, useEffect } from 'react';
import { Lead } from '../../types';
import { crmService } from '../../services/crmService';
import { ValidationRules, FormValidator } from '../../utils/validation';

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingLead?: Lead | null;
}

const LeadFormModal: React.FC<LeadFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingLead
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    status: 'new' as 'new' | 'contacted' | 'qualified' | 'hot' | 'cold' | 'converted',
    source: 'website' as 'referral' | 'website' | 'cold_call' | 'social_media' | 'event' | 'other',
    score: '0',
    notes: '',
    lastContactDate: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statuses = [
    { value: 'new', label: 'Nouveau', color: 'blue' },
    { value: 'contacted', label: 'Contacté', color: 'yellow' },
    { value: 'qualified', label: 'Qualifié', color: 'purple' },
    { value: 'hot', label: 'Chaud', color: 'red' },
    { value: 'cold', label: 'Froid', color: 'gray' },
    { value: 'converted', label: 'Converti', color: 'green' }
  ];

  const sources = [
    { value: 'website', label: 'Site Web' },
    { value: 'referral', label: 'Référence' },
    { value: 'cold_call', label: 'Appel à froid' },
    { value: 'social_media', label: 'Réseaux sociaux' },
    { value: 'event', label: 'Événement' },
    { value: 'other', label: 'Autre' }
  ];

  useEffect(() => {
    if (editingLead) {
      setFormData({
        firstName: editingLead.firstName,
        lastName: editingLead.lastName,
        email: editingLead.email,
        phone: editingLead.phone || '',
        company: editingLead.company || '',
        position: editingLead.position || '',
        status: editingLead.status,
        source: editingLead.source,
        score: editingLead.score?.toString() || '0',
        notes: editingLead.notes || '',
        lastContactDate: editingLead.lastContactDate || ''
      });
    }
  }, [editingLead]);

  const validateForm = (): boolean => {
    const validator = new FormValidator();

    validator.validateField('firstName', formData.firstName, [
      ValidationRules.required(),
      ValidationRules.minLength(2)
    ]);

    validator.validateField('lastName', formData.lastName, [
      ValidationRules.required(),
      ValidationRules.minLength(2)
    ]);

    validator.validateField('email', formData.email, [
      ValidationRules.required(),
      ValidationRules.email()
    ]);

    if (formData.phone) {
      validator.validateField('phone', formData.phone, [
        ValidationRules.phone()
      ]);
    }

    validator.validateField('score', formData.score, [
      ValidationRules.required(),
      ValidationRules.range(0, 100)
    ]);

    setErrors(validator.getErrors());
    return !validator.hasErrors();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const leadData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        company: formData.company || undefined,
        position: formData.position || undefined,
        status: formData.status,
        source: formData.source,
        score: Number(formData.score),
        notes: formData.notes || undefined,
        lastContactDate: formData.lastContactDate || new Date().toISOString().split('T')[0]
      };

      if (editingLead) {
        await crmService.updateLead(editingLead.id, leadData);
      } else {
        await crmService.createLead(leadData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur soumission lead:', error);
      setErrors({ submit: 'Erreur lors de l\'enregistrement du lead' });
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
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingLead ? 'Modifier le lead' : 'Nouveau lead'}
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
            {/* Nom et Prénom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Marie"
                />
                {errors.firstName && (
                  <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Martin"
                />
                {errors.lastName && (
                  <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email et Téléphone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="marie.martin@example.com"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone (optionnel)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+221 77 123 45 67"
                />
                {errors.phone && (
                  <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Entreprise et Poste */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entreprise (optionnel)
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="TechStart SARL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Poste (optionnel)
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="CEO"
                />
              </div>
            </div>

            {/* Statut et Source */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => handleChange('source', e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {sources.map(source => (
                    <option key={source.value} value={source.value}>
                      {source.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Score */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Score (0-100) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.score}
                  onChange={(e) => handleChange('score', e.target.value)}
                  className="flex-1"
                />
                <input
                  type="number"
                  value={formData.score}
                  onChange={(e) => handleChange('score', e.target.value)}
                  className={`border rounded-lg px-4 py-2 w-20 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.score ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="0"
                  max="100"
                />
              </div>
              {errors.score && (
                <p className="text-red-600 text-sm mt-1">{errors.score}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                0 = Froid, 100 = Très chaud
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optionnel)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={4}
                placeholder="Notes sur ce lead..."
              />
            </div>

            {/* Date dernier contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date dernier contact (optionnel)
              </label>
              <input
                type="date"
                value={formData.lastContactDate}
                onChange={(e) => handleChange('lastContactDate', e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                  {editingLead ? 'Mettre à jour' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadFormModal;

