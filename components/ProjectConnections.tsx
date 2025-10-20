/**
 * 🔗 COMPOSANT CONNEXIONS PROJET - ECOSYSTIA
 * Affichage des connexions entre un projet et ses modules associés
 */

import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { projectConnectionsService } from '../services/projectConnectionsService';

interface ProjectConnectionsProps {
  project: Project;
  onNavigate: (module: string, projectId: string) => void;
}

interface ProjectSummary {
  project: Project | null;
  stats: {
    tasks: {
      total: number;
      completed: number;
      inProgress: number;
      pending: number;
    };
    risks: {
      total: number;
      high: number;
      medium: number;
      low: number;
    };
    budget: {
      allocated: number;
      spent: number;
      remaining: number;
      utilization: number;
    };
    finance: {
      totalInvoices: number;
      totalExpenses: number;
      netProfit: number;
    };
    time: {
      totalLogged: number;
      averagePerTask: number;
    };
    collaboration: {
      meetings: number;
      documents: number;
    };
  };
}

const ProjectConnections: React.FC<ProjectConnectionsProps> = ({ project, onNavigate }) => {
  const [summary, setSummary] = useState<ProjectSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjectSummary();
  }, [project.id]);

  const loadProjectSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const projectSummary = await projectConnectionsService.getProjectSummary(project.id);
      setSummary(projectSummary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
      console.error('Erreur chargement résumé projet:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? mins.toString().padStart(2, '0') : ''}`;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 30) return 'text-green-600 bg-green-100';
    if (percentage < 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-red-500 text-3xl mb-3"></i>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadProjectSummary}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-redo mr-2"></i>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="text-center text-gray-500">
          <i className="fas fa-info-circle text-2xl mb-2"></i>
          <p>Aucune donnée disponible pour ce projet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-emerald-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <i className="fas fa-project-diagram mr-3 text-blue-600"></i>
              Connexions du projet
            </h2>
            <p className="text-gray-600 mt-1">
              Vue d'ensemble des modules connectés à "{project.title}"
            </p>
          </div>
          <button
            onClick={loadProjectSummary}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
            title="Actualiser les données"
          >
            <i className="fas fa-sync-alt text-lg"></i>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Tâches */}
          <div 
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all border border-blue-200"
            onClick={() => onNavigate('tasks', project.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <i className="fas fa-tasks text-blue-600 text-xl mr-3"></i>
                <h3 className="font-semibold text-gray-900">Tâches</h3>
              </div>
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {summary.stats.tasks.total}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Terminées</span>
                <span className="font-medium text-green-600">{summary.stats.tasks.completed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">En cours</span>
                <span className="font-medium text-yellow-600">{summary.stats.tasks.inProgress}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">En attente</span>
                <span className="font-medium text-gray-600">{summary.stats.tasks.pending}</span>
              </div>
            </div>
            <div className="mt-3 text-xs text-blue-600">
              <i className="fas fa-arrow-right mr-1"></i>
              Voir toutes les tâches
            </div>
          </div>

          {/* Risques */}
          <div 
            className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all border border-red-200"
            onClick={() => onNavigate('risks', project.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <i className="fas fa-exclamation-triangle text-red-600 text-xl mr-3"></i>
                <h3 className="font-semibold text-gray-900">Risques</h3>
              </div>
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                {summary.stats.risks.total}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Élevés</span>
                <span className="font-medium text-red-600">{summary.stats.risks.high}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Moyens</span>
                <span className="font-medium text-yellow-600">{summary.stats.risks.medium}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Faibles</span>
                <span className="font-medium text-green-600">{summary.stats.risks.low}</span>
              </div>
            </div>
            <div className="mt-3 text-xs text-red-600">
              <i className="fas fa-arrow-right mr-1"></i>
              Gérer les risques
            </div>
          </div>

          {/* Budget */}
          <div 
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all border border-green-200"
            onClick={() => onNavigate('budgets', project.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <i className="fas fa-coins text-green-600 text-xl mr-3"></i>
                <h3 className="font-semibold text-gray-900">Budget</h3>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getProgressColor(summary.stats.budget.utilization)}`}>
                {summary.stats.budget.utilization.toFixed(1)}%
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Alloué</span>
                <span className="font-medium text-gray-900">{formatCurrency(summary.stats.budget.allocated)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Dépensé</span>
                <span className="font-medium text-red-600">{formatCurrency(summary.stats.budget.spent)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Restant</span>
                <span className="font-medium text-green-600">{formatCurrency(summary.stats.budget.remaining)}</span>
              </div>
            </div>
            <div className="mt-3 text-xs text-green-600">
              <i className="fas fa-arrow-right mr-1"></i>
              Voir le budget
            </div>
          </div>

          {/* Finance */}
          <div 
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all border border-purple-200"
            onClick={() => onNavigate('finance', project.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <i className="fas fa-chart-line text-purple-600 text-xl mr-3"></i>
                <h3 className="font-semibold text-gray-900">Finance</h3>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${summary.stats.finance.netProfit >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {summary.stats.finance.netProfit >= 0 ? '+' : ''}{formatCurrency(summary.stats.finance.netProfit)}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Factures</span>
                <span className="font-medium text-green-600">{formatCurrency(summary.stats.finance.totalInvoices)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Dépenses</span>
                <span className="font-medium text-red-600">{formatCurrency(summary.stats.finance.totalExpenses)}</span>
              </div>
            </div>
            <div className="mt-3 text-xs text-purple-600">
              <i className="fas fa-arrow-right mr-1"></i>
              Voir les finances
            </div>
          </div>

          {/* Temps */}
          <div 
            className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all border border-orange-200"
            onClick={() => onNavigate('time', project.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <i className="fas fa-clock text-orange-600 text-xl mr-3"></i>
                <h3 className="font-semibold text-gray-900">Temps</h3>
              </div>
              <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full">
                {formatDuration(summary.stats.time.totalLogged)}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total logué</span>
                <span className="font-medium text-gray-900">{formatDuration(summary.stats.time.totalLogged)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Moyenne/tâche</span>
                <span className="font-medium text-orange-600">{formatDuration(Math.round(summary.stats.time.averagePerTask))}</span>
              </div>
            </div>
            <div className="mt-3 text-xs text-orange-600">
              <i className="fas fa-arrow-right mr-1"></i>
              Suivi du temps
            </div>
          </div>

          {/* Collaboration */}
          <div 
            className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all border border-indigo-200"
            onClick={() => onNavigate('collaboration', project.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <i className="fas fa-users text-indigo-600 text-xl mr-3"></i>
                <h3 className="font-semibold text-gray-900">Collaboration</h3>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Réunions</span>
                <span className="font-medium text-indigo-600">{summary.stats.collaboration.meetings}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Documents</span>
                <span className="font-medium text-indigo-600">{summary.stats.collaboration.documents}</span>
              </div>
            </div>
            <div className="mt-3 text-xs text-indigo-600">
              <i className="fas fa-arrow-right mr-1"></i>
              Voir la collaboration
            </div>
          </div>

        </div>

        {/* Actions rapides */}
        <div className="mt-8 pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i className="fas fa-bolt text-yellow-500 mr-2"></i>
            Actions rapides
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => onNavigate('add-task', project.id)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm"
            >
              <i className="fas fa-plus mr-2"></i>
              Nouvelle tâche
            </button>
            <button
              onClick={() => onNavigate('add-expense', project.id)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center text-sm"
            >
              <i className="fas fa-plus mr-2"></i>
              Nouvelle dépense
            </button>
            <button
              onClick={() => onNavigate('add-meeting', project.id)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center text-sm"
            >
              <i className="fas fa-plus mr-2"></i>
              Nouvelle réunion
            </button>
            <button
              onClick={() => onNavigate('add-document', project.id)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-sm"
            >
              <i className="fas fa-plus mr-2"></i>
              Nouveau document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectConnections;
