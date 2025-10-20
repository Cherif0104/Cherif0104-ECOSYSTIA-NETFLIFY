import React, { useState, useEffect } from 'react';
import { TimeLog } from '../../types';
import { timeLogService } from '../../services/timeLogService';
import { ValidationRules, FormValidator } from '../../utils/validation';

interface TimeEntryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingTimeLog?: TimeLog | null;
  projects?: Array<{ id: string; name: string }>;
}

const TimeEntryFormModal: React.FC<TimeEntryFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingTimeLog,
  projects = []
}) => {
  const [formData, setFormData] = useState({
    projectId: '',
    taskDescription: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    hours: '',
    type: 'normal' as 'normal' | 'overtime' | 'weekend',
    billable: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingTimeLog) {
      setFormData({
        projectId: editingTimeLog.projectId || '',
        taskDescription: editingTimeLog.taskDescription,
        date: editingTimeLog.date,
        startTime: '',
        endTime: '',
        hours: editingTimeLog.hours.toString(),
        type: 'normal',
        billable: true
      });
    }
  }, [editingTimeLog]);

  const calculateHours = (start: string, end: string): number => {
    if (!start || !end) return 0;
    
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    let diff = endMinutes - startMinutes;
    if (diff < 0) diff += 24 * 60; // Handle overnight
    
    return Math.round((diff / 60) * 100) / 100;
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    const newFormData = { ...formData, [field]: value };
    
    if (field === 'startTime' || field === 'endTime') {
      if (newFormData.startTime && newFormData.endTime) {
        const calculatedHours = calculateHours(newFormData.startTime, newFormData.endTime);
        newFormData.hours = calculatedHours.toString();
      }
    }
    
    setFormData(newFormData);
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const validator = new FormValidator();

    validator.validateField('taskDescription', formData.taskDescription, [
      ValidationRules.required(),
      ValidationRules.minLength(5)
    ]);

    validator.validateField('date', formData.date, [
      ValidationRules.required()
    ]);

    if (formData.startTime && formData.endTime) {
      const hours = calculateHours(formData.startTime, formData.endTime);
      
      if (hours <= 0) {
        validator.setError('endTime', 'L\'heure de fin doit être après l\'heure de début');
      }
      
      if (hours > 24) {
        validator.setError('endTime', 'La durée ne peut pas dépasser 24 heures');
      }
    } else if (!formData.hours) {
      validator.setError('hours', 'Veuillez saisir les heures ou calculer via heure début/fin');
    }

    if (formData.hours) {
      validator.validateField('hours', formData.hours, [
        ValidationRules.required(),
        ValidationRules.positiveNumber(),
        ValidationRules.custom(
          (value) => Number(value) <= 24,
          'La durée ne peut pas dépasser 24 heures'
        )
      ]);
    }

    setErrors(validator.getErrors());
    return !validator.hasErrors();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const timeLogData: any = {
        projectId: formData.projectId || undefined,
        taskDescription: formData.taskDescription,
        hours: Number(formData.hours),
        date: formData.date
      };

      if (editingTimeLog) {
        await timeLogService.updateTimeLog(editingTimeLog.id, timeLogData);
      } else {
        await timeLogService.createTimeLog(timeLogData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur soumission temps:', error);
      setErrors({ submit: 'Erreur lors de l\'enregistrement du temps' });
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
              {editingTimeLog ? 'Modifier l\'entrée de temps' : 'Nouvelle entrée de temps'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Projet (optionnel) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Projet (optionnel)
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => handleChange('projectId', e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">Aucun projet</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tâche */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description de la tâche <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.taskDescription}
                onChange={(e) => handleChange('taskDescription', e.target.value)}
                className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                  errors.taskDescription ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={3}
                placeholder="Décrivez le travail effectué..."
              />
              {errors.taskDescription && (
                <p className="text-red-600 text-sm mt-1">{errors.taskDescription}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.taskDescription.length} caractères (minimum 5)
              </p>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date && (
                <p className="text-red-600 text-sm mt-1">{errors.date}</p>
              )}
            </div>

            {/* Heures - Méthode 1 : Calculées */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-3">Calcul automatique des heures</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure de début
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleTimeChange('startTime', e.target.value)}
                    className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                      errors.startTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.startTime && (
                    <p className="text-red-600 text-sm mt-1">{errors.startTime}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure de fin
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleTimeChange('endTime', e.target.value)}
                    className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                      errors.endTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.endTime && (
                    <p className="text-red-600 text-sm mt-1">{errors.endTime}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Heures - Méthode 2 : Saisie directe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre d'heures <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.hours}
                onChange={(e) => handleChange('hours', e.target.value)}
                className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                  errors.hours ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="8"
                min="0"
                max="24"
                step="0.25"
              />
              {errors.hours && (
                <p className="text-red-600 text-sm mt-1">{errors.hours}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Calculé automatiquement si vous saisissez début/fin, ou saisissez manuellement
              </p>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de temps
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="normal">Normal</option>
                <option value="overtime">Heures supplémentaires</option>
                <option value="weekend">Weekend</option>
              </select>
            </div>

            {/* Facturable */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="billable"
                checked={formData.billable}
                onChange={(e) => handleChange('billable', e.target.checked)}
                className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
              />
              <label htmlFor="billable" className="ml-2 text-sm text-gray-700">
                Temps facturable
              </label>
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
              className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium disabled:opacity-50"
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
                  {editingTimeLog ? 'Mettre à jour' : 'Enregistrer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimeEntryFormModal;

