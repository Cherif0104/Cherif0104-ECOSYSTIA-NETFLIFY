import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserGroupIcon,
  UserPlusIcon,
  UserMinusIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  KeyIcon,
  CogIcon,
  BellIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { User, Role } from '../types';
import { useLocalization } from '../contexts/LocalizationContext';
import { userManagementService } from '../services/userManagementService';
import UserFormModal from './forms/UserFormModal';
import RoleFormModal from './forms/RoleFormModal';

const UserManagementUltraModernV2: React.FC = () => {
  const { t } = useLocalization();
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions'>('users');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour les données
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  // Charger les données depuis le service
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [usersData, rolesData] = await Promise.all([
          userManagementService.getUsers(),
          userManagementService.getRoles()
        ]);
        
        setUsers(usersData);
        setRoles(rolesData);
      } catch (error) {
        console.error('Erreur chargement données User Management:', error);
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Métriques calculées
  const metrics = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const inactiveUsers = users.filter(u => u.status === 'inactive').length;
    const adminUsers = users.filter(u => u.role === 'admin').length;
    const managerUsers = users.filter(u => u.role === 'manager').length;
    const regularUsers = users.filter(u => u.role === 'user').length;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      managerUsers,
      regularUsers,
      activePercentage: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
      adminPercentage: totalUsers > 0 ? Math.round((adminUsers / totalUsers) * 100) : 0
    };
  }, [users]);

  // Filtrage des données
  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    return filtered;
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Handlers
  const handleCreateUser = () => {
    setEditingUser(null);
    setShowUserModal(true);
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setShowRoleModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setShowRoleModal(true);
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      const success = await userManagementService.deleteUser(id);
      if (success) {
        setUsers(users.filter(u => u.id !== id));
      }
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) {
      const success = await userManagementService.deleteRole(id);
      if (success) {
        setRoles(roles.filter(r => r.id !== id));
      }
    }
  };

  const handleToggleUserStatus = async (id: string) => {
    const updatedUser = await userManagementService.toggleUserStatus(id);
    if (updatedUser) {
      setUsers(users.map(u => u.id === id ? updatedUser : u));
    }
  };

  const handleSaveUser = (user: User) => {
    if (editingUser) {
      setUsers(users.map(u => u.id === user.id ? user : u));
    } else {
      setUsers([...users, user]);
    }
  };

  const handleSaveRole = (role: Role) => {
    if (editingRole) {
      setRoles(roles.map(r => r.id === role.id ? role : r));
    } else {
      setRoles([...roles, role]);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersData, rolesData] = await Promise.all([
        userManagementService.getUsers(),
        userManagementService.getRoles()
      ]);
      
      setUsers(usersData);
      setRoles(rolesData);
    } catch (error) {
      setError('Erreur lors du rechargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = (type: 'pdf' | 'excel') => {
    console.log(`Export ${type} des données User Management`);
    // Logique d'export à implémenter
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management UltraModern V2</h1>
            <p className="text-gray-600">Gestion complète des utilisateurs, rôles et permissions</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleExport('pdf')}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                <span>Excel</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Message d'erreur */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Utilisateurs</p>
              <p className="text-3xl font-bold text-blue-900">{metrics.totalUsers}</p>
              <p className="text-blue-700 text-sm">
                {metrics.activePercentage}% actifs
              </p>
            </div>
            <div className="p-3 bg-blue-500 rounded-lg">
              <UserGroupIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Utilisateurs Actifs</p>
              <p className="text-3xl font-bold text-green-900">{metrics.activeUsers}</p>
              <p className="text-green-700 text-sm">
                {metrics.inactiveUsers} inactifs
              </p>
            </div>
            <div className="p-3 bg-green-500 rounded-lg">
              <CheckCircleIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Administrateurs</p>
              <p className="text-3xl font-bold text-purple-900">{metrics.adminUsers}</p>
              <p className="text-purple-700 text-sm">
                {metrics.adminPercentage}% du total
              </p>
            </div>
            <div className="p-3 bg-purple-500 rounded-lg">
              <ShieldCheckIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Rôles Configurés</p>
              <p className="text-3xl font-bold text-orange-900">{roles.length}</p>
              <p className="text-orange-700 text-sm">
                {metrics.managerUsers} managers
              </p>
            </div>
            <div className="p-3 bg-orange-500 rounded-lg">
              <KeyIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions Rapides */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={handleCreateUser}
            className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <UserPlusIcon className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-blue-900">Nouvel Utilisateur</span>
          </button>
          <button
            onClick={handleCreateRole}
            className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <KeyIcon className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-green-900">Nouveau Rôle</span>
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <ShieldCheckIcon className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-purple-900">Gérer Permissions</span>
          </button>
          <button
            onClick={handleRefresh}
            className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowPathIcon className="h-8 w-8 text-gray-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Actualiser</span>
          </button>
        </div>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des utilisateurs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Administrateur</option>
              <option value="manager">Manager</option>
              <option value="user">Utilisateur</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'users', name: 'Utilisateurs', icon: UserGroupIcon, count: users.length },
              { id: 'roles', name: 'Rôles', icon: KeyIcon, count: roles.length },
              { id: 'permissions', name: 'Permissions', icon: ShieldCheckIcon, count: 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
                {tab.count > 0 && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <ArrowPathIcon className="h-6 w-6 animate-spin text-blue-600" />
                <span className="text-gray-600">Chargement des données...</span>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'users' && (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                  {filteredUsers.length === 0 ? (
                    <div className="col-span-full flex items-center justify-center py-12">
                      <div className="text-center">
                        <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
                        <p className="text-gray-600 mb-4">
                          {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                            ? 'Aucun utilisateur ne correspond à vos critères de recherche.'
                            : 'Commencez par ajouter votre premier utilisateur.'}
                        </p>
                        <button
                          onClick={handleCreateUser}
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <UserPlusIcon className="h-5 w-5" />
                          <span>Ajouter un utilisateur</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div key={user.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <UserGroupIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{user.name}</h4>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <KeyIcon className="h-4 w-4" />
                            <span>{user.role}</span>
                          </div>
                          {user.department && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <BuildingOfficeIcon className="h-4 w-4" />
                              <span>{user.department}</span>
                            </div>
                          )}
                          {user.phone && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <PhoneIcon className="h-4 w-4" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(user.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                user.status === 'active' 
                                  ? 'text-orange-600 hover:bg-orange-100' 
                                  : 'text-green-600 hover:bg-green-100'
                              }`}
                            >
                              {user.status === 'active' ? <UserMinusIcon className="h-4 w-4" /> : <UserPlusIcon className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'roles' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {roles.length === 0 ? (
                    <div className="col-span-full flex items-center justify-center py-12">
                      <div className="text-center">
                        <ShieldCheckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun rôle trouvé</h3>
                        <p className="text-gray-600 mb-4">
                          Commencez par créer votre premier rôle avec des permissions.
                        </p>
                        <button
                          onClick={handleCreateRole}
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <PlusIcon className="h-5 w-5" />
                          <span>Créer un rôle</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    roles.map((role) => (
                      <div key={role.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <KeyIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{role.name}</h4>
                              <p className="text-sm text-gray-600">{role.description}</p>
                            </div>
                          </div>
                          <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-medium rounded-full">
                            {role.userCount} utilisateurs
                          </span>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Permissions :</p>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.slice(0, 3).map((permission) => (
                              <span key={permission} className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded-full">
                                {permission}
                              </span>
                            ))}
                            {role.permissions.length > 3 && (
                              <span className="bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded-full">
                                +{role.permissions.length - 3} autres
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditRole(role)}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRole(role.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(role.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'permissions' && (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <ShieldCheckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestion des Permissions</h3>
                  <p className="text-gray-600 mb-4">
                    Configurez les permissions détaillées pour chaque rôle et fonctionnalité.
                  </p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Configurer les Permissions
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Modals */}
      <UserFormModal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUser}
        user={editingUser}
        roles={roles.map(role => ({ id: role.id, name: role.name }))}
      />

      <RoleFormModal
        isOpen={showRoleModal}
        onClose={() => {
          setShowRoleModal(false);
          setEditingRole(null);
        }}
        onSave={handleSaveRole}
        role={editingRole}
      />
    </div>
  );
};

export default UserManagementUltraModernV2;
