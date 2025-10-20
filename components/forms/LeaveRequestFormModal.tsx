/**
 * 🏖️ MODAL FORMULAIRE DEMANDE DE CONGÉ
 * Formulaire pour créer/modifier une demande de congé
 */

import React, { useState, useEffect } from 'react';
import { XMarkIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline';
import { LeaveRequest, User } from '../../types';

interface LeaveRequestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (leaveRequest: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt'>) => void;
  leaveRequest?: LeaveRequest | null;
  users: User[];
  currentUserId?: string; // ID de l'utilisateur connecté
}

const LeaveRequestFormModal: React.FC<LeaveRequestFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  leaveRequest,
  users,
  currentUserId
}) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: 'vacation',
    startDate: '',
    endDate: '',
    reason: '',
    daysRequested: 1,
    status: 'pending'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialiser le formulaire
  useEffect(() => {
    if (leaveRequest) {
      setFormData({
        employeeId: leaveRequest.employeeId,
        leaveType: leaveRequest.leaveType,
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
        reason: leaveRequest.reason || '',
        daysRequested: leaveRequest.daysRequested,
        status: leaveRequest.status
      });
    } else {
      setFormData({
        employeeId: currentUserId || '', // Utiliser l'ID de l'utilisateur connecté
        leaveType: 'vacation',
        startDate: '',
        endDate: '',
        reason: '',
        daysRequested: 1,
        status: 'pending'
      });
    }
  }, [leaveRequest, isOpen, currentUserId]);

  // Calculer automatiquement le nombre de jours
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setFormData(prev => ({ ...prev, daysRequested: diffDays }));
    }
  }, [formData.startDate, formData.endDate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'Veuillez sélectionner un employé';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Veuillez sélectionner une date de début';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'Veuillez sélectionner une date de fin';
    }
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'La date de fin doit être après la date de début';
    }
    if (formData.daysRequested < 1) {
      newErrors.daysRequested = 'Le nombre de jours doit être au moins 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit({
      employeeId: formData.employeeId,
      leaveType: formData.leaveType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      daysRequested: formData.daysRequested,
      status: formData.status
    });
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {leaveRequest ? 'Modifier la demande' : 'Nouvelle demande de congé'}
              </h2>
              <p className="text-blue-100 mt-1">
                {leaveRequest ? 'Modifiez les informations de la demande' : 'Remplissez les informations de la demande'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
              title="Fermer"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Employé - Affichage seulement pour les modifications */}
            {leaveRequest && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <UserIcon className="w-4 h-4 inline mr-1" />
                  Employé *
                </label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => handleInputChange('employeeId', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.employeeId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={true} // Toujours désactivé car on ne peut pas changer l'employé
                >
                  <option value="">Sélectionner un employé</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </select>
                {errors.employeeId && (
                  <p className="text-red-500 text-sm mt-1">{errors.employeeId}</p>
                )}
              </div>
            )}

            {/* Affichage de l'employé pour les nouvelles demandes */}
            {!leaveRequest && currentUserId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <UserIcon className="w-4 h-4 inline mr-1" />
                  Employé
                </label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-700">
                  {users.find(user => user.id === currentUserId)?.firstName} {users.find(user => user.id === currentUserId)?.lastName}
                </div>
                <p className="text-sm text-gray-500 mt-1">Demande créée pour votre compte</p>
              </div>
            )}

            {/* Type de congé */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de congé *
              </label>
              <select
                value={formData.leaveType}
                onChange={(e) => handleInputChange('leaveType', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="vacation">Vacances</option>
                <option value="sick">Maladie</option>
                <option value="personal">Personnel</option>
                <option value="maternity">Maternité</option>
                <option value="paternity">Paternité</option>
                <option value="other">Autre</option>
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarIcon className="w-4 h-4 inline mr-1" />
                  Date de début *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarIcon className="w-4 h-4 inline mr-1" />
                  Date de fin *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* Nombre de jours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de jours *
              </label>
              <input
                type="number"
                min="1"
                value={formData.daysRequested}
                onChange={(e) => handleInputChange('daysRequested', parseInt(e.target.value) || 1)}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.daysRequested ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.daysRequested && (
                <p className="text-red-500 text-sm mt-1">{errors.daysRequested}</p>
              )}
            </div>

            {/* Motif */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif du congé
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                rows={3}
                placeholder="Décrivez la raison de votre demande de congé..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Statut (seulement pour les modifications) */}
            {leaveRequest && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">En attente</option>
                  <option value="approved">Approuvé</option>
                  <option value="rejected">Rejeté</option>
                </select>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {leaveRequest ? 'Mettre à jour' : 'Créer la demande'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestFormModal;