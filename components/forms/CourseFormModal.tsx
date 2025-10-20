import React, { useState, useEffect } from 'react';
import { Course } from '../../types';
import { ValidationRules, FormValidator } from '../../utils/validation';
import { coursesService } from '../../services/coursesService';

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingCourse?: Course | null;
}

const CourseFormModal: React.FC<CourseFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingCourse
}) => {
  const [formData, setFormData] = useState({
    title: '',
    instructor: '',
    description: '',
    duration: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    category: '',
    price: '',
    status: 'draft' as 'draft' | 'active' | 'completed',
    icon: 'fa-graduation-cap'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Développement Web',
    'Data Science',
    'Design',
    'Marketing',
    'Business',
    'Langues',
    'Productivité',
    'Autre'
  ];

  useEffect(() => {
    if (editingCourse) {
      setFormData({
        title: editingCourse.title,
        instructor: editingCourse.instructor,
        description: editingCourse.description,
        duration: (editingCourse.duration / 60).toString(), // minutes → heures
        level: editingCourse.level,
        category: editingCourse.category,
        price: editingCourse.price.toString(),
        status: editingCourse.status,
        icon: editingCourse.icon
      });
    }
  }, [editingCourse]);

  const validateForm = (): boolean => {
    const validator = new FormValidator();

    validator.validateField('title', formData.title, [
      ValidationRules.required(),
      ValidationRules.minLength(5)
    ]);

    validator.validateField('instructor', formData.instructor, [
      ValidationRules.required(),
      ValidationRules.minLength(3)
    ]);

    validator.validateField('description', formData.description, [
      ValidationRules.required(),
      ValidationRules.minLength(20)
    ]);

    validator.validateField('duration', formData.duration, [
      ValidationRules.required(),
      ValidationRules.positiveNumber()
    ]);

    validator.validateField('category', formData.category, [
      ValidationRules.required()
    ]);

    validator.validateField('price', formData.price, [
      ValidationRules.required(),
      ValidationRules.nonNegativeNumber()
    ]);

    setErrors(validator.getErrors());
    return !validator.hasErrors();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const courseData: any = {
        title: formData.title,
        instructor: formData.instructor,
        description: formData.description,
        duration: Number(formData.duration) * 60, // heures → minutes
        level: formData.level,
        category: formData.category,
        price: Number(formData.price),
        status: formData.status,
        icon: formData.icon,
        progress: editingCourse?.progress || 0,
        rating: editingCourse?.rating || 0,
        studentsCount: editingCourse?.studentsCount || 0,
        lessons: editingCourse?.lessons || [],
        modules: editingCourse?.modules || []
      };

      // Appeler le service de création/mise à jour de cours
      if (editingCourse) {
        await coursesService.updateCourse(editingCourse.id, courseData);
        console.log('✅ Cours mis à jour:', courseData.title);
      } else {
        await coursesService.createCourse(courseData);
        console.log('✅ Cours créé:', courseData.title);
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur soumission cours:', error);
      setErrors({ submit: 'Erreur lors de l\'enregistrement du cours' });
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
              {editingCourse ? 'Modifier le cours' : 'Nouveau cours'}
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
                Titre du cours <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Introduction au React"
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Instructeur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructeur <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.instructor}
                onChange={(e) => handleChange('instructor', e.target.value)}
                className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.instructor ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Dr. Jean Sénégal"
              />
              {errors.instructor && (
                <p className="text-red-600 text-sm mt-1">{errors.instructor}</p>
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
                rows={4}
                placeholder="Description détaillée du cours..."
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length} caractères (minimum 20)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Durée */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée totale (heures) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.duration ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="10"
                  min="0"
                  step="0.5"
                />
                {errors.duration && (
                  <p className="text-red-600 text-sm mt-1">{errors.duration}</p>
                )}
              </div>

              {/* Prix */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix (XOF) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="50000"
                  min="0"
                  step="1000"
                />
                {errors.price && (
                  <p className="text-red-600 text-sm mt-1">{errors.price}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Niveau */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => handleChange('level', e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="beginner">Débutant</option>
                  <option value="intermediate">Intermédiaire</option>
                  <option value="advanced">Avancé</option>
                </select>
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
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
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="draft">Brouillon</option>
                <option value="active">Actif</option>
                <option value="completed">Terminé</option>
              </select>
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
                  {editingCourse ? 'Mettre à jour' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseFormModal;

