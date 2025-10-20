import React, { useState } from 'react';
import { Project } from '../../types';

interface StartTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (projectId: string, taskDescription: string) => void;
  projects: Project[];
}

const StartTimerModal: React.FC<StartTimerModalProps> = ({ isOpen, onClose, onStart, projects }) => {
  const [projectId, setProjectId] = useState('');
  const [taskDescription, setTaskDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectId && taskDescription) {
      onStart(projectId, taskDescription);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Démarrer un nouveau timer</h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Projet</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full"
                >
                  <option value="">Sélectionner un projet</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description de la tâche</label>
                <input
                  type="text"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg">Annuler</button>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">Démarrer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StartTimerModal;
