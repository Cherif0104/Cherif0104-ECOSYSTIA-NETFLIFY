import React, { useState, useEffect } from 'react';
import { Invoice } from '../../types';
import { financeService } from '../../services/financeService';
import { ValidationRules, FormValidator } from '../../utils/validation';

interface InvoiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingInvoice?: Invoice | null;
}

const InvoiceFormModal: React.FC<InvoiceFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingInvoice
}) => {
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    clientName: '',
    amount: '',
    dueDate: '',
    status: 'draft' as 'draft' | 'sent' | 'paid' | 'overdue' | 'partially_paid',
    paidAmount: '',
    paidDate: '',
    receipt: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingInvoice) {
      setFormData({
        invoiceNumber: editingInvoice.invoiceNumber,
        clientName: editingInvoice.clientName,
        amount: editingInvoice.amount.toString(),
        dueDate: editingInvoice.dueDate,
        status: editingInvoice.status,
        paidAmount: editingInvoice.paidAmount?.toString() || '',
        paidDate: editingInvoice.paidDate || '',
        receipt: editingInvoice.receipt || ''
      });
    } else {
      // Générer un numéro de facture automatique
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      setFormData(prev => ({ ...prev, invoiceNumber }));
    }
  }, [editingInvoice]);

  const validateForm = (): boolean => {
    const validator = new FormValidator();

    validator.validateField('invoiceNumber', formData.invoiceNumber, [
      ValidationRules.required()
    ]);

    validator.validateField('clientName', formData.clientName, [
      ValidationRules.required(),
      ValidationRules.minLength(2)
    ]);

    validator.validateField('amount', formData.amount, [
      ValidationRules.required(),
      ValidationRules.positiveNumber()
    ]);

    validator.validateField('dueDate', formData.dueDate, [
      ValidationRules.required()
    ]);

    if (formData.status === 'paid' || formData.status === 'partially_paid') {
      validator.validateField('paidAmount', formData.paidAmount, [
        ValidationRules.required(),
        ValidationRules.positiveNumber(),
        ValidationRules.custom(
          (value) => Number(value) <= Number(formData.amount),
          'Le montant payé ne peut pas dépasser le montant total'
        )
      ]);

      validator.validateField('paidDate', formData.paidDate, [
        ValidationRules.required()
      ]);
    }

    setErrors(validator.getErrors());
    return !validator.hasErrors();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const invoiceData: any = {
        invoiceNumber: formData.invoiceNumber,
        clientName: formData.clientName,
        amount: Number(formData.amount),
        dueDate: formData.dueDate,
        status: formData.status,
        paidAmount: formData.paidAmount ? Number(formData.paidAmount) : undefined,
        paidDate: formData.paidDate || undefined,
        receipt: formData.receipt || undefined
      };

      if (editingInvoice) {
        await financeService.updateInvoice(editingInvoice.id, invoiceData);
      } else {
        await financeService.createInvoice(invoiceData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur soumission facture:', error);
      setErrors({ submit: 'Erreur lors de l\'enregistrement de la facture' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ lors de la saisie
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingInvoice ? 'Modifier la facture' : 'Nouvelle facture'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Numéro de facture */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de facture <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.invoiceNumber}
                onChange={(e) => handleChange('invoiceNumber', e.target.value)}
                className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.invoiceNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="INV-2025-001"
                disabled={!!editingInvoice}
              />
              {errors.invoiceNumber && (
                <p className="text-red-600 text-sm mt-1">{errors.invoiceNumber}</p>
              )}
            </div>

            {/* Client */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du client <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => handleChange('clientName', e.target.value)}
                className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.clientName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Entreprise XYZ"
              />
              {errors.clientName && (
                <p className="text-red-600 text-sm mt-1">{errors.clientName}</p>
              )}
            </div>

            {/* Montant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant (XOF) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="500000"
                min="0"
                step="1000"
              />
              {errors.amount && (
                <p className="text-red-600 text-sm mt-1">{errors.amount}</p>
              )}
            </div>

            {/* Date d'échéance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date d'échéance <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.dueDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.dueDate && (
                <p className="text-red-600 text-sm mt-1">{errors.dueDate}</p>
              )}
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="draft">Brouillon</option>
                <option value="sent">Envoyée</option>
                <option value="paid">Payée</option>
                <option value="partially_paid">Partiellement payée</option>
                <option value="overdue">En retard</option>
              </select>
            </div>

            {/* Montant payé (si statut paid ou partially_paid) */}
            {(formData.status === 'paid' || formData.status === 'partially_paid') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Montant payé (XOF) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.paidAmount}
                    onChange={(e) => handleChange('paidAmount', e.target.value)}
                    className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.paidAmount ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="500000"
                    min="0"
                    step="1000"
                  />
                  {errors.paidAmount && (
                    <p className="text-red-600 text-sm mt-1">{errors.paidAmount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de paiement <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.paidDate}
                    onChange={(e) => handleChange('paidDate', e.target.value)}
                    className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.paidDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.paidDate && (
                    <p className="text-red-600 text-sm mt-1">{errors.paidDate}</p>
                  )}
                </div>
              </>
            )}

            {/* Reçu (optionnel) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reçu / Référence (optionnel)
              </label>
              <input
                type="text"
                value={formData.receipt}
                onChange={(e) => handleChange('receipt', e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="REF-123456"
              />
            </div>

            {/* Erreur générale */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                {errors.submit}
              </div>
            )}
          </div>

          {/* Boutons */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Enregistrement...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  {editingInvoice ? 'Mettre à jour' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceFormModal;

