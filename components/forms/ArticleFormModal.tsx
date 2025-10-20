import React, { useState, useEffect } from 'react';
import { KnowledgeArticle } from '../../types';
import { knowledgeBaseService } from '../../services/knowledgeBaseService';
import { ValidationRules, FormValidator } from '../../utils/validation';
import { useAuth } from '../../contexts/AuthContextSupabase';

interface ArticleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingArticle?: KnowledgeArticle | null;
  categories?: Array<{ name: string; color: string }>;
}

const ArticleFormModal: React.FC<ArticleFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingArticle,
  categories = []
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: '',
    type: 'article' as 'article' | 'tutorial' | 'faq' | 'guide',
    tags: [] as string[],
    author: user?.name || '',
    status: 'draft' as 'draft' | 'published' | 'archived'
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingArticle) {
      setFormData({
        title: editingArticle.title,
        summary: editingArticle.summary,
        content: editingArticle.content,
        category: editingArticle.category,
        type: editingArticle.type,
        tags: editingArticle.tags || [],
        author: editingArticle.author,
        status: editingArticle.status
      });
    } else if (user) {
      setFormData(prev => ({ ...prev, author: user.name }));
    }
  }, [editingArticle, user]);

  const validateForm = (): boolean => {
    const validator = new FormValidator();

    validator.validateField('title', formData.title, [
      ValidationRules.required(),
      ValidationRules.minLength(3)
    ]);

    validator.validateField('summary', formData.summary, [
      ValidationRules.required(),
      ValidationRules.maxLength(200)
    ]);

    validator.validateField('content', formData.content, [
      ValidationRules.required(),
      ValidationRules.minLength(100)
    ]);

    validator.validateField('category', formData.category, [
      ValidationRules.required()
    ]);

    validator.validateField('author', formData.author, [
      ValidationRules.required()
    ]);

    if (formData.tags.length === 0) {
      validator.setError('tags', 'Au moins un tag est requis');
    }

    setErrors(validator.getErrors());
    return !validator.hasErrors();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const articleData: any = {
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        category: formData.category,
        type: formData.type,
        tags: formData.tags,
        author: formData.author,
        status: formData.status,
        views: editingArticle?.views || 0,
        rating: editingArticle?.rating || 0,
        helpful: editingArticle?.helpful || 0
      };

      if (editingArticle) {
        await knowledgeBaseService.updateArticle(editingArticle.id, articleData);
      } else {
        await knowledgeBaseService.createArticle(articleData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur soumission article:', error);
      setErrors({ submit: 'Erreur lors de l\'enregistrement de l\'article' });
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

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
      if (errors.tags) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.tags;
          return newErrors;
        });
      }
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingArticle ? 'Modifier l\'article' : 'Nouvel article'}
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
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Titre de l'article..."
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Résumé */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Résumé <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) => handleChange('summary', e.target.value)}
                className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.summary ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={2}
                placeholder="Résumé court de l'article..."
                maxLength={200}
              />
              {errors.summary && (
                <p className="text-red-600 text-sm mt-1">{errors.summary}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.summary.length}/200 caractères
              </p>
            </div>

            {/* Contenu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenu <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.content ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={10}
                placeholder="Contenu détaillé de l'article (minimum 100 caractères)..."
              />
              {errors.content && (
                <p className="text-red-600 text-sm mt-1">{errors.content}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.content.length} caractères (minimum 100)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Catégorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-600 text-sm mt-1">{errors.category}</p>
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
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="article">Article</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="faq">FAQ</option>
                  <option value="guide">Guide</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagInputKeyPress}
                  className="border border-gray-300 rounded-lg px-4 py-2 flex-1 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Ajouter un tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              {errors.tags && (
                <p className="text-red-600 text-sm mt-1">{errors.tags}</p>
              )}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-teal-600 hover:text-teal-800"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Auteur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Auteur <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => handleChange('author', e.target.value)}
                  className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.author ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nom de l'auteur"
                />
                {errors.author && (
                  <p className="text-red-600 text-sm mt-1">{errors.author}</p>
                )}
              </div>

              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié</option>
                  <option value="archived">Archivé</option>
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
                  {editingArticle ? 'Mettre à jour' : 'Publier'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArticleFormModal;

