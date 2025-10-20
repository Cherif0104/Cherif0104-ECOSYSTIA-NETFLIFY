import React, { useState } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import NexusFlowIcon from './icons/NexusFlowIcon';
import { Role, User } from '../types';
import AuthAIAssistant from './AuthAIAssistant';


const PasswordStrengthMeter: React.FC<{ password?: string }> = ({ password = '' }) => {
    const { t } = useLocalization();

    const calculateStrength = () => {
        let score = 0;
        if (password.length > 7) score++;
        if (password.length > 10) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return Math.floor(score / 1.25); // Scale score to 0-4
    };

    const strength = calculateStrength();
    const strengthLabels = [t('strength_weak'), t('strength_weak'), t('strength_medium'), t('strength_strong'), t('strength_very_strong')];
    const strengthColors = ['bg-red-500', 'bg-red-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-emerald-600'];

    return (
        <div>
            <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-medium text-gray-600">{t('password_strength')}</span>
                <span className={`font-semibold ${strength > 1 ? 'text-gray-800' : 'text-gray-500'}`}>{strengthLabels[strength]}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                    className={`h-1.5 rounded-full ${strengthColors[strength]} transition-all duration-300`} 
                    style={{ width: `${(strength / 4) * 100}%`}}
                ></div>
            </div>
        </div>
    );
};


interface SignupProps {
  onSignup: (signupData: Omit<User, 'id' | 'avatar' | 'skills'>) => void;
  onSwitchToLogin: () => void;
  allUsers: User[];
}

