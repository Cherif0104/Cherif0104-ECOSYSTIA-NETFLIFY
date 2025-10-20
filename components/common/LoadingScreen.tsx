/**
 * Écran de chargement moderne pour éviter le flash de Login
 */

import React from 'react';
import NexusFlowIcon from '../icons/NexusFlowIcon';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center relative overflow-hidden">
      {/* Formes décoratives en arrière-plan */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Contenu principal */}
      <div className="relative z-10 text-center">
        {/* Logo animé */}
        <div className="mb-8 transform animate-pulse">
          <NexusFlowIcon className="w-24 h-24 mx-auto drop-shadow-2xl text-blue-600"/>
        </div>
        
        {/* Titre */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Ecosystia</h1>
        
        {/* Message de chargement */}
        <p className="text-gray-600 mb-8 animate-pulse">Chargement de votre session...</p>
        
        {/* Spinner moderne */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>
        
        {/* Indicateur de progression */}
        <div className="mt-6">
          <div className="w-48 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full animate-progress"></div>
          </div>
        </div>
      </div>

      {/* Styles pour les animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
