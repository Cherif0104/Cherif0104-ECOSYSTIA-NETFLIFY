import React, { useState, useEffect } from 'react';
import { JobApplication } from '../../types';
import { jobsService } from '../../services/jobsService';
import { ValidationRules, FormValidator } from '../../utils/validation';

interface ApplicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  jobId: string;
  editingApplication?: JobApplication | null;
}

const ApplicationFormModal: React.FC<ApplicationFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  jobId,
  editingApplication
}) => {
  const [formData, setFormData] = useState({
    candidateName: '',
    candidateEmail: '',
    candidatePhone: '',
    resume: '',
    coverLetter: '',
    experience: '',
    skills: [] as string[],
    status: 'pending' as 'pending' | 'reviewed' | 'interviewed' | 'accepted' | 'rejected',
    notes: ''
  });

  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingApplication) {
      setFormData({
        candidateName: editingApplication.candidateName,
        candidateEmail: editingApplication.candidateEmail,
        candidatePhone: editingApplication.candidatePhone,
        resume: editingApplication.resume,
        coverLetter: editingApplication.coverLetter,
        experience: editingApplication.experience.toString(),
        skills: editingApplication.skills,
        status: editingApplication.status,
        notes: editingApplication.notes || ''
      });
    }
  }, [editingApplication]);

  const validateForm = (): boolean => {
    const validator = new FormValidator();

    validator.validateField('candidateName', formData.candidateName, [
      ValidationRules.required(),
      ValidationRules.minLength(3)
    ]);

    validator.validateField('candidateEmail', formData.candidateEmail, [
      ValidationRules.required(),
      ValidationRules.email()
    ]);

    validator.validateField('candidatePhone', formData.candidatePhone, [
      ValidationRules.required(),
      ValidationRules.phone()
    ]);

    validator.validateField('resume', formData.resume, [
      ValidationRules.required()
    ]);

    validator.validateField('coverLetter', formData.coverLetter, [
      ValidationRules.required(),
      ValidationRules.minLength(50)
    ]);

    validator.validateField('experience', formData.experience, [
      ValidationRules.required(),
      ValidationRules.nonNegativeNumber()
    ]);

    if (formData.skills.length === 0) {
      validator.setError('skills', 'Au moins une compétence est requise');
    }

    setErrors(validator.getErrors());
    return !validator.hasErrors();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const applicationData: any = {
        jobId: jobId,
        candidateName: formData.candidateName,
        candidateEmail: formData.candidateEmail,
        candidatePhone: formData.candidatePhone,
        resume: formData.resume,
        coverLetter: formData.coverLetter,
        experience: Number(formData.experience),
        skills: formData.skills,
        status: formData.status,
        appliedAt: new Date(),
        notes: formData.notes || undefined
      };

      if (editingApplication) {
        await jobsService.updateApplication(editingApplication.id, applicationData);
      } else {
        await jobsService.createApplication(applicationData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur soumission candidature:', error);
      setErrors({ submit: 'Erreur lors de l\'enregistrement de la candidature' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
      if (errors.skills) {
        const newErrors = { ...errors };
        delete newErrors.skills;
        setErrors(newErrors);
      }
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingApplication ? 'Modifier la candidature' : 'Nouvelle candidature'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Nom complet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.candidateName}
                onChange={(e) => handleChange('candidateName', e.target.value)}
                className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.candidateName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Amadou Diallo"
              />
              {errors.candidateName && (
                <p className="text-red-600 text-sm mt-1">{errors.candidateName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.candidateEmail}
                  onChange={(e) => handleChange('candidateEmail', e.target.value)}
                  className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.candidateEmail ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="amadou.diallo@email.com"
                />
                {errors.candidateEmail && (
                  <p className="text-red-600 text-sm mt-1">{errors.candidateEmail}</p>
                )}
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.candidatePhone}
                  onChange={(e) => handleChange('candidatePhone', e.target.value)}
                  className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.candidatePhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+221 77 123 45 67"
                />
                {errors.candidatePhone && (
                  <p className="text-red-600 text-sm mt-1">{errors.candidatePhone}</p>
                )}
              </div>
            </div>

            {/* CV */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CV (URL) <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={formData.resume}
                onChange={(e) => handleChange('resume', e.target.value)}
                className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.resume ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://drive.google.com/..."
              />
              {errors.resume && (
                <p className="text-red-600 text-sm mt-1">{errors.resume}</p>
              )}
            </div>

            {/* Lettre de motivation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lettre de motivation <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.coverLetter}
                onChange={(e) => handleChange('coverLetter', e.target.value)}
                className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.coverLetter ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={5}
                placeholder="Expliquez pourquoi vous êtes le candidat idéal..."
              />
              {errors.coverLetter && (
                <p className="text-red-600 text-sm mt-1">{errors.coverLetter}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.coverLetter.length} caractères (minimum 50)
              </p>
            </div>

            {/* Expérience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Années d'expérience <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.experience}
                onChange={(e) => handleChange('experience', e.target.value)}
                className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.experience ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="5"
                min="0"
                max="50"
              />
              {errors.experience && (
                <p className="text-red-600 text-sm mt-1">{errors.experience}</p>
              )}
            </div>

            {/* Compétences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compétences <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="border border-gray-300 rounded-lg px-4 py-2 flex-1 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="JavaScript, Python..."
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              {errors.skills && (
                <p className="text-red-600 text-sm mt-1">{errors.skills}</p>
              )}
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills.map(skill => (
                    <span
                      key={skill}
                      className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Statut (admin uniquement) */}
            {editingApplication && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="pending">En attente</option>
                  <option value="reviewed">Examinée</option>
                  <option value="interviewed">Entretien</option>
                  <option value="accepted">Acceptée</option>
                  <option value="rejected">Rejetée</option>
                </select>
              </div>
            )}

            {/* Notes (admin) */}
            {editingApplication && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes internes (optionnel)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={2}
                  placeholder="Notes pour l'équipe RH..."
                />
              </div>
            )}

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
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Enregistrement...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i>
                  {editingApplication ? 'Mettre à jour' : 'Soumettre candidature'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationFormModal;

