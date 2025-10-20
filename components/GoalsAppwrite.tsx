import React, { useState, useEffect } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContextSupabase';
import { Project, Objective, KeyResult } from '../types';
import { okrService } from '../services/okrService';
import { projectService } from '../services/projectService';
import { generateOKRs } from '../services/geminiService';
import ConfirmationModal from './common/ConfirmationModal';

const ObjectiveFormModal: React.FC<{
    objective: Objective | null;
    projectId: string;
    onClose: () => void;
    onSave: (objective: Objective | Omit<Objective, 'id' | 'createdAt' | 'updatedAt'>) => void;
}> = ({ objective, projectId, onClose, onSave }) => {
    const { t } = useLocalization();
    const isEditMode = objective !== null;

    const [formData, setFormData] = useState<Omit<Objective, 'id' | 'createdAt' | 'updatedAt'>>(
        objective || {
            title: '',
            projectId: projectId,
            keyResults: [{ id: `kr-${Date.now()}`, title: '', target: 100, current: 0, unit: '%' }]
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, title: e.target.value }));
    };

    const handleKrChange = (index: number, field: string, value: string | number) => {
        const newKrs = [...formData.keyResults];
        (newKrs[index] as any)[field] = value;
        setFormData(prev => ({...prev, keyResults: newKrs}));
    };

    const addKr = () => {
        const newKr: KeyResult = { id: `kr-${Date.now()}`, title: '', target: 100, current: 0, unit: '%' };
        setFormData(prev => ({...prev, keyResults: [...prev.keyResults, newKr]}));
    };
    
    const removeKr = (index: number) => {
        setFormData(prev => ({...prev, keyResults: prev.keyResults.filter((_, i) => i !== index)}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {isEditMode ? t('edit_objective') : t('add_objective')}
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('objective_title')}
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ex: Améliorer la satisfaction client"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('key_results')}
                                </label>
                                <div className="space-y-3">
                                    {formData.keyResults.map((kr, index) => (
                                        <div key={kr.id} className="flex space-x-3 items-end">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={kr.title}
                                                    onChange={(e) => handleKrChange(index, 'title', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Ex: Augmenter le score NPS à 8"
                                                    required
                                                />
                                            </div>
                                            <div className="w-24">
                                                <input
                                                    type="number"
                                                    value={kr.current}
                                                    onChange={(e) => handleKrChange(index, 'current', Number(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Actuel"
                                                    min="0"
                                                />
                                            </div>
                                            <div className="w-24">
                                                <input
                                                    type="number"
                                                    value={kr.target}
                                                    onChange={(e) => handleKrChange(index, 'target', Number(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Cible"
                                                    min="0"
                                                />
                                            </div>
                                            <div className="w-20">
                                                <select
                                                    value={kr.unit}
                                                    onChange={(e) => handleKrChange(index, 'unit', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="%">%</option>
                                                    <option value="€">€</option>
                                                    <option value="clients">clients</option>
                                                    <option value="jours">jours</option>
                                                    <option value="heures">heures</option>
                                                </select>
                                            </div>
                                            {formData.keyResults.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeKr(index)}
                                                    className="p-2 text-red-600 hover:text-red-800"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={addKr}
                                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                                >
                                    <i className="fas fa-plus mr-1"></i>
                                    Ajouter un Key Result
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {isEditMode ? t('update') : t('add')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface GoalsSupabaseProps {
  projects: Project[];
}

const GoalsSupabase: React.FC<GoalsSupabaseProps> = ({ projects }) => {
    const { t } = useLocalization();
    const { user } = useAuth();
    
    // États pour les données
    const [objectives, setObjectives] = useState<Objective[]>([]);
    const [keyResults, setKeyResults] = useState<KeyResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // États pour l'interface
    const [isObjectiveFormOpen, setObjectiveFormOpen] = useState(false);
    const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [deletingObjectiveId, setDeletingObjectiveId] = useState<string | null>(null);
    const [isGeneratingOKRs, setIsGeneratingOKRs] = useState(false);

    // Charger les données
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [objectivesData, keyResultsData] = await Promise.all([
                okrService.getObjectives(),
                okrService.getKeyResults()
            ]);

            setObjectives(objectivesData);
            setKeyResults(keyResultsData);

            console.log(`✅ ${objectivesData.length} objectifs et ${keyResultsData.length} key results chargés`);
        } catch (error: any) {
            console.error('❌ Erreur chargement données OKR:', error);
            setError('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveObjective = async (objectiveData: Objective | Omit<Objective, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            setError(null); // Réinitialiser l'erreur
            
            if ('id' in objectiveData) {
                // Mise à jour
                const updatedObjective = await okrService.updateObjectiveWithKeyResults(objectiveData.id, objectiveData);
                if (updatedObjective) {
                    setObjectives(prev => prev.map(obj => obj.id === objectiveData.id ? updatedObjective : obj));
                    console.log('✅ Objectif mis à jour');
                }
            } else {
                // Création
                const newObjective = await okrService.createObjectiveWithKeyResults(objectiveData);
                if (newObjective) {
                    setObjectives(prev => [...prev, newObjective]);
                    console.log('✅ Objectif créé');
                }
            }
            
            // Fermer la modale et réinitialiser les états
            setObjectiveFormOpen(false);
            setEditingObjective(null);
            setSelectedProjectId('');
        } catch (error: any) {
            console.error('❌ Erreur sauvegarde objectif:', error);
            setError('Erreur lors de la sauvegarde de l\'objectif');
            // Ne pas fermer la modale en cas d'erreur
        }
    };

    const handleDeleteObjective = async (objectiveId: string) => {
        try {
            const success = await okrService.deleteObjective(objectiveId);
            if (success) {
                setObjectives(prev => prev.filter(obj => obj.id !== objectiveId));
                setDeletingObjectiveId(null);
                console.log('✅ Objectif supprimé');
            }
        } catch (error: any) {
            console.error('❌ Erreur suppression objectif:', error);
            setError('Erreur lors de la suppression de l\'objectif');
        }
    };

    const handleGenerateOKRs = async (projectId: string) => {
        try {
            setIsGeneratingOKRs(true);
            const project = projects.find(p => p.id === projectId);
            if (!project) return;

            // Mode démo : générer des OKRs d'exemple
            const demoOKRs = [
                {
                    objective: `Améliorer ${project.title}`,
                    keyResults: [
                        { title: 'Augmenter la satisfaction utilisateur', target: 8, unit: 'points' },
                        { title: 'Réduire les bugs de 50%', target: 50, unit: '%' },
                        { title: 'Améliorer les performances de 30%', target: 30, unit: '%' }
                    ]
                },
                {
                    objective: `Optimiser les processus de ${project.title}`,
                    keyResults: [
                        { title: 'Réduire le temps de développement', target: 25, unit: '%' },
                        { title: 'Augmenter la productivité de l\'équipe', target: 20, unit: '%' }
                    ]
                }
            ];

            // Créer les objectifs générés
            for (const okr of demoOKRs) {
                const objective = await okrService.createObjectiveWithKeyResults({
                    title: okr.objective,
                    projectId: projectId,
                    keyResults: okr.keyResults.map(kr => ({
                        id: `kr-${Date.now()}-${Math.random()}`,
                        title: kr.title,
                        target: kr.target,
                        current: 0,
                        unit: kr.unit
                    }))
                });
                
                if (objective) {
                    setObjectives(prev => [...prev, objective]);
                }
            }
            console.log('✅ OKRs générés en mode démo');
        } catch (error: any) {
            console.error('❌ Erreur génération OKRs:', error);
            setError('Erreur lors de la génération des OKRs');
        } finally {
            setIsGeneratingOKRs(false);
        }
    };

    // Calculer les métriques
    const totalObjectives = objectives.length;
    const completedObjectives = objectives.filter(obj => 
        obj.keyResults.every(kr => kr.current >= kr.target)
    ).length;
    const completionRate = totalObjectives > 0 ? (completedObjectives / totalObjectives) * 100 : 0;

    const objectivesByProject = objectives.reduce((acc, obj) => {
        const project = projects.find(p => p.id === obj.projectId);
        const projectName = project?.title || `Projet ${obj.projectId}`;
        acc[projectName] = (acc[projectName] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
                    <p className="text-gray-600">Chargement des objectifs...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Goals & OKRs</h2>
                <div className="flex space-x-3">
                    <select
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Sélectionner un projet</option>
                        {projects.map(project => (
                            <option key={project.id} value={project.id}>
                                {project.title}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => setObjectiveFormOpen(true)}
                        disabled={!selectedProjectId}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <i className="fas fa-plus mr-2"></i>
                        Ajouter Objectif
                    </button>
                    {selectedProjectId && (
                        <button
                            onClick={() => handleGenerateOKRs(selectedProjectId)}
                            disabled={isGeneratingOKRs}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGeneratingOKRs ? (
                                <>
                                    <i className="fas fa-spinner fa-spin mr-2"></i>
                                    Génération...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-magic mr-2"></i>
                                    Générer avec IA
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Métriques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <i className="fas fa-bullseye text-blue-600"></i>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Objectifs</p>
                            <p className="text-2xl font-semibold text-gray-900">{totalObjectives}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <i className="fas fa-check-circle text-green-600"></i>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Objectifs Complétés</p>
                            <p className="text-2xl font-semibold text-gray-900">{completedObjectives}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <i className="fas fa-chart-line text-purple-600"></i>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Taux de Réussite</p>
                            <p className="text-2xl font-semibold text-gray-900">{completionRate.toFixed(1)}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Répartition par projet */}
            {Object.keys(objectivesByProject).length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par Projet</h3>
                    <div className="space-y-3">
                        {Object.entries(objectivesByProject).map(([projectName, count]) => (
                            <div key={projectName} className="flex justify-between items-center">
                                <span className="text-gray-700">{projectName}</span>
                                <span className="font-semibold text-gray-900">{count} objectif{count > 1 ? 's' : ''}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Message d'erreur */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                    <div className="flex items-center">
                        <i className="fas fa-exclamation-triangle mr-2"></i>
                        <span className="font-semibold">Erreur :</span>
                        <span className="ml-2">{error}</span>
                        <button
                            onClick={() => setError(null)}
                            className="ml-auto text-red-500 hover:text-red-700"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            )}

            {/* Liste des objectifs */}
            <div className="space-y-4">
                {objectives.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        <i className="fas fa-bullseye text-4xl mb-4"></i>
                        <p>Aucun objectif défini</p>
                        <p className="text-sm">Sélectionnez un projet et ajoutez votre premier objectif</p>
                    </div>
                ) : (
                    objectives.map(objective => {
                        const project = projects.find(p => p.id === objective.projectId);
                        const progress = objective.keyResults.length > 0 
                            ? objective.keyResults.reduce((sum, kr) => sum + (kr.current / kr.target), 0) / objective.keyResults.length * 100
                            : 0;
                        const isCompleted = objective.keyResults.every(kr => kr.current >= kr.target);

                        return (
                            <div key={objective.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{objective.title}</h3>
                                        <p className="text-sm text-gray-600">
                                            <i className="fas fa-project-diagram mr-1"></i>
                                            {project?.title || `Projet ${objective.projectId}`}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {isCompleted && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <i className="fas fa-check mr-1"></i>
                                                Complété
                                            </span>
                                        )}
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={() => {
                                                    setEditingObjective(objective);
                                                    setObjectiveFormOpen(true);
                                                }}
                                                className="p-2 text-gray-400 hover:text-blue-600"
                                                title="Modifier"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                onClick={() => setDeletingObjectiveId(objective.id)}
                                                className="p-2 text-gray-400 hover:text-red-600"
                                                title="Supprimer"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Barre de progression */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>Progression globale</span>
                                        <span>{progress.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Key Results */}
                                <div className="space-y-2">
                                    {objective.keyResults.map((kr, index) => {
                                        const krProgress = (kr.current / kr.target) * 100;
                                        return (
                                            <div key={kr.id} className="flex items-center space-x-3">
                                                <div className="flex-1">
                                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                        <span>{kr.title}</span>
                                                        <span>{kr.current} / {kr.target} {kr.unit}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                        <div 
                                                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                                                krProgress >= 100 ? 'bg-green-500' : 'bg-blue-500'
                                                            }`}
                                                            style={{ width: `${Math.min(krProgress, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modales */}
            {isObjectiveFormOpen && (
                <ObjectiveFormModal
                    objective={editingObjective}
                    projectId={selectedProjectId || editingObjective?.projectId || ''}
                    onClose={() => {
                        setObjectiveFormOpen(false);
                        setEditingObjective(null);
                        setSelectedProjectId('');
                    }}
                    onSave={handleSaveObjective}
                />
            )}

            {deletingObjectiveId && (
                <ConfirmationModal
                    isOpen={!!deletingObjectiveId}
                    onClose={() => setDeletingObjectiveId(null)}
                    onConfirm={() => handleDeleteObjective(deletingObjectiveId)}
                    title="Supprimer l'objectif"
                    message="Êtes-vous sûr de vouloir supprimer cet objectif et tous ses key results ?"
                />
            )}
        </div>
    );
};

export default GoalsSupabase;
