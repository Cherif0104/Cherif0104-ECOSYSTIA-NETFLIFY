/**
 * 📢 FEEDBACK MANAGER HOOK
 * Hook personnalisé pour gérer les états de feedback dans tous les composants V3
 */

import { useState, useCallback } from 'react';

interface FeedbackState {
  isSubmitting: boolean;
  submitSuccess: boolean;
  submitError: string | null;
  submitWarning: string | null;
  submitInfo: string | null;
}

interface FeedbackActions {
  setSubmitting: (loading: boolean) => void;
  setSuccess: (message?: string) => void;
  setError: (message: string) => void;
  setWarning: (message: string) => void;
  setInfo: (message: string) => void;
  clearFeedback: () => void;
  clearError: () => void;
  clearSuccess: () => void;
  clearWarning: () => void;
  clearInfo: () => void;
}

export const useFeedback = (): FeedbackState & FeedbackActions => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitWarning, setSubmitWarning] = useState<string | null>(null);
  const [submitInfo, setSubmitInfo] = useState<string | null>(null);

  const setSubmitting = useCallback((loading: boolean) => {
    setIsSubmitting(loading);
  }, []);

  const setSuccess = useCallback((message?: string) => {
    setSubmitSuccess(true);
    setSubmitError(null);
    setSubmitWarning(null);
    setSubmitInfo(null);
    
    if (message) {
      // Auto-clear après 3 secondes
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    }
  }, []);

  const setError = useCallback((message: string) => {
    setSubmitError(message);
    setSubmitSuccess(false);
    setSubmitWarning(null);
    setSubmitInfo(null);
    setIsSubmitting(false);
  }, []);

  const setWarning = useCallback((message: string) => {
    setSubmitWarning(message);
    setSubmitSuccess(false);
    setSubmitError(null);
    setSubmitInfo(null);
  }, []);

  const setInfo = useCallback((message: string) => {
    setSubmitInfo(message);
    setSubmitSuccess(false);
    setSubmitError(null);
    setSubmitWarning(null);
  }, []);

  const clearFeedback = useCallback(() => {
    setIsSubmitting(false);
    setSubmitSuccess(false);
    setSubmitError(null);
    setSubmitWarning(null);
    setSubmitInfo(null);
  }, []);

  const clearError = useCallback(() => {
    setSubmitError(null);
  }, []);

  const clearSuccess = useCallback(() => {
    setSubmitSuccess(false);
  }, []);

  const clearWarning = useCallback(() => {
    setSubmitWarning(null);
  }, []);

  const clearInfo = useCallback(() => {
    setSubmitInfo(null);
  }, []);

  return {
    // State
    isSubmitting,
    submitSuccess,
    submitError,
    submitWarning,
    submitInfo,
    
    // Actions
    setSubmitting,
    setSuccess,
    setError,
    setWarning,
    setInfo,
    clearFeedback,
    clearError,
    clearSuccess,
    clearWarning,
    clearInfo,
  };
};
