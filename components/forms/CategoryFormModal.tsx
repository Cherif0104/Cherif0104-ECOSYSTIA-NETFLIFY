import React, { useState, useEffect } from 'react';
import { KnowledgeCategory } from '../../types';
import { knowledgeBaseService } from '../../services/knowledgeBaseService';
import { ValidationRules, FormValidator } from '../../utils/validation';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingCategory?: KnowledgeCategory | null;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingCategory
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'blue' as 'blue' | 'green' | 'purple' | 'orange' | 'red'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colors = [
    { value: 'blue', label: 'Bleu', bgClass: 'bg-blue-500', textClass: 'text-blue-700' },
    { value: 'green', label: 'Vert', bgClass: 'bg-green-500', textClass: 'text-green-700' },
    { value: 'purple', label: 'Violet', bgClass: 'bg-purple-500', textClass: 'text-purple-700' },
    { value: 'orange', label: 'Orange', bgClass: 'bg-orange-500', textClass: 'text-orange-700' },
    { value: 'red', label: 'Rouge', bgClass: 'bg-red-500', textClass: 'text-red-700' }
  ];

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        description: editingCategory.description,
        color: editingCategory.color
      });
    }
  }, [editingCategory]);

  const validateForm = (): boolean => {
    const validator = new FormValidator();

    validator.validateField('name', formData.name, [
      ValidationRules.required(),
      ValidationRules.minLength(3)
    ]);

    setErrors(validator.getErrors());
    return !validator.hasErrors();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const categoryData: any = {
        name: formData.name,
        description: formData.description,
        color: formData.color,
        articleCount: editingCategory?.articleCount || 0
      };

      if (editingCategory) {
        await knowledgeBaseService.updateCategory(editingCategory.id, categoryData);
      } else {
        await knowledgeBaseService.createCategory(categoryData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur soumission catégorie:', error);
      setErrors({ submit: 'Erreur lors de l\'enregistrement de la catégorie' });
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
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la catégorie <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Développement Web"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optionnel)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                rows={3}
                placeholder="Description de la catégorie..."
              />
            </div>

            {/* Couleur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur
              </label>
              <div className="grid grid-cols-5 gap-3">
                {colors.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleChange('color', color.value)}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      formData.color === color.value
                        ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-900'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div className={`w-full h-8 rounded ${color.bgClass}`}></div>
                    <p className="text-xs text-center mt-1 text-gray-600">{color.label}</p>
                    {formData.color === color.value && (
                      <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                        <i className="fas fa-check text-green-600 text-xs"></i>
                      </div>
                    )}
                  </button>
                ))}
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
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50"
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
                  {editingCategory ? 'Mettre à jour' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;

