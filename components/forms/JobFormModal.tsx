import React, { useState, useEffect } from 'react';
import { Job } from '../../types';
import { jobsService } from '../../services/jobsService';
import { ValidationRules, FormValidator } from '../../utils/validation';

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingJob?: Job | null;
}

const JobFormModal: React.FC<JobFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingJob
}) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'CDI' as 'Full-time' | 'Part-time' | 'Contract' | 'CDI' | 'CDD',
    department: '',
    level: 'intermediate' as 'junior' | 'intermediate' | 'senior' | 'expert',
    salaryMin: '',
    salaryMax: '',
    description: '',
    requiredSkills: [] as string[],
    requirements: [] as string[],
    benefits: [] as string[],
    deadline: '',
    status: 'open' as 'open' | 'closed' | 'paused'
  });

  const [skillInput, setSkillInput] = useState('');
  const [requirementInput, setRequirementInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departments = [
    'Informatique',
    'Marketing',
    'Ventes',
    'RH',
    'Finance',
    'Opérations',
    'Design',
    'Support Client',
    'Management',
    'Autre'
  ];

  useEffect(() => {
    if (editingJob) {
      setFormData({
        title: editingJob.title,
        company: editingJob.company,
        location: editingJob.location,
        type: editingJob.type,
        department: editingJob.department,
        level: editingJob.level,
        salaryMin: editingJob.salary.min.toString(),
        salaryMax: editingJob.salary.max.toString(),
        description: editingJob.description,
        requiredSkills: editingJob.requiredSkills,
        requirements: editingJob.requirements,
        benefits: editingJob.benefits,
        deadline: editingJob.deadline.toISOString().split('T')[0],
        status: editingJob.status
      });
    }
  }, [editingJob]);

  const validateForm = (): boolean => {
    const validator = new FormValidator();

    validator.validateField('title', formData.title, [
      ValidationRules.required(),
      ValidationRules.minLength(5)
    ]);

    validator.validateField('company', formData.company, [
      ValidationRules.required(),
      ValidationRules.minLength(2)
    ]);

    validator.validateField('location', formData.location, [
      ValidationRules.required()
    ]);

    validator.validateField('department', formData.department, [
      ValidationRules.required()
    ]);

    validator.validateField('description', formData.description, [
      ValidationRules.required(),
      ValidationRules.minLength(50)
    ]);

    validator.validateField('salaryMin', formData.salaryMin, [
      ValidationRules.required(),
      ValidationRules.positiveNumber()
    ]);

    validator.validateField('salaryMax', formData.salaryMax, [
      ValidationRules.required(),
      ValidationRules.positiveNumber()
    ]);

    // Vérifier salaire min < max
    if (Number(formData.salaryMin) >= Number(formData.salaryMax)) {
      validator.setError('salaryMax', 'Le salaire maximum doit être supérieur au minimum');
    }

    validator.validateField('deadline', formData.deadline, [
      ValidationRules.required(),
      ValidationRules.futureDate()
    ]);

    if (formData.requiredSkills.length === 0) {
      validator.setError('requiredSkills', 'Au moins une compétence est requise');
    }

    setErrors(validator.getErrors());
    return !validator.hasErrors();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const jobData: any = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        type: formData.type,
        postedDate: new Date().toISOString().split('T')[0],
        description: formData.description,
        requiredSkills: formData.requiredSkills,
        applicants: editingJob?.applicants || [],
        department: formData.department,
        level: formData.level,
        salary: {
          min: Number(formData.salaryMin),
          max: Number(formData.salaryMax),
          currency: 'XOF'
        },
        status: formData.status,
        requirements: formData.requirements,
        benefits: formData.benefits,
        applicationsCount: editingJob?.applicationsCount || 0,
        deadline: new Date(formData.deadline)
      };

      if (editingJob) {
        await jobsService.updateJob(editingJob.id, jobData);
      } else {
        await jobsService.createJob(jobData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur soumission emploi:', error);
      setErrors({ submit: 'Erreur lors de l\'enregistrement de l\'offre d\'emploi' });
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
    if (skillInput.trim() && !formData.requiredSkills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, skillInput.trim()]
      }));
      setSkillInput('');
      if (errors.requiredSkills) {
        const newErrors = { ...errors };
        delete newErrors.requiredSkills;
        setErrors(newErrors);
      }
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(s => s !== skill)
    }));
  };

  const addRequirement = () => {
    if (requirementInput.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, requirementInput.trim()]
      }));
      setRequirementInput('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const addBenefit = () => {
    if (benefitInput.trim()) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, benefitInput.trim()]
      }));
      setBenefitInput('');
    }
  };

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingJob ? 'Modifier l\'offre' : 'Nouvelle offre d\'emploi'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre du poste <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Développeur Full Stack Senior"
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Entreprise */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entreprise <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.company ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="TechCorp Sénégal"
                />
                {errors.company && (
                  <p className="text-red-600 text-sm mt-1">{errors.company}</p>
                )}
              </div>

              {/* Localisation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localisation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Dakar, Sénégal"
                />
                {errors.location && (
                  <p className="text-red-600 text-sm mt-1">{errors.location}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              {/* Département */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Département <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.department ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionner</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {errors.department && (
                  <p className="text-red-600 text-sm mt-1">{errors.department}</p>
                )}
              </div>

              {/* Niveau */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => handleChange('level', e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="junior">Junior</option>
                  <option value="intermediate">Intermédiaire</option>
                  <option value="senior">Senior</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>

            {/* Salaire */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salaire minimum (XOF) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.salaryMin}
                  onChange={(e) => handleChange('salaryMin', e.target.value)}
                  className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.salaryMin ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="500000"
                  min="0"
                  step="50000"
                />
                {errors.salaryMin && (
                  <p className="text-red-600 text-sm mt-1">{errors.salaryMin}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salaire maximum (XOF) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.salaryMax}
                  onChange={(e) => handleChange('salaryMax', e.target.value)}
                  className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.salaryMax ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="1000000"
                  min="0"
                  step="50000"
                />
                {errors.salaryMax && (
                  <p className="text-red-600 text-sm mt-1">{errors.salaryMax}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description du poste <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={4}
                placeholder="Description détaillée du poste et des responsabilités..."
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length} caractères (minimum 50)
              </p>
            </div>

            {/* Compétences requises */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compétences requises <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="border border-gray-300 rounded-lg px-4 py-2 flex-1 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="React, TypeScript..."
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              {errors.requiredSkills && (
                <p className="text-red-600 text-sm mt-1">{errors.requiredSkills}</p>
              )}
              {formData.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.requiredSkills.map(skill => (
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

            {/* Exigences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exigences (optionnel)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={requirementInput}
                  onChange={(e) => setRequirementInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                  className="border border-gray-300 rounded-lg px-4 py-2 flex-1 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Bac+5 en informatique"
                />
                <button
                  type="button"
                  onClick={addRequirement}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              {formData.requirements.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {formData.requirements.map((req, index) => (
                    <li key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded text-sm">
                      <span>• {req}</span>
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Avantages */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Avantages (optionnel)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={benefitInput}
                  onChange={(e) => setBenefitInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                  className="border border-gray-300 rounded-lg px-4 py-2 flex-1 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Assurance santé, télétravail..."
                />
                <button
                  type="button"
                  onClick={addBenefit}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              {formData.benefits.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {formData.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center justify-between bg-green-50 px-3 py-2 rounded text-sm">
                      <span>✓ {benefit}</span>
                      <button
                        type="button"
                        onClick={() => removeBenefit(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Date limite */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date limite de candidature <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleChange('deadline', e.target.value)}
                  className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.deadline ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.deadline && (
                  <p className="text-red-600 text-sm mt-1">{errors.deadline}</p>
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
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="open">Ouverte</option>
                  <option value="closed">Fermée</option>
                  <option value="paused">En pause</option>
                </select>
              </div>
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
                  <i className="fas fa-save mr-2"></i>
                  {editingJob ? 'Mettre à jour' : 'Publier l\'offre'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobFormModal;

