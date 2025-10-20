/**
 * 📋 MODAL DÉTAILS PROJET - ECOSYSTIA
 * Affichage complet des détails d'un projet
 */

import React from 'react';
import Avatar from './common/Avatar';
import { useLocalization } from '../contexts/LocalizationContext';
import { Project, User } from '../types';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onManageTeam: (project: Project) => void;
  canManage: boolean;
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onEdit,
  onDelete,
  onManageTeam,
  canManage
}) => {
  const { t } = useLocalization();

  if (!project) return null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Not Started': 'bg-gray-500',
      'In Progress': 'bg-blue-500',
      'Completed': 'bg-green-500',
      'On Hold': 'bg-yellow-500',
      'Cancelled': 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'Low': 'bg-green-500',
      'Medium': 'bg-yellow-500',
      'High': 'bg-orange-500',
      'Critical': 'bg-red-500'
    };
    return colors[priority] || 'bg-gray-500';
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'super_administrator': 'bg-purple-100 text-purple-800',
      'administrator': 'bg-red-100 text-red-800',
      'manager': 'bg-blue-100 text-blue-800',
      'team_lead': 'bg-green-100 text-green-800',
      'developer': 'bg-indigo-100 text-indigo-800',
      'designer': 'bg-pink-100 text-pink-800',
      'analyst': 'bg-yellow-100 text-yellow-800',
      'tester': 'bg-orange-100 text-orange-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleIcon = (role: string) => {
    const icons: Record<string, string> = {
      'super_administrator': 'fas fa-crown',
      'administrator': 'fas fa-user-shield',
      'manager': 'fas fa-user-tie',
      'team_lead': 'fas fa-users',
      'developer': 'fas fa-code',
      'designer': 'fas fa-paint-brush',
      'analyst': 'fas fa-chart-line',
      'tester': 'fas fa-bug',
    };
    return icons[role] || 'fas fa-user';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{project.title}</h2>
              <p className="text-blue-100 mt-1">Détails du projet</p>
            </div>
            <div className="flex items-center space-x-4">
              {canManage && (
                <>
                  <button
                    onClick={() => onEdit(project)}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <i className="fas fa-edit mr-2"></i>
                    Modifier
                  </button>
                  <button
                    onClick={() => onManageTeam(project)}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <i className="fas fa-users mr-2"></i>
                    Équipe
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Informations générales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Colonne gauche */}
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  <i className="fas fa-align-left mr-2 text-blue-600"></i>
                  Description
                </h3>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                  {project.description}
                </p>
              </div>

              {/* Statut et Priorité */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Statut</h4>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Priorité</h4>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </span>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Date de création</h4>
                  <p className="text-gray-600">{formatDate(project.createdAt)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Échéance</h4>
                  <p className="text-gray-600">{formatDate(project.dueDate)}</p>
                </div>
              </div>

              {/* Budget et Client */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Budget</h4>
                  <p className="text-gray-600 font-semibold">{formatCurrency(project.budget)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Client</h4>
                  <p className="text-gray-600">{project.client}</p>
                </div>
              </div>
            </div>

            {/* Colonne droite */}
            <div className="space-y-6">
              {/* Équipe */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  <i className="fas fa-users mr-2 text-green-600"></i>
                  Équipe ({project.team.length} membres)
                </h3>
                {project.team.length === 0 ? (
                  <p className="text-gray-500 italic">Aucun membre dans l'équipe</p>
                ) : (
                  <div className="space-y-3">
                    {project.team.map((member) => (
                      <div key={member.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                        <img
                          src={member.avatar}
                          alt={`${member.firstName} ${member.lastName}`}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">
                            {member.firstName} {member.lastName}
                          </div>
                          <div className="text-sm text-gray-600">{member.email}</div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                            <i className={`${getRoleIcon(member.role)} mr-1`}></i>
                            {member.role.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    <i className="fas fa-tags mr-2 text-purple-600"></i>
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tâches */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              <i className="fas fa-tasks mr-2 text-orange-600"></i>
              Tâches ({project.tasks.length})
            </h3>
            {project.tasks.length === 0 ? (
              <p className="text-gray-500 italic">Aucune tâche assignée</p>
            ) : (
              <div className="space-y-3">
                {project.tasks.map((task) => (
                  <div key={task.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{task.text}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Assigné à: {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Non assigné'}
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>Échéance: {formatDate(task.dueDate)}</span>
                          <span>Temps estimé: {task.estimatedTime}h</span>
                          <span>Temps loggé: {task.loggedTime}h</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full text-white ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full text-white ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Risques */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              <i className="fas fa-exclamation-triangle mr-2 text-red-600"></i>
              Risques ({project.risks.length})
            </h3>
            {project.risks.length === 0 ? (
              <p className="text-gray-500 italic">Aucun risque identifié</p>
            ) : (
              <div className="space-y-3">
                {project.risks.map((risk) => (
                  <div key={risk.id} className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <div className="font-medium text-red-800">{risk.description}</div>
                    <div className="text-sm text-red-600 mt-2">
                      Probabilité: {risk.likelihood} | Impact: {risk.impact}
                    </div>
                    {risk.mitigationStrategy && (
                      <div className="text-sm text-red-700 mt-2">
                        <strong>Stratégie d'atténuation:</strong> {risk.mitigationStrategy}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Créé le {formatDate(project.createdAt)} • Modifié le {formatDate(project.updatedAt)}
          </div>
          <div className="flex space-x-3">
            {canManage && (
              <button
                onClick={() => onDelete(project.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <i className="fas fa-trash mr-2"></i>
                Supprimer
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailModal;
