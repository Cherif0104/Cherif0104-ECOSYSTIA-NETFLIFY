/**
 * ♿ BOUTON D'ACCESSIBILITÉ - ECOSYSTIA
 * Faciliter la prise en main et l'accessibilité
 */

import React, { useState } from 'react';
import { 
  Cog6ToothIcon,
  XMarkIcon,
  EyeIcon,
  SpeakerWaveIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  InformationCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface AccessibilityButtonProps {
  onClose?: () => void;
}

const AccessibilityButton: React.FC<AccessibilityButtonProps> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [screenReader, setScreenReader] = useState(false);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    document.documentElement.style.fontSize = `${size}px`;
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    document.body.classList.toggle('high-contrast', !highContrast);
  };

  const toggleScreenReader = () => {
    setScreenReader(!screenReader);
    // Simulation d'un lecteur d'écran basique
    if (!screenReader) {
      const elements = document.querySelectorAll('button, a, input, [role="button"]');
      elements.forEach(el => {
        el.setAttribute('aria-label', el.textContent || 'Élément interactif');
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const showHelp = () => {
    alert(`🔧 AIDE D'ACCESSIBILITÉ

📖 NAVIGATION :
• Utilisez Tab pour naviguer entre les éléments
• Entrée ou Espace pour activer les boutons
• Échap pour fermer les modales

🎨 AFFICHAGE :
• Taille de police : ${fontSize}px
• Contraste élevé : ${highContrast ? 'Activé' : 'Désactivé'}
• Lecteur d'écran : ${screenReader ? 'Activé' : 'Désactivé'}

⌨️ RACCOURCIS CLAVIER :
• Ctrl + / : Afficher cette aide
• Ctrl + + : Augmenter la taille
• Ctrl + - : Diminuer la taille
• Ctrl + 0 : Taille normale

📱 RESPONSIVE :
• L'interface s'adapte à votre écran
• Mode mobile disponible
• Zoom jusqu'à 200% supporté

Besoin d'aide ? Contactez le support technique.`);
  };

  const showKeyboardShortcuts = () => {
    alert(`⌨️ RACCOURCIS CLAVIER

NAVIGATION GÉNÉRALE :
• Tab : Élément suivant
• Shift + Tab : Élément précédent
• Entrée : Activer/Valider
• Échap : Annuler/Fermer

NAVIGATION MODULES :
• Alt + 1 : Dashboard
• Alt + 2 : Projets
• Alt + 3 : Objectifs
• Alt + 4 : Suivi du temps
• Alt + 5 : Finance

ACCESSIBILITÉ :
• Ctrl + + : Zoom avant
• Ctrl + - : Zoom arrière
• Ctrl + 0 : Zoom normal
• Ctrl + / : Aide
• F1 : Aide contextuelle

RECHERCHE :
• Ctrl + F : Rechercher
• Ctrl + G : Recherche suivante
• Ctrl + Shift + G : Recherche précédente

MODALES :
• Échap : Fermer
• Entrée : Confirmer
• Tab : Naviguer dans la modale`);
  };

  if (!isOpen) {
    return (
      <button
        onClick={togglePanel}
        className="fixed bottom-6 right-20 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300"
        title="Ouvrir les options d'accessibilité"
        aria-label="Ouvrir les options d'accessibilité"
      >
        <Cog6ToothIcon className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-20 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 w-80 max-h-96 overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cog6ToothIcon className="h-5 w-5" />
            <h3 className="font-semibold">Accessibilité</h3>
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              onClose?.();
            }}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Fermer le panneau d'accessibilité"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4 space-y-4">
        {/* Taille de police */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <EyeIcon className="h-4 w-4 inline mr-1" />
            Taille de police
          </label>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleFontSizeChange(14)}
              className={`px-3 py-1 text-xs rounded ${
                fontSize === 14 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Petit
            </button>
            <button
              onClick={() => handleFontSizeChange(16)}
              className={`px-3 py-1 text-sm rounded ${
                fontSize === 16 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => handleFontSizeChange(18)}
              className={`px-3 py-1 text-base rounded ${
                fontSize === 18 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Grand
            </button>
            <button
              onClick={() => handleFontSizeChange(20)}
              className={`px-3 py-1 text-lg rounded ${
                fontSize === 20 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Très grand
            </button>
          </div>
        </div>

        {/* Contraste élevé */}
        <div className="flex items-center justify-between">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <EyeIcon className="h-4 w-4 mr-1" />
            Contraste élevé
          </label>
          <button
            onClick={toggleHighContrast}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              highContrast ? 'bg-blue-600' : 'bg-gray-200'
            }`}
            aria-label="Activer le contraste élevé"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                highContrast ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Lecteur d'écran */}
        <div className="flex items-center justify-between">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <SpeakerWaveIcon className="h-4 w-4 mr-1" />
            Mode lecteur d'écran
          </label>
          <button
            onClick={toggleScreenReader}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              screenReader ? 'bg-blue-600' : 'bg-gray-200'
            }`}
            aria-label="Activer le mode lecteur d'écran"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                screenReader ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Navigation rapide */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MagnifyingGlassIcon className="h-4 w-4 inline mr-1" />
            Navigation rapide
          </label>
          <div className="flex space-x-2">
            <button
              onClick={scrollToTop}
              className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm transition-colors"
              title="Aller en haut de la page"
            >
              <ChevronUpIcon className="h-4 w-4 inline mr-1" />
              Haut
            </button>
            <button
              onClick={scrollToBottom}
              className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm transition-colors"
              title="Aller en bas de la page"
            >
              <ChevronDownIcon className="h-4 w-4 inline mr-1" />
              Bas
            </button>
          </div>
        </div>

        {/* Aide */}
        <div className="border-t pt-4">
          <div className="flex space-x-2">
            <button
              onClick={showHelp}
              className="flex-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm transition-colors flex items-center justify-center"
            >
              <QuestionMarkCircleIcon className="h-4 w-4 mr-1" />
              Aide
            </button>
            <button
              onClick={showKeyboardShortcuts}
              className="flex-1 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded text-sm transition-colors flex items-center justify-center"
            >
              <InformationCircleIcon className="h-4 w-4 mr-1" />
              Raccourcis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityButton;