const Signup: React.FC<SignupProps> = ({ onSignup, onSwitchToLogin, allUsers }) => {
  const { t } = useLocalization();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('student');
  
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [isAssistantOpen, setAssistantOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');

    if (password !== confirmPassword) {
      setPasswordError(t('passwords_do_not_match'));
      return;
    }

    if (allUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      setEmailError(t('email_in_use'));
      return;
    }
    
    onSignup({ name, email, phone, location, role });
  };

  return (
    <>
      {/* Background moderne avec gradient - même style que Login */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Formes décoratives en arrière-plan */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

        {/* Container principal */}
        <div className="w-full max-w-6xl mx-auto relative z-10">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden md:flex border border-white/20">
            
            {/* Left Panel - Design moderne */}
            <div className="md:w-1/2 bg-gradient-to-br from-emerald-600 via-blue-600 to-blue-700 text-white p-12 flex flex-col justify-center items-center text-center relative overflow-hidden">
              {/* Effet de pattern en arrière-plan */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
              </div>
              
              {/* Contenu */}
              <div className="relative z-10">
                <div className="mb-6 transform hover:scale-110 transition-transform duration-300">
                  <NexusFlowIcon className="w-32 h-32 drop-shadow-2xl"/>
                </div>
                <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                  {t('senegel_workflow_platform')}
                </h1>
                <p className="text-lg text-blue-100 mb-8 max-w-md">{t('signup_subtitle')}</p>
                
                {/* Avantages */}
                <div className="space-y-4 mt-8">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <i className="fas fa-check text-white"></i>
                    </div>
                    <span className="text-sm">Accès à tous les modules</span>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <i className="fas fa-shield-alt text-white"></i>
                    </div>
                    <span className="text-sm">Données sécurisées</span>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <i className="fas fa-users text-white"></i>
                    </div>
                    <span className="text-sm">Collaboration en temps réel</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Formulaire moderne */}
            <div className="md:w-1/2 p-8 md:p-12 bg-white max-h-[90vh] overflow-y-auto">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('signup_title')}</h2>
                <p className="text-gray-600">Créez votre compte en quelques secondes</p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Nom complet et Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <i className="fas fa-user mr-2 text-blue-600"></i>
                      {t('full_name')}
                    </label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      required 
                      className="block w-full px-4 py-3 text-base border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl shadow-sm hover:border-blue-300 transition-colors bg-gray-50"
                      placeholder="Ex: Jean Dupont"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <i className="fas fa-envelope mr-2 text-blue-600"></i>
                      {t('email')}
                    </label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required 
                      className="block w-full px-4 py-3 text-base border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl shadow-sm hover:border-blue-300 transition-colors bg-gray-50"
                      placeholder="votre@email.com"
                    />
                    {emailError && (
                      <div className="mt-2 flex items-center text-red-600 text-sm">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {emailError}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mots de passe */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <i className="fas fa-lock mr-2 text-blue-600"></i>
                      {t('password')}
                    </label>
                    <input 
                      type="password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                      className="block w-full px-4 py-3 text-base border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl shadow-sm hover:border-blue-300 transition-colors bg-gray-50"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <i className="fas fa-lock mr-2 text-blue-600"></i>
                      {t('confirm_password')}
                    </label>
                    <input 
                      type="password" 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                      required 
                      className="block w-full px-4 py-3 text-base border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl shadow-sm hover:border-blue-300 transition-colors bg-gray-50"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* Password Strength Meter */}
                {password && (
                  <div className="px-2">
                    <PasswordStrengthMeter password={password} />
                  </div>
                )}

                {/* Erreur mot de passe */}
                {passwordError && (
                  <div className="flex items-center justify-center text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    <i className="fas fa-exclamation-circle mr-2"></i>
                    {passwordError}
                  </div>
                )}
                
                {/* Sélection de rôle */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-user-tag mr-2 text-blue-600"></i>
                    {t('role')}
                  </label>
                  <div className="relative">
                    <select 
                      value={role} 
                      onChange={e => setRole(e.target.value as Role)} 
                      className="block w-full px-4 py-3 text-base border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl shadow-sm hover:border-blue-300 transition-colors bg-gray-50"
                    >
                      <optgroup label={t('youth')}>
                        <option value="student">{t('student')}</option>
                        <option value="entrepreneur">{t('entrepreneur')}</option>
                      </optgroup>
                      <optgroup label={t('partner')}>
                        <option value="employer">{t('employer')}</option>
                        <option value="trainer">{t('trainer')}</option>
                        <option value="funder">{t('funder')}</option>
                        <option value="implementer">{t('implementer')}</option>
                      </optgroup>
                      <optgroup label={t('contributor_category')}>
                        <option value="mentor">{t('mentor')}</option>
                        <option value="coach">{t('coach')}</option>
                        <option value="facilitator">{t('facilitator')}</option>
                        <option value="publisher">{t('publisher')}</option>
                        <option value="editor">{t('editor')}</option>
                        <option value="producer">{t('producer')}</option>
                        <option value="artist">{t('artist')}</option>
                        <option value="alumni">{t('alumni')}</option>
                      </optgroup>
                      <optgroup label={t('staff_category')}>
                        <option value="intern">{t('intern')}</option>
                      </optgroup>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-blue-600">
                      <i className="fas fa-chevron-down"></i>
                    </div>
                  </div>
                </div>
                
                {/* Bouton d'inscription moderne */}
                <div className="pt-2">
                  <button 
                    type="submit" 
                    className="group relative w-full flex justify-center items-center py-4 px-6 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <i className="fas fa-user-plus mr-2"></i>
                    {t('signup_button')}
                  </button>
                </div>
              </form>

              {/* Séparateur */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">Vous avez déjà un compte ?</span>
                  </div>
                </div>

                {/* Lien de connexion */}
                <div className="mt-6 text-center">
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }} 
                    className="inline-flex items-center text-base text-blue-600 hover:text-blue-700 font-semibold group"
                  >
                    <i className="fas fa-sign-in-alt mr-2 group-hover:scale-110 transition-transform"></i>
                    {t('login_prompt')}
                    <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Note de confidentialité */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <i className="fas fa-lock mr-2"></i>
            En créant un compte, vous acceptez nos conditions d'utilisation
          </div>
        </div>
      </div>

      {/* Bouton d'aide - Design amélioré */}
      <button 
        onClick={() => setAssistantOpen(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white w-auto h-14 px-6 rounded-full shadow-2xl hover:shadow-blue-500/50 hover:scale-105 flex items-center justify-center text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200 z-50"
      >
        <i className="fas fa-question-circle mr-2 text-lg"></i> 
        {t('need_help')}
      </button>

      {isAssistantOpen && (
        <AuthAIAssistant 
          onClose={() => setAssistantOpen(false)}
          context="signup"
        />
      )}

      {/* Styles pour les animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
};

export default Signup;