import React, { useState, useEffect } from 'react';
import { Lesson } from '../../types';
import { ValidationRules, FormValidator, validateUrl } from '../../utils/validation';

interface LessonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingLesson?: Lesson | null;
  courseId?: string;
  existingOrders?: number[];
}

const LessonFormModal: React.FC<LessonFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingLesson,
  courseId,
  existingOrders = []
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    order: '',
    videoUrl: '',
    resources: [] as string[]
  });

  const [resourceInput, setResourceInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingLesson) {
      setFormData({
        title: editingLesson.title,
        description: editingLesson.description,
        duration: editingLesson.duration.toString(),
        order: editingLesson.order.toString(),
        videoUrl: editingLesson.videoUrl || '',
        resources: editingLesson.resources || []
      });
    } else {
      // Auto-suggérer le prochain ordre
      const nextOrder = existingOrders.length > 0 
        ? Math.max(...existingOrders) + 1 
        : 1;
      setFormData(prev => ({ ...prev, order: nextOrder.toString() }));
    }
  }, [editingLesson]);

  const validateForm = (): boolean => {
    const validator = new FormValidator();

    validator.validateField('title', formData.title, [
      ValidationRules.required(),
      ValidationRules.minLength(3)
    ]);

    validator.validateField('description', formData.description, [
      ValidationRules.required(),
      ValidationRules.minLength(10)
    ]);

    validator.validateField('duration', formData.duration, [
      ValidationRules.required(),
      ValidationRules.positiveNumber()
    ]);

    validator.validateField('order', formData.order, [
      ValidationRules.required(),
      ValidationRules.positiveNumber()
    ]);

    // Vérifier l'unicité de l'ordre
    const orderNum = Number(formData.order);
    if (!editingLesson && existingOrders.includes(orderNum)) {
      validator.setError('order', 'Cet ordre est déjà utilisé');
    }

    // Validation URL vidéo si renseignée
    if (formData.videoUrl && !validateUrl(formData.videoUrl)) {
      validator.setError('videoUrl', 'URL vidéo invalide');
    }

    setErrors(validator.getErrors());
    return !validator.hasErrors();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const lessonData: Lesson = {
        id: editingLesson?.id || `lesson-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        duration: Number(formData.duration),
        order: Number(formData.order),
        videoUrl: formData.videoUrl || undefined,
        resources: formData.resources.length > 0 ? formData.resources : undefined
      };

      // TODO: Appeler le service de création/mise à jour de leçon
      console.log('Leçon à enregistrer:', lessonData);
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur soumission leçon:', error);
      setErrors({ submit: 'Erreur lors de l\'enregistrement de la leçon' });
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

  const addResource = () => {
    if (resourceInput.trim() && validateUrl(resourceInput.trim())) {
      setFormData(prev => ({
        ...prev,
        resources: [...prev.resources, resourceInput.trim()]
      }));
      setResourceInput('');
    }
  };

  const removeResource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingLesson ? 'Modifier la leçon' : 'Nouvelle leçon'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre de la leçon <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Introduction aux composants React"
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title}</p>
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
                className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={3}
                placeholder="Description de la leçon..."
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Durée */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.duration ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="45"
                  min="1"
                />
                {errors.duration && (
                  <p className="text-red-600 text-sm mt-1">{errors.duration}</p>
                )}
              </div>

              {/* Ordre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordre <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => handleChange('order', e.target.value)}
                  className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.order ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="1"
                  min="1"
                />
                {errors.order && (
                  <p className="text-red-600 text-sm mt-1">{errors.order}</p>
                )}
              </div>
            </div>

            {/* URL Vidéo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Vidéo (optionnel)
              </label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => handleChange('videoUrl', e.target.value)}
                className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.videoUrl ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://youtube.com/watch?v=..."
              />
              {errors.videoUrl && (
                <p className="text-red-600 text-sm mt-1">{errors.videoUrl}</p>
              )}
            </div>

            {/* Ressources */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ressources (optionnel)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="url"
                  value={resourceInput}
                  onChange={(e) => setResourceInput(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 flex-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://example.com/resource.pdf"
                />
                <button
                  type="button"
                  onClick={addResource}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              {formData.resources.length > 0 && (
                <div className="mt-2 space-y-1">
                  {formData.resources.map((resource, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                      <a
                        href={resource}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline truncate flex-1"
                      >
                        <i className="fas fa-link mr-2"></i>
                        {resource}
                      </a>
                      <button
                        type="button"
                        onClick={() => removeResource(index)}
                        className="text-red-600 hover:text-red-700 ml-2"
                      >
                        <i className="fas fa-trash text-sm"></i>
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
                  {editingLesson ? 'Mettre à jour' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LessonFormModal;

