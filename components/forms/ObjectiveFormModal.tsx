import React, { useState, useEffect } from 'react';
import { Objective } from '../../types';
import { ValidationRules, FormValidator } from '../../utils/validation';

interface ObjectiveFormModalProps {
  objective: Objective | null;
  onClose: () => void;
  onSave: (data: any) => void;
}

const ObjectiveFormModal: React.FC<ObjectiveFormModalProps> = ({
  objective,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical',
    status: 'Not Started' as 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled',
    startDate: '',
    endDate: '',
    progress: 0,
    owner: '',
    team: [] as string[],
    period: 'Q1' as 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Annual',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (objective) {
      setFormData({
        title: objective.title,
        description: objective.description || '',
        category: objective.category || '',
        priority: objective.priority || 'Medium',
        status: objective.status || 'Not Started',
        startDate: objective.startDate?.split('T')[0] || '',
        endDate: objective.endDate?.split('T')[0] || '',
        progress: objective.progress || 0,
        owner: objective.owner || '',
        team: objective.team || [],
        period: objective.period || 'Q1',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'Medium',
        status: 'Not Started',
        startDate: '',
        endDate: '',
        progress: 0,
        owner: '',
        team: [],
        period: 'Q1',
      });
    }
  }, [objective]);

  const validateForm = (): boolean => {
    const validator = new FormValidator();

    validator.validateField('title', formData.title, [
      ValidationRules.required(),
      ValidationRules.minLength(3)
    ]);

    validator.validateField('owner', formData.owner, [
      ValidationRules.required()
    ]);

    validator.validateField('startDate', formData.startDate, [
      ValidationRules.required()
    ]);

    validator.validateField('endDate', formData.endDate, [
      ValidationRules.required()
    ]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      if (objective) {
        onSave({ ...objective, ...formData });
      } else {
        onSave(formData);
      }
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {objective ? 'Modifier l\'objectif' : 'Nouvel objectif'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-green-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Augmenter les revenus de 25%"
              />
              {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder="Description détaillée de l'objectif..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Période <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.period}
                  onChange={(e) => handleChange('period', e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-green-500"
                >
                  <option value="Q1">Q1 (Janvier - Mars)</option>
                  <option value="Q2">Q2 (Avril - Juin)</option>
                  <option value="Q3">Q3 (Juillet - Septembre)</option>
                  <option value="Q4">Q4 (Octobre - Décembre)</option>
                  <option value="Annual">Annuel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priorité <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-green-500"
                >
                  <option value="High">Haute</option>
                  <option value="Medium">Moyenne</option>
                  <option value="Low">Basse</option>
                  <option value="Critical">Critique</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsable <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.owner}
                  onChange={(e) => handleChange('owner', e.target.value)}
                  className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-green-500 ${errors.owner ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Nom du responsable"
                />
                {errors.owner && <p className="text-red-600 text-sm mt-1">{errors.owner}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-green-500"
                >
                  <option value="Not Started">Non démarré</option>
                  <option value="In Progress">En cours</option>
                  <option value="Completed">Terminé</option>
                  <option value="On Hold">En attente</option>
                  <option value="Cancelled">Annulé</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-green-500 ${errors.startDate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.startDate && <p className="text-red-600 text-sm mt-1">{errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-green-500 ${errors.endDate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.endDate && <p className="text-red-600 text-sm mt-1">{errors.endDate}</p>}
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                {errors.submit}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <i className="fas fa-save mr-2"></i>
              {objective ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ObjectiveFormModal;