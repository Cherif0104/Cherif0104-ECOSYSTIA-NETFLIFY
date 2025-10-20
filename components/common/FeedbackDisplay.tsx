/**
 * 📢 FEEDBACK DISPLAY COMPONENT
 * Composant pour afficher les messages de feedback dans tous les modules V3
 */

import React from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface FeedbackDisplayProps {
  success: boolean;
  error: string | null;
  warning: string | null;
  info: string | null;
  onClearError?: () => void;
  onClearWarning?: () => void;
  onClearInfo?: () => void;
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({
  success,
  error,
  warning,
  info,
  onClearError,
  onClearWarning,
  onClearInfo
}) => {
  if (!success && !error && !warning && !info) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Message de succès */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-800 font-medium">Action effectuée avec succès !</p>
          </div>
        </div>
      )}
      
      {/* Message d'erreur */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ExclamationCircleIcon className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
            {onClearError && (
              <button
                onClick={onClearError}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <ExclamationCircleIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Message d'avertissement */}
      {warning && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="text-yellow-800 font-medium">{warning}</p>
            </div>
            {onClearWarning && (
              <button
                onClick={onClearWarning}
                className="text-yellow-400 hover:text-yellow-600 transition-colors"
              >
                <ExclamationTriangleIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Message d'information */}
      {info && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
              <p className="text-blue-800 font-medium">{info}</p>
            </div>
            {onClearInfo && (
              <button
                onClick={onClearInfo}
                className="text-blue-400 hover:text-blue-600 transition-colors"
              >
                <InformationCircleIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackDisplay;
