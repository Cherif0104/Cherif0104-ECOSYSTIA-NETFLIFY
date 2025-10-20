import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContextSupabase';

const SessionIndicator: React.FC = () => {
  const { getTimeUntilExpiration } = useAuth();
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const updateTimer = () => {
      const remaining = getTimeUntilExpiration();
      setTimeRemaining(remaining);
      
      // Afficher l'indicateur si moins de 2 minutes restantes
      setIsVisible(remaining < 2 * 60 * 1000 && remaining > 0);
    };

    // Mettre à jour immédiatement
    updateTimer();

    // Mettre à jour toutes les secondes
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [getTimeUntilExpiration]);

  if (!isVisible) return null;

  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);
  const isWarning = timeRemaining < 60 * 1000; // Moins d'1 minute

  return (
    <div className={`fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg transition-all duration-300 ${
      isWarning 
        ? 'bg-red-500 text-white' 
        : 'bg-yellow-500 text-black'
    }`}>
      <div className="flex items-center space-x-2">
        <i className={`fas ${isWarning ? 'fa-exclamation-triangle' : 'fa-clock'} text-sm`}></i>
        <span className="text-sm font-medium">
          Session expire dans {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};

export default SessionIndicator;
