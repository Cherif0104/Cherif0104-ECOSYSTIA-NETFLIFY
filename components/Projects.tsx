import React, { useState, useEffect, useMemo, useRef } from 'react';
import Avatar from './common/Avatar';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContextSupabase';
import { Project, Task, User, Risk, TimeLog, Course } from '../types';
import { enhanceProjectTasks, identifyRisks, generateStatusReport, summarizeTasks } from '../services/geminiService';
import LogTimeModal from './LogTimeModal';
import ConfirmationModal from './common/ConfirmationModal';
import UserMultiSelect from './common/UserMultiSelect';

const statusStyles = {
    'Not Started': 'bg-gray-200 text-gray-800',
    'In Progress': 'bg-blue-200 text-blue-800',
    'Completed': 'bg-emerald-200 text-emerald-800',
};

const priorityStyles = {
    'High': 'bg-red-500',
    'Medium': 'bg-yellow-500',
    'Low': 'bg-green-500',
}

const ProjectFormModal: React.FC<{
    project: Omit<Project, 'id' | 'tasks' | 'risks'> | Project | null;
    users: User[];
    onClose: () => void;
    onSave: (project: Omit<Project, 'id' | 'tasks' | 'risks'> | Project) => void;
}> = ({ project, users, onClose, onSave }) => {
    const { t } = useLocalization();
    const isEditMode = project && 'id' in project;
    const [formData, setFormData] = useState({
        title: project?.title || '',
        description: project?.description || '',
        status: project?.status || 'Not Started',
        dueDate: project?.dueDate || '',
        team: project?.team.map(u => u.id) || [],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };
    
    const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedIds = Array.from(e.target.selectedOptions, option => Number(option.value));
        setFormData(prev => ({ ...prev, team: selectedIds }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const teamMembers = users.filter(u => formData.team.includes(u.id));
        const projectData = {
            ...project,
            ...formData,
            team: teamMembers
        };
        onSave(projectData as Project);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                 <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="p-6 border-b">
                        <h2 className="text-2xl font-bold">{isEditMode ? t('edit_project') : t('create_new_project')}</h2>
                    </div>
                    <div className="p-6 flex-grow overflow-y-auto space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('project_title')}</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">{t('project_description')}</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('status')}</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                                    <option value="Not Started">{t('not_started')}</option>
                                    <option value="In Progress">{t('in_progress')}</option>
                                    <option value="Completed">{t('completed')}</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">{t('due_date')}</label>
                                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                            </div>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700">{t('team_members')}</label>
                            <select multiple name="team" value={formData.team.map(String)} onChange={handleTeamChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md h-32">
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 border-t flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300">{t('cancel')}</button>
                        <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700">{t('save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const ProjectDetailModal: React.FC<{
    project: Project;
    onClose: () => void;
    onUpdateProject: (project: Project) => void;
    onDeleteProject: (projectId: number) => void;
    onAddTimeLog: (log: Omit<TimeLog, 'id' | 'userId'>) => void;
    timeLogs: TimeLog[];
}> = ({ project, onClose, onUpdateProject, onDeleteProject, onAddTimeLog, timeLogs }) => {
    const { t } = useLocalization();
    const { user: currentUser } = useAuth();
    const [currentProject, setCurrentProject] = useState(project);
    const [activeTab, setActiveTab] = useState<'tasks' | 'risks' | 'report'>('tasks');
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState('');
    const [isLogTimeModalOpen, setLogTimeModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [openAssigneeMenuForTask, setOpenAssigneeMenuForTask] = useState<string | null>(null);
    const [isNewTaskAssigneeMenuOpen, setNewTaskAssigneeMenuOpen] = useState(false);
    const [newTaskAssigneeSearch, setNewTaskAssigneeSearch] = useState('');

    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
    const [newTaskAssigneeId, setNewTaskAssigneeId] = useState<number | ''>('');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');


    useEffect(() => {
        setCurrentProject(project);
    }, [project]);

    const handleUpdateTask = (taskId: string, updatedFields: Partial<Task>) => {
        const updatedTasks = currentProject.tasks.map(task =>
            task.id === taskId ? { ...task, ...updatedFields } : task
        );
        const updatedProject = { ...currentProject, tasks: updatedTasks };
        setCurrentProject(updatedProject);
        onUpdateProject(updatedProject);
    };
    
    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newTaskText.trim()) return;
        const newTask: Task = {
            id: `task-${Date.now()}`,
            text: newTaskText,
            status: 'To Do',
            priority: newTaskPriority,
            assignee: currentProject.team.find(u => u.id === newTaskAssigneeId),
            dueDate: newTaskDueDate || undefined,
        };
        const updatedProject = { ...currentProject, tasks: [...currentProject.tasks, newTask] };
        setCurrentProject(updatedProject);
        onUpdateProject(updatedProject);
        setNewTaskText('');
        setNewTaskPriority('Medium');
        setNewTaskAssigneeId('');
        setNewTaskDueDate('');
    };

    const handleDeleteTask = (taskId: string) => {
        const updatedTasks = currentProject.tasks.filter(task => task.id !== taskId);
        const updatedProject = { ...currentProject, tasks: updatedTasks };
        setCurrentProject(updatedProject);
        onUpdateProject(updatedProject);
    };

    const handleGenerateTasks = async () => {
        setLoading(true);
        const generatedTasks = await enhanceProjectTasks(currentProject.description, currentProject.team);
        const newTasks: Task[] = generatedTasks.map((t, index) => ({
            id: `ai-${Date.now()}-${index}`,
            text: t.text,
            status: 'To Do',
            priority: t.priority,
            assignee: currentProject.team.find(u => u.id === t.assigneeId)
        }));
        const updatedProject = { ...currentProject, tasks: [...currentProject.tasks, ...newTasks] };
        setCurrentProject(updatedProject);
        onUpdateProject(updatedProject);
        setLoading(false);
    };

    const handleIdentifyRisks = async () => {
        setLoading(true);
        const generatedRisks = await identifyRisks(currentProject.description);
        const newRisks: Risk[] = generatedRisks.map((r, index) => ({
            id: `risk-${Date.now()}-${index}`,
            ...r
        }));
        const updatedProject = { ...currentProject, risks: [...(currentProject.risks || []), ...newRisks] };
        setCurrentProject(updatedProject);
        onUpdateProject(updatedProject);
        setLoading(false);
    };

    const handleGenerateReport = async () => {
        setLoading(true);
        const result = await generateStatusReport(currentProject);
        setReport(result);
        setLoading(false);
    }
    
    const handleSummarizeTasks = async () => {
        setLoading(true);
        const result = await summarizeTasks(currentProject.tasks);
        setReport(result);
        setLoading(false);
    };
    
    const handleSaveTimeLog = (logData: Omit<TimeLog, 'id' | 'userId'>) => {
        onAddTimeLog(logData);
        setLogTimeModalOpen(false);
    };

    const TaskItem: React.FC<{ task: Task }> = ({ task }) => {
        const [searchTerm, setSearchTerm] = useState('');
        const isOpen = openAssigneeMenuForTask === task.id;

        useEffect(() => {
            if (!isOpen) {
                setSearchTerm('');
            }
        }, [isOpen]);

        const filteredTeam = currentProject.team.filter(member => 
            member.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const getDueDateStatus = (dueDate: string | undefined) => {
            if (!dueDate) return { text: '', color: '', icon: '' };
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const due = new Date(dueDate);
            const diffTime = due.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0) return { text: 'Overdue', color: 'text-red-600', icon: 'fas fa-exclamation-circle' };
            if (diffDays <= 7) return { text: 'Due Soon', color: 'text-yellow-600', icon: 'fas fa-clock' };
            return { text: '', color: 'text-gray-500', icon: 'far fa-calendar-alt' };
        };

        const dueDateStatus = getDueDateStatus(task.dueDate);

        return (
            <div className="flex items-center p-2 rounded-md hover:bg-gray-100 group">
                <input
                    type="checkbox"
                    checked={task.status === 'Done'}
                    onChange={(e) => handleUpdateTask(task.id, { status: e.target.checked ? 'Done' : 'To Do' })}
                    className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <input
                    type="text"
                    value={task.text}
                    onChange={(e) => handleUpdateTask(task.id, { text: e.target.value })}
                    className={`flex-grow mx-3 p-1 border-transparent rounded-md focus:border-gray-300 focus:bg-white ${task.status === 'Done' ? 'line-through text-gray-500' : ''}`}
                />
                 <div className={`mr-2 ${dueDateStatus.color} flex items-center text-xs`}>
                    <i className={`${dueDateStatus.icon} mr-1`}></i>
                    <span>{dueDateStatus.text}</span>
                </div>
                <input
                    type="date"
                    value={task.dueDate || ''}
                    onChange={(e) => handleUpdateTask(task.id, { dueDate: e.target.value })}
                    className="text-xs p-1 border rounded-md"
                />
                <div className="flex items-center ml-2">
                    <label className="text-xs mr-1 text-gray-500">{t('estimated_time_short')}</label>
                    <input
                        type="number"
                        value={task.estimatedTime || ''}
                        onChange={(e) => handleUpdateTask(task.id, { estimatedTime: Number(e.target.value) })}
                        className="w-12 text-xs p-1 border rounded-md"
                    />
                </div>
                <div className="flex items-center ml-2">
                    <label className="text-xs mr-1 text-gray-500">{t('logged_time_short')}</label>
                     <input
                        type="number"
                        value={task.loggedTime || ''}
                        onChange={(e) => handleUpdateTask(task.id, { loggedTime: Number(e.target.value) })}
                        className="w-12 text-xs p-1 border rounded-md"
                    />
                </div>
                <select
                    value={task.priority || 'Medium'}
                    onChange={(e) => handleUpdateTask(task.id, { priority: e.target.value as any })}
                    className="text-xs p-1 border rounded-md mx-2"
                >
                    <option value="Low">{t('low')}</option>
                    <option value="Medium">{t('medium')}</option>
                    <option value="High">{t('high')}</option>
                </select>
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setOpenAssigneeMenuForTask(isOpen ? null : task.id)}
                        className="flex items-center space-x-2 cursor-pointer p-1 rounded-md hover:bg-gray-200"
                    >
                        {task.assignee ? (
                            <Avatar user={task.assignee} size="md" className="w-6 h-6 rounded-full flex-shrink-0" />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 flex-shrink-0">
                                <i className="fas fa-user-plus text-xs"></i>
                            </div>
                        )}
                        <span className="text-xs text-gray-700 truncate max-w-[80px]">{task.assignee ? task.assignee.name : t('unassigned')}</span>
                        <i className={`fas fa-chevron-down text-gray-400 text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
                    </button>
                    {isOpen && (
                        <div className="absolute z-10 right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                            <div className="p-2">
                                <input 
                                    type="text"
                                    placeholder="Search team..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                                />
                            </div>
                            <div className="py-1 max-h-48 overflow-y-auto">
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleUpdateTask(task.id, { assignee: undefined });
                                        setOpenAssigneeMenuForTask(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                                >
                                     <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 flex-shrink-0">
                                        <i className="fas fa-user-slash text-xs"></i>
                                    </div>
                                    <span>{t('unassigned')}</span>
                                </button>
                                {filteredTeam.map(member => (
                                    <button
                                        key={member.id}
                                        type="button"
                                        onClick={() => {
                                            handleUpdateTask(task.id, { assignee: member });
                                            setOpenAssigneeMenuForTask(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                                    >
                                        <Avatar user={member} size="md" className="w-6 h-6 rounded-full" />
                                        <span className="truncate">{member.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <button onClick={() => handleDeleteTask(task.id)} className="ml-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <i className="fas fa-trash"></i>
                </button>
            </div>
        )
    };
    
    const canManage = currentUser?.role === 'manager' || currentUser?.role === 'administrator' || currentUser?.role === 'super_administrator';
    
    const selectedNewTaskAssignee = currentProject.team.find(u => u.id === newTaskAssigneeId);
    const filteredNewTaskTeam = currentProject.team.filter(member => 
        member.name.toLowerCase().includes(newTaskAssigneeSearch.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{currentProject.title}</h2>
                        <p className="text-sm text-gray-500 mt-1">{currentProject.description}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <i className="fas fa-times fa-lg"></i>
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-grow flex overflow-hidden">
                    {/* Left: Tabs & Content */}
                    <div className="flex-grow p-6 overflow-y-auto">
                        <div className="border-b border-gray-200 mb-6">
                            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                <button onClick={() => setActiveTab('tasks')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'tasks' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{t('tasks')}</button>
                                <button onClick={() => setActiveTab('risks')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'risks' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{t('risk_management_tab')}</button>
                                <button onClick={() => setActiveTab('report')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'report' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{t('generate_status_report')}</button>
                            </nav>
                        </div>
                        
                        {activeTab === 'tasks' && (
                            <div>
                                <div className="space-y-2">
                                    {currentProject.tasks.map(task => <TaskItem key={task.id} task={task} />)}
                                </div>
                                {canManage && (
                                    <form onSubmit={handleAddTask} className="mt-4 p-2 border-t flex items-center gap-2 flex-wrap">
                                        <input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="Add a new task..." className="flex-grow p-2 border rounded-md"/>
                                        <input type="date" value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)} className="p-2 border rounded-md text-sm"/>
                                        <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value as any)} className="p-2 border rounded-md text-sm">
                                            <option value="Low">{t('low')}</option>
                                            <option value="Medium">{t('medium')}</option>
                                            <option value="High">{t('high')}</option>
                                        </select>
                                        <div className="relative">
                                            <button type="button" onClick={() => setNewTaskAssigneeMenuOpen(!isNewTaskAssigneeMenuOpen)} className="flex items-center space-x-2 cursor-pointer p-2 border rounded-md hover:bg-gray-100 bg-white">
                                                {selectedNewTaskAssignee ? (
                                                    <Avatar user={selectedNewTaskAssignee} size="md" className="w-5 h-5 rounded-full flex-shrink-0" />
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 flex-shrink-0">
                                                        <i className="fas fa-user-plus text-xs"></i>
                                                    </div>
                                                )}
                                                <span className="text-xs text-gray-700 truncate max-w-[80px]">{selectedNewTaskAssignee ? selectedNewTaskAssignee.name : t('unassigned')}</span>
                                                <i className={`fas fa-chevron-down text-gray-400 text-xs transition-transform ${isNewTaskAssigneeMenuOpen ? 'rotate-180' : ''}`}></i>
                                            </button>
                                            {isNewTaskAssigneeMenuOpen && (
                                                <div className="absolute z-10 bottom-full mb-2 right-0 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                                                    <div className="p-2"><input type="text" placeholder="Search team..." value={newTaskAssigneeSearch} onChange={(e) => setNewTaskAssigneeSearch(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"/></div>
                                                    <div className="py-1 max-h-48 overflow-y-auto">
                                                        <button type="button" onClick={() => { setNewTaskAssigneeId(''); setNewTaskAssigneeMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3">
                                                            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 flex-shrink-0"><i className="fas fa-user-slash text-xs"></i></div>
                                                            <span>{t('unassigned')}</span>
                                                        </button>
                                                        {filteredNewTaskTeam.map(member => (
                                                            <button key={member.id} type="button" onClick={() => { setNewTaskAssigneeId(member.id); setNewTaskAssigneeMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3">
                                                                <Avatar user={member} size="md" className="w-6 h-6 rounded-full" /><span className="truncate">{member.name}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-emerald-700 text-sm">{t('add_skill')}</button>
                                    </form>
                                )}
                            </div>
                        )}

                        {activeTab === 'risks' && (
                             <div>
                                {currentProject.risks?.map(risk => (
                                    <div key={risk.id} className="p-4 border-b">
                                        <p className="font-semibold">{risk.description}</p>
                                        <div className="flex items-center text-sm text-gray-600 mt-1">
                                            <span>{t('likelihood')}: {t(risk.likelihood.toLowerCase())}</span>
                                            <span className="mx-2">|</span>
                                            <span>{t('impact')}: {t(risk.impact.toLowerCase())}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2"><strong>{t('mitigation_strategy')}:</strong> {risk.mitigationStrategy}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'report' && (
                            <div>
                                {loading ? (
                                    <div className="flex justify-center items-center"><i className="fas fa-spinner fa-spin text-2xl text-emerald-500"></i></div>
                                ) : report ? (
                                    <div className="prose prose-emerald max-w-none" dangerouslySetInnerHTML={{ __html: report.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></div>
                                ) : (
                                    <div className="text-center p-8 text-gray-500">
                                        <i className="fas fa-file-alt fa-3x"></i>
                                        <p className="mt-4">Generate a status report or task summary.</p>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                    {/* Right: Meta & Actions */}
                    <div className="w-80 bg-gray-50 border-l p-6 flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-gray-800 mb-4">{t('project_details')}</h3>
                            <div className="space-y-3 text-sm">
                                <p><strong>{t('status')}:</strong> <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[currentProject.status]}`}>{t(currentProject.status.replace(/\s+/g, '_').toLowerCase())}</span></p>
                                <p><strong>{t('due_date')}:</strong> {currentProject.dueDate}</p>
                            </div>
                            <h3 className="font-bold text-gray-800 mt-6 mb-4">{t('team_members')}</h3>
                            <div className="space-y-3">
                                {currentProject.team.map(member => (
                                    <div key={member.id} className="flex items-center space-x-3">
                                        <Avatar user={member} size="md" className="w-8 h-8 rounded-full" />
                                        <div>
                                            <p className="font-semibold text-sm">{member.name}</p>
                                            <p className="text-xs text-gray-500 capitalize">{t(member.role)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                         {canManage && (
                            <div className="space-y-2 border-t pt-4">
                                {activeTab === 'tasks' && <button onClick={handleGenerateTasks} disabled={loading} className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-emerald-700 disabled:bg-emerald-300 flex items-center justify-center text-sm"><i className="fas fa-magic mr-2"></i>{t('generate_tasks_with_ai')}</button>}
                                {activeTab === 'risks' && <button onClick={handleIdentifyRisks} disabled={loading} className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-emerald-700 disabled:bg-emerald-300 flex items-center justify-center text-sm"><i className="fas fa-magic mr-2"></i>{t('identify_risks_with_ai')}</button>}
                                {activeTab === 'report' && (
                                    <>
                                        <button onClick={handleGenerateReport} disabled={loading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center text-sm"><i className="fas fa-file-alt mr-2"></i>{t('generate_status_report')}</button>
                                        <button onClick={handleSummarizeTasks} disabled={loading} className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 disabled:bg-gray-300 flex items-center justify-center text-sm"><i className="fas fa-list-ul mr-2"></i>{t('summarize_tasks')}</button>
                                    </>
                                )}
                                <button onClick={() => setLogTimeModalOpen(true)} className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 flex items-center justify-center text-sm"><i className="fas fa-clock mr-2"></i>{t('log_time')}</button>
                                <button onClick={() => setDeleteModalOpen(true)} className="w-full text-red-600 py-2 px-4 rounded-lg font-semibold hover:bg-red-100 flex items-center justify-center text-sm"><i className="fas fa-trash mr-2"></i>{t('delete_project')}</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {isLogTimeModalOpen && currentUser && (
                 <LogTimeModal
                    onClose={() => setLogTimeModalOpen(false)}
                    onSave={handleSaveTimeLog}
                    projects={[currentProject]}
                    courses={[]}
                    user={currentUser}
                    initialEntity={{ type: 'project', id: currentProject.id }}
                />
            )}
            {isDeleteModalOpen && (
                <ConfirmationModal 
                    title={t('delete_project')}
                    message={t('confirm_delete_message')}
                    onConfirm={() => { onDeleteProject(project.id); onClose(); }}
                    onCancel={() => setDeleteModalOpen(false)}
                />
            )}
        </div>
    );
};


interface ProjectsProps {
    projects: Project[];
    users: User[];
    timeLogs: TimeLog[];
    onUpdateProject: (project: Project) => void;
    onAddProject: (project: Omit<Project, 'id' | 'tasks' | 'risks'>) => void;
    onDeleteProject: (projectId: number) => void;
    onAddTimeLog: (log: Omit<TimeLog, 'id' | 'userId'>) => void;
}

const Projects: React.FC<ProjectsProps> = ({ projects, users, timeLogs, onUpdateProject, onAddProject, onDeleteProject, onAddTimeLog }) => {
    const { t } = useLocalization();
    const { user: currentUser } = useAuth();
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    
    const canManage = currentUser?.role === 'manager' || currentUser?.role === 'administrator' || currentUser?.role === 'super_administrator';

    const handleSaveProject = (projectData: Project | Omit<Project, 'id' | 'tasks' | 'risks'>) => {
        if ('id' in projectData) {
            onUpdateProject(projectData);
        } else {
            onAddProject(projectData);
        }
        setFormModalOpen(false);
        setEditingProject(null);
    };

    const handleOpenForm = (project: Project | null = null) => {
        setEditingProject(project);
        setFormModalOpen(true);
    };

    const teamWorkload = useMemo(() => {
        const workload = new Map<number, { user: User, taskCount: number, totalHours: number }>();

        projects.forEach(project => {
            project.tasks.forEach(task => {
                if (task.assignee) {
                    const assigneeId = task.assignee.id;
                    if (!workload.has(assigneeId)) {
                        workload.set(assigneeId, {
                            user: task.assignee,
                            taskCount: 0,
                            totalHours: 0
                        });
                    }
                    const userData = workload.get(assigneeId)!;
                    userData.taskCount += 1;
                    userData.totalHours += task.estimatedTime || 0;
                }
            });
        });

        return Array.from(workload.values());
    }, [projects]);


    return (
        <div>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{t('project_management_title')}</h1>
                    <p className="mt-1 text-gray-600">{t('project_management_subtitle')}</p>
                </div>
                {canManage && (
                    <button onClick={() => handleOpenForm(null)} className="bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-700 flex items-center">
                        <i className="fas fa-plus mr-2"></i>
                        {t('new_project')}
                    </button>
                )}
            </div>
            
            {/* Team Workload Section */}
            <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-700 mb-4">Team Workload</h2>
                <div className="flex overflow-x-auto space-x-4 pb-4">
                    {teamWorkload.map(({ user, taskCount, totalHours }) => (
                        <div key={user.id} className="bg-white p-4 rounded-lg shadow-md flex-shrink-0 w-64">
                            <div className="flex items-center space-x-3">
                                <Avatar user={user} size="md" className="w-10 h-10 rounded-full" />
                                <div>
                                    <p className="font-bold text-sm">{user.name}</p>
                                    <p className="text-xs text-gray-500 capitalize">{t(user.role)}</p>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-around text-center">
                                <div>
                                    <p className="font-bold text-lg text-emerald-600">{taskCount}</p>
                                    <p className="text-xs text-gray-500">Tasks</p>
                                </div>
                                <div>
                                    <p className="font-bold text-lg text-emerald-600">{totalHours}</p>
                                    <p className="text-xs text-gray-500">Est. Hours</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


            {projects.length > 0 ? (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(project => (
                        <div key={project.id} className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-gray-800">{project.title}</h3>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusStyles[project.status]}`}>{t(project.status.replace(/\s+/g, '_').toLowerCase())}</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">{project.description.substring(0, 100)}...</p>
                            </div>
                            <div className="mt-4">
                                <div className="flex -space-x-2 overflow-hidden">
                                    {project.team.slice(0, 5).map(member => (
                                        <img key={member.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src={member.avatar} alt={member.name} title={member.name} />
                                    ))}
                                    {project.team.length > 5 && <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 text-xs font-medium text-gray-600 ring-2 ring-white">+{project.team.length - 5}</div>}
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <button onClick={() => setSelectedProject(project)} className="text-sm font-semibold text-emerald-600 hover:text-emerald-800">View Details</button>
                                    {canManage && <button onClick={() => handleOpenForm(project)} className="text-sm text-blue-600 hover:text-blue-800">Edit</button>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-4 bg-white mt-8 rounded-lg shadow-md">
                    <i className="fas fa-folder-open fa-4x text-gray-400"></i>
                    <h3 className="mt-6 text-xl font-semibold text-gray-800">{t('no_projects_found')}</h3>
                </div>
            )}
            
            {selectedProject && (
                <ProjectDetailModal 
                    project={selectedProject} 
                    onClose={() => setSelectedProject(null)} 
                    onUpdateProject={onUpdateProject}
                    onDeleteProject={onDeleteProject}
                    onAddTimeLog={onAddTimeLog}
                    timeLogs={timeLogs}
                />
            )}

             {isFormModalOpen && (
                <ProjectFormModal 
                    project={editingProject} 
                    users={users}
                    onClose={() => { setFormModalOpen(false); setEditingProject(null); }}
                    onSave={handleSaveProject}
                />
            )}
        </div>
    );
};

export default Projects;