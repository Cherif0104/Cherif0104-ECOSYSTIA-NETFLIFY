/**
 * 🛡️ ERROR BOUNDARY - ECOSYSTIA
 * Composant pour capturer les erreurs React
 */

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { ErrorHandler } from '../../utils/errorHandling';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    ErrorHandler.handle(error, 'ErrorBoundary');
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-4">
              <i className="fas fa-exclamation-triangle text-red-500 text-3xl mr-3"></i>
              <h2 className="text-xl font-bold text-gray-800">Une erreur est survenue</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Nous sommes désolés, mais quelque chose s'est mal passé. 
              Veuillez rafraîchir la page ou réessayer plus tard.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                <p className="text-sm text-red-800 font-mono">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            <div className="flex space-x-3">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <i className="fas fa-redo mr-2"></i>
                Réessayer
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <i className="fas fa-sync mr-2"></i>
                Rafraîchir
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

