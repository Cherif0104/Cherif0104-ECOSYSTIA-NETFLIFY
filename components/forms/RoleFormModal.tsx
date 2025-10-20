import React, { useState, useEffect } from 'react';
import { XMarkIcon, ShieldCheckIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Role } from '../../types';
import { userManagementService } from '../../services/userManagementService';

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (role: Role) => void;
  role?: Role | null;
}

const RoleFormModal: React.FC<RoleFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  role
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions || []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        permissions: []
      });
    }
    setErrors({});
  }, [role, isOpen]);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const permissions = await userManagementService.getPermissions();
        setAvailablePermissions(permissions);
      } catch (error) {
        console.error('Erreur chargement permissions:', error);
      }
    };

    if (isOpen) {
      loadPermissions();
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du rôle est requis';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = 'Au moins une permission est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const roleData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        permissions: formData.permissions
      };

      let savedRole: Role | null;
      
      if (role) {
        savedRole = await userManagementService.updateRole(role.id, roleData);
      } else {
        savedRole = await userManagementService.createRole(roleData);
      }

      if (savedRole) {
        onSave(savedRole);
        onClose();
      } else {
        setErrors({ submit: 'Erreur lors de la sauvegarde' });
      }
    } catch (error) {
      console.error('Erreur sauvegarde rôle:', error);
      setErrors({ submit: 'Erreur lors de la sauvegarde' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePermissionToggle = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
    if (errors.permissions) {
      setErrors(prev => ({ ...prev, permissions: '' }));
    }
  };

  const handleSelectAllPermissions = () => {
    setFormData(prev => ({
      ...prev,
      permissions: availablePermissions
    }));
  };

  const handleDeselectAllPermissions = () => {
    setFormData(prev => ({
      ...prev,
      permissions: []
    }));
  };

  const getPermissionCategory = (permission: string) => {
    if (permission.includes('finance')) return 'Finance';
    if (permission.includes('projects')) return 'Projets';
    if (permission.includes('users')) return 'Utilisateurs';
    if (permission.includes('reports')) return 'Rapports';
    if (permission.includes('settings')) return 'Paramètres';
    return 'Général';
  };

  const groupedPermissions = availablePermissions.reduce((acc, permission) => {
    const category = getPermissionCategory(permission);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, string[]>);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShieldCheckIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {role ? 'Modifier le rôle' : 'Nouveau rôle'}
              </h3>
              <p className="text-sm text-gray-600">
                {role ? 'Modifiez les informations du rôle' : 'Créez un nouveau rôle avec des permissions'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nom du rôle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du rôle *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Manager, Administrateur, Utilisateur..."
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              rows={3}
              placeholder="Description du rôle et de ses responsabilités..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Permissions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Permissions *
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleSelectAllPermissions}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Tout sélectionner
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAllPermissions}
                  className="text-xs text-gray-600 hover:text-gray-800"
                >
                  Tout désélectionner
                </button>
              </div>
            </div>

            <div className="space-y-4 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
              {Object.entries(groupedPermissions).map(([category, permissions]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">{category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                    {permissions.map((permission) => (
                      <label
                        key={permission}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission)}
                          onChange={() => handlePermissionToggle(permission)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {errors.permissions && <p className="mt-1 text-sm text-red-600">{errors.permissions}</p>}
          </div>

          {/* Résumé des permissions sélectionnées */}
          {formData.permissions.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckIcon className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  {formData.permissions.length} permission(s) sélectionnée(s)
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Erreur générale */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>{role ? 'Modifier' : 'Créer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleFormModal;
