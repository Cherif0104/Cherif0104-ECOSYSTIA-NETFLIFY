import React from 'react';
import { ChartBarIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, FlagIcon, UserGroupIcon, ArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface GoalsMetrics {
  totalObjectives: number;
  completedObjectives: number;
  inProgressObjectives: number;
  overdueObjectives: number;
  totalKeyResults: number;
  completedKeyResults: number;
  averageProgress: number;
  teamMembers: number;
}

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: GoalsMetrics;
}

const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ isOpen, onClose, metrics }) => {
  if (!isOpen) return null;

  const colorClasses = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', iconBg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-50', border: 'border-green-200', iconBg: 'bg-green-100', text: 'text-green-600' },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', iconBg: 'bg-yellow-100', text: 'text-yellow-600' },
    red: { bg: 'bg-red-50', border: 'border-red-200', iconBg: 'bg-red-100', text: 'text-red-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', iconBg: 'bg-purple-100', text: 'text-purple-600' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', iconBg: 'bg-indigo-100', text: 'text-indigo-600' },
    pink: { bg: 'bg-pink-50', border: 'border-pink-200', iconBg: 'bg-pink-100', text: 'text-pink-600' },
  };

  const metricItems = [
    { icon: FlagIcon, label: 'Total Objectives', value: metrics.totalObjectives, color: 'blue' },
    { icon: CheckCircleIcon, label: 'Completed Objectives', value: metrics.completedObjectives, color: 'green' },
    { icon: ClockIcon, label: 'In Progress Objectives', value: metrics.inProgressObjectives, color: 'yellow' },
    { icon: ExclamationTriangleIcon, label: 'Overdue Objectives', value: metrics.overdueObjectives, color: 'red' },
    { icon: ChartBarIcon, label: 'Total Key Results', value: metrics.totalKeyResults, color: 'purple' },
    { icon: ArrowUpIcon, label: 'Average Progress', value: `${metrics.averageProgress}%`, color: 'indigo' },
    { icon: UserGroupIcon, label: 'Team Members', value: metrics.teamMembers, color: 'pink' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[70] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Goals & OKRs Analytics</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metricItems.map((item, index) => {
              const colors = colorClasses[item.color as keyof typeof colorClasses];
              return (
                <div key={index} className={`${colors.bg} ${colors.border} rounded-lg p-4`}>
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full ${colors.iconBg}`}>
                      <item.icon className={`h-6 w-6 ${colors.text}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{item.label}</p>
                      <p className="text-xl font-bold text-gray-900">{item.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 text-right">
          <button
            onClick={onClose}
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsModal;