/**
 * 📝 FORMULAIRE PROJET - ECOSYSTIA
 * Formulaire moderne pour créer/modifier des projets
 */

import React, { useState, useEffect } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { Project, User } from '../types';
import TeamSelect from './common/TeamSelect';
import TagInput from './common/TagInput';
import { ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface ProjectFormModalProps {
  project: Project | null;
  users: User[];
  onClose: () => void;
  onSave: (project: Project | Omit<Project, 'id'>) => void;
}

const ProjectFormModal: React.FC<ProjectFormModalProps> = ({ 
  project, 
  users, 
  onClose, 
  onSave 
}) => {
  const { t } = useLocalization();
  const isEditMode = project !== null;
  
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    status: project?.status || 'Not Started',
    priority: project?.priority || 'Medium',
    startDate: project?.startDate || '',  // AJOUTÉ pour alignement MVP client
    dueDate: project?.dueDate || '',
    budget: project?.budget || '',
    client: project?.client || '',
    tags: project?.tags || [],  // MODIFIÉ pour utiliser TagInput
    team: project?.team?.map(u => u.id) || [],
  });
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<User[]>(project?.team || []);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Validation améliorée inspirée du MVP client
  const validateField = (field: string, value: any): string | null => {
    if (field === 'title' && !value?.trim()) {
      return 'Le titre est requis';
    }
    if (field === 'title' && value?.length > 100) {
      return 'Le titre ne doit pas dépasser 100 caractères';
    }
    if (field === 'startDate' && field === 'dueDate') {
      if (formData.startDate && formData.dueDate && new Date(formData.startDate) > new Date(formData.dueDate)) {
        return 'La date de début doit être antérieure à la date de fin';
      }
    }
    if (field === 'budget' && value && isNaN(Number(value))) {
      return 'Le budget doit être un nombre valide';
    }
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validation en temps réel
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    } else {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };



  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est obligatoire';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est obligatoire';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'La date d\'échéance est obligatoire';
    } else {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        newErrors.dueDate = 'La date d\'échéance ne peut pas être dans le passé';
      }
    }

    if (formData.budget && isNaN(Number(formData.budget))) {
      newErrors.budget = 'Le budget doit être un nombre valide';
    }

    if (formData.team.length === 0) {
      newErrors.team = 'Au moins un membre d\'équipe est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const teamMembers = users.filter(u => formData.team.includes(u.id));

      const projectData = {
        ...(isEditMode ? { id: project!.id } : {}),
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status as Project['status'],
        priority: formData.priority as Project['priority'],
        startDate: formData.startDate || undefined,  // AJOUTÉ
        dueDate: formData.dueDate,
        budget: formData.budget ? Number(formData.budget) : undefined,
        client: formData.client.trim() || undefined,
        tags: formData.tags,  // MODIFIÉ pour utiliser directement le tableau
        team: teamMembers,
        tasks: project?.tasks || [],
        risks: project?.risks || [],
        ...(isEditMode ? {} : { createdAt: new Date().toISOString() }),
        updatedAt: new Date().toISOString(),
      };

      onSave(projectData as Project | Omit<Project, 'id'>);
      
      // Feedback de succès
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setErrors({ submit: 'Erreur lors de la sauvegarde du projet' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Modifier le projet' : 'Créer un nouveau projet'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="p-6 flex-grow overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Colonne gauche */}
              <div className="space-y-6">
                {/* Titre */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-heading mr-2 text-blue-600"></i>
                    Titre du projet *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nom du projet..."
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-align-left mr-2 text-blue-600"></i>
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Description détaillée du projet..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                {/* Statut et Priorité */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <i className="fas fa-flag mr-2 text-blue-600"></i>
                      Statut
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="Not Started">Non démarré</option>
                      <option value="In Progress">En cours</option>
                      <option value="Completed">Terminé</option>
                      <option value="On Hold">En pause</option>
                      <option value="Cancelled">Annulé</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <i className="fas fa-exclamation-triangle mr-2 text-blue-600"></i>
                      Priorité
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="Low">Faible</option>
                      <option value="Medium">Moyenne</option>
                      <option value="High">Élevée</option>
                      <option value="Critical">Critique</option>
                    </select>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <i className="fas fa-calendar mr-2 text-blue-600"></i>
                      Date de début
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.startDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.startDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <i className="fas fa-calendar-alt mr-2 text-blue-600"></i>
                      Date d'échéance *
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.dueDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.dueDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Colonne droite */}
              <div className="space-y-6">
                {/* Budget */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-money-bill-wave mr-2 text-blue-600"></i>
                    Budget (FCFA)
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.budget ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                    min="0"
                  />
                  {errors.budget && (
                    <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
                  )}
                </div>

                {/* Client */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-building mr-2 text-blue-600"></i>
                    Client
                  </label>
                  <input
                    type="text"
                    name="client"
                    value={formData.client}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Nom du client..."
                  />
                </div>

                {/* Tags */}
                <div>
                  <TagInput
                    tags={formData.tags}
                    onTagsChange={(tags) => setFormData({ ...formData, tags })}
                    suggestions={['Frontend', 'Backend', 'Mobile', 'DevOps', 'Design', 'Marketing', 'Sales', 'Support']}
                    label="Tags du projet"
                    placeholder="Ajouter des tags..."
                    maxTags={10}
                  />
                </div>

                {/* Équipe */}
                <div>
                  <TeamSelect
                    users={users}
                    selectedTeam={formData.team}
                    onChange={(selectedIds) => setFormData(prev => ({ ...prev, team: selectedIds }))}
                  />
                  {errors.team && (
                    <p className="mt-1 text-sm text-red-600">{errors.team}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Messages de feedback */}
          {submitSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mx-6 mb-4">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                <p className="text-green-800 font-medium">
                  {isEditMode ? 'Projet mis à jour avec succès !' : 'Projet créé avec succès !'}
                </p>
              </div>
            </div>
          )}
          
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mx-6 mb-4">
              <div className="flex items-center">
                <ExclamationCircleIcon className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-800 font-medium">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
            >
              {isSubmitting ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  {isEditMode ? 'Mettre à jour' : 'Créer le projet'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectFormModal;
