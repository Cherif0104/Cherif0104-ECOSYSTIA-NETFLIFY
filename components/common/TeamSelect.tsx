import React, { useState } from 'react';
import { User } from '../../types';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

interface TeamSelectProps {
  users: User[];
  selectedTeam: string[];
  onChange: (selectedIds: string[]) => void;
}

const TeamSelect: React.FC<TeamSelectProps> = ({ users, selectedTeam, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSelect = (userId: string) => {
    if (!selectedTeam.includes(userId)) {
      onChange([...selectedTeam, userId]);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleRemove = (userId: string) => {
    onChange(selectedTeam.filter(id => id !== userId));
  };

  const filteredUsers = users.filter(user =>
    (user.firstName + ' ' + user.lastName).toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedTeam.includes(user.id)
  );

  const selectedUsers = users.filter(user => selectedTeam.includes(user.id));

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        <i className="fas fa-users mr-2 text-blue-600"></i>
        Équipe *
      </label>
      <div className="border border-gray-300 rounded-xl p-2 min-h-[128px]">
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map(user => (
            <div key={user.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
              <span>{user.firstName} {user.lastName}</span>
              <button
                type="button"
                onClick={() => handleRemove(user.id)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="relative mt-2">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-between"
          >
            <span>Ajouter un membre</span>
            <PlusIcon className="h-5 w-5" />
          </button>
          {isOpen && (
            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg">
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <ul className="max-h-48 overflow-y-auto">
                {filteredUsers.length > 0 ? filteredUsers.map(user => (
                  <li
                    key={user.id}
                    onClick={() => handleSelect(user.id)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {user.firstName} {user.lastName} ({user.role})
                  </li>
                )) : (
                  <li className="px-4 py-2 text-gray-500">Aucun utilisateur trouvé</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamSelect;
