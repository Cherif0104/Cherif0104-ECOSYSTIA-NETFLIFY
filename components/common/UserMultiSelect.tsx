/**
 * 👥 USER MULTI SELECT
 * Composant moderne pour sélectionner plusieurs utilisateurs
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { User } from '../../types';
import Avatar from './Avatar';

interface UserMultiSelectProps {
  users: User[];
  selectedUsers: User[];
  onSelectionChange: (users: User[]) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
}

const UserMultiSelect: React.FC<UserMultiSelectProps> = ({
  users,
  selectedUsers,
  onSelectionChange,
  placeholder = "Rechercher et sélectionner des membres d'équipe...",
  label = "Membres d'équipe",
  required = false,
  error
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtrage des utilisateurs par recherche
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // Fermer le dropdown si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleUser = (user: User) => {
    const isSelected = selectedUsers.some(u => u.id === user.id);
    if (isSelected) {
      onSelectionChange(selectedUsers.filter(u => u.id !== user.id));
    } else {
      onSelectionChange([...selectedUsers, user]);
    }
  };

  const removeUser = (user: User) => {
    onSelectionChange(selectedUsers.filter(u => u.id !== user.id));
  };

  const isSelected = (user: User) => {
    return selectedUsers.some(u => u.id === user.id);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <i className="fas fa-users mr-2 text-blue-600"></i>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Input avec recherche */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pl-10 border-2 rounded-xl focus:ring-2 focus:ring-blue-200 transition-colors ${
            error ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
          }`}
        />
        <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        {isOpen && (
          <i 
            className="fas fa-chevron-up absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
            onClick={() => setIsOpen(false)}
          ></i>
        )}
        {!isOpen && (
          <i 
            className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
            onClick={() => setIsOpen(true)}
          ></i>
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <i className="fas fa-exclamation-circle mr-1"></i>
          {error}
        </p>
      )}

      {/* Liste déroulante des utilisateurs */}
      {isOpen && (
        <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <i className="fas fa-search mb-2"></i>
              <p>Aucun utilisateur trouvé</p>
            </div>
          ) : (
            filteredUsers.map(user => (
              <div
                key={user.id}
                onClick={() => toggleUser(user)}
                className={`flex items-center p-3 hover:bg-blue-50 cursor-pointer transition-colors ${
                  isSelected(user) ? 'bg-blue-100' : ''
                }`}
              >
                <Avatar 
                  user={user} 
                  size="md"
                  className="mr-3"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
                </div>
                {isSelected(user) && (
                  <i className="fas fa-check-circle text-blue-600 text-lg"></i>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Utilisateurs sélectionnés (tags) */}
      {selectedUsers.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedUsers.map(user => (
            <div 
              key={user.id} 
              className="flex items-center bg-gradient-to-r from-blue-100 to-emerald-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
            >
              <Avatar 
                user={user} 
                size="sm"
                className="mr-2"
              />
              <span>{user.name}</span>
              <button
                type="button"
                onClick={() => removeUser(user)}
                className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Compteur */}
      {selectedUsers.length > 0 && (
        <p className="mt-2 text-xs text-gray-500">
          {selectedUsers.length} membre{selectedUsers.length > 1 ? 's' : ''} sélectionné{selectedUsers.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

export default UserMultiSelect;

