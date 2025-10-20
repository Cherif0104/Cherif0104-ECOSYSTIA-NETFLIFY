/**
 * 👥 MODAL GESTION D'ÉQUIPE - ECOSYSTIA
 * Gestion complète des membres d'équipe pour un projet
 */

import React, { useState, useEffect } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { Project, User } from '../types';
import { projectService } from '../services/projectService';
import Avatar from './common/Avatar';

interface TeamManagementModalProps {
  project: Project | null;
  availableUsers: User[];
  onClose: () => void;
  onUpdate: (project: Project) => void;
}

const TeamManagementModal: React.FC<TeamManagementModalProps> = ({
  project,
  availableUsers,
  onClose,
  onUpdate
}) => {
  const { t } = useLocalization();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');

  if (!project) return null;

  // Filtrer les utilisateurs disponibles (pas déjà dans l'équipe)
  const teamMemberIds = (project.team_members || []).map(memberId => 
    typeof memberId === 'string' ? memberId : memberId.id || memberId
  );
  const availableUsersFiltered = (availableUsers || []).filter(user => 
    !teamMemberIds.includes(user.id) &&
    (searchTerm === '' || 
     (user.first_name || user.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
     (user.last_name || user.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
     (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filtrer par rôle si sélectionné
  const filteredUsers = selectedRole 
    ? availableUsersFiltered.filter(user => user.role === selectedRole)
    : availableUsersFiltered;

  // Debug des utilisateurs
  useEffect(() => {
    console.log('👥 Utilisateurs disponibles:', availableUsers.length);
    console.log('🔍 Utilisateurs filtrés:', filteredUsers.length);
    console.log('📋 Membres équipe:', teamMemberIds);
  }, [availableUsers, filteredUsers, teamMemberIds]);

  const handleAddMember = async (user: User) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Ajout membre à l\'équipe:', user.email);
      console.log('📊 Projet:', project.name);
      console.log('👥 Équipe actuelle:', project.team_members);
      
      const updatedProject = await projectService.addTeamMember(project.id, user);
      if (updatedProject) {
        onUpdate(updatedProject);
        console.log('✅ Membre ajouté à l\'équipe');
      } else {
        setError('Erreur lors de l\'ajout du membre');
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'ajout du membre');
      console.error('❌ Erreur ajout membre:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedProject = await projectService.removeTeamMember(project.id, memberId);
      if (updatedProject) {
        onUpdate(updatedProject);
        console.log('✅ Membre supprimé de l\'équipe');
      }
    } catch (error: any) {
      setError(error.message);
      console.error('❌ Erreur suppression membre:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Gestion de l'équipe</h2>
              <p className="text-blue-100 mt-1">{project.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
              title="Fermer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              {error}
            </div>
          )}

          {/* Équipe actuelle */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              <i className="fas fa-users mr-2 text-blue-600"></i>
              Équipe actuelle ({(project.team_members || []).length} membres)
            </h3>
            
            {(project.team_members || []).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-users text-4xl mb-4 text-gray-300"></i>
                <p>Aucun membre dans l'équipe</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(project.team_members || []).map((memberId) => {
                  const member = availableUsers.find(user => user.id === memberId);
                  if (!member) return null;
                  
                  return (
                    <div key={memberId} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar
                          user={member}
                          size="md"
                        />
                        <div>
                          <div className="font-semibold text-gray-800">
                            {member.first_name} {member.last_name}
                          </div>
                          <div className="text-sm text-gray-600">{member.email}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                              <i className={`${getRoleIcon(member.role)} mr-1`}></i>
                              {member.role.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveMember(memberId)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ajouter des membres */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              <i className="fas fa-user-plus mr-2 text-green-600"></i>
              Ajouter des membres
            </h3>

            {/* Filtres */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:w-48">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les rôles</option>
                  <option value="super_administrator">Super Admin</option>
                  <option value="administrator">Administrateur</option>
                  <option value="manager">Manager</option>
                  <option value="team_lead">Chef d'équipe</option>
                  <option value="developer">Développeur</option>
                  <option value="designer">Designer</option>
                  <option value="analyst">Analyste</option>
                  <option value="tester">Testeur</option>
                </select>
              </div>
            </div>

            {/* Liste des utilisateurs disponibles */}
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-search text-4xl mb-4 text-gray-300"></i>
                <p>Aucun utilisateur trouvé</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar
                          user={user}
                          size="md"
                        />
                        <div>
                          <div className="font-semibold text-gray-800">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                              <i className={`${getRoleIcon(user.role)} mr-1`}></i>
                              {user.role.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddMember(user)}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        <i className="fas fa-plus mr-2"></i>
                        Ajouter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamManagementModal;
