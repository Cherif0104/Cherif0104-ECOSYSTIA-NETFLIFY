/**
 * 🎓 COURSES ULTRA MODERN V3 - STANDARDISÉ SUR PROJECTS
 * Architecture identique à ProjectsUltraModernV2
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  AcademicCapIcon,
  BookOpenIcon,
  PlayIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContextSupabase';
import { Course, Lesson, CourseEnrollment, User } from '../types';
import { coursesService } from '../services/coursesService';
import { userService } from '../services/userService';
import CourseFormModal from './forms/CourseFormModal';
import LessonFormModal from './forms/LessonFormModal';
import ConfirmationModal from './common/ConfirmationModal';

// Types pour Courses UltraModern
interface CourseMetrics {
  totalCourses: number;
  activeCourses: number;
  completedCourses: number;
  totalLessons: number;
  totalEnrollments: number;
  averageRating: number;
  totalStudents: number;
  totalRevenue: number;
}

interface CourseFilters {
  search: string;
  status: string;
  category: string;
  level: string;
  instructor: string;
  priceRange: { min: number; max: number };
}

const CoursesUltraModernV3: React.FC = () => {
  const { t } = useLocalization();
  const { user } = useAuth();
  
  // États principaux
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // États pour les modales
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // États pour la sélection
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deletingItem, setDeletingItem] = useState<{id: string, type: string} | null>(null);
  
  // États pour les filtres et vues
  const [activeTab, setActiveTab] = useState<'courses' | 'lessons' | 'enrollments'>('courses');
  const [filters, setFilters] = useState<CourseFilters>({
    search: '',
    status: '',
    category: '',
    level: '',
    instructor: '',
    priceRange: { min: 0, max: 1000000 }
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('grid');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Chargement des données Courses...');
      
      // Charger les cours, leçons, inscriptions et utilisateurs depuis Supabase
      const [coursesData, usersData] = await Promise.all([
        coursesService.getCourses(), // Récupérer tous les cours pour l'instant
        userService.getAll()
      ]);
      
      setCourses(coursesData);
      setUsers(usersData);
      
      console.log(`✅ ${coursesData.length} cours et ${usersData.length} utilisateurs chargés depuis Supabase`);
    } catch (error) {
      console.error('❌ Erreur chargement données Courses:', error);
      setError('Erreur lors du chargement des données depuis la base de données');
      setCourses([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  // Calculer les métriques
  const metrics: CourseMetrics = useMemo(() => {
    const totalCourses = courses.length;
    const activeCourses = courses.filter(c => c.status === 'active').length;
    const completedCourses = courses.filter(c => c.status === 'completed').length;
    
    const totalLessons = courses.reduce((sum, course) => sum + (course.lessons?.length || 0), 0);
    const totalEnrollments = courses.reduce((sum, course) => sum + (course.studentsCount || 0), 0);
    
    const averageRating = courses.length > 0 
      ? courses.reduce((sum, course) => sum + (course.rating || 0), 0) / courses.length 
      : 0;
    
    const totalStudents = new Set(courses.flatMap(c => c.students || [])).size;
    const totalRevenue = courses.reduce((sum, course) => sum + (course.price || 0), 0);
    
    return {
      totalCourses,
      activeCourses,
      completedCourses,
      totalLessons,
      totalEnrollments,
      averageRating: Math.round(averageRating * 10) / 10,
      totalStudents,
      totalRevenue
    };
  }, [courses]);

  // Filtrer et trier les cours
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = courses.filter(course => {
      const matchesSearch = !filters.search || 
        course.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        course.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        course.instructor.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = !filters.status || course.status === filters.status;
      const matchesCategory = !filters.category || course.category === filters.category;
      const matchesLevel = !filters.level || course.level === filters.level;
      const matchesInstructor = !filters.instructor || course.instructor.toLowerCase().includes(filters.instructor.toLowerCase());
      
      return matchesSearch && matchesStatus && matchesCategory && matchesLevel && matchesInstructor;
    });
    
    // Trier
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Course];
      let bValue: any = b[sortBy as keyof Course];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  }, [courses, filters, sortBy, sortOrder]);

  // Actions rapides
  const quickActions = [
    {
      label: 'Nouveau Cours',
      icon: PlusIcon,
      onClick: () => {
        setEditingCourse(null);
        setShowCourseModal(true);
      },
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      label: 'Nouvelle Leçon',
      icon: BookOpenIcon,
      onClick: () => {
        setEditingLesson(null);
        setShowLessonModal(true);
      },
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      label: 'Voir Analytics',
      icon: ChartBarIcon,
      onClick: () => {
        window.dispatchEvent(new CustomEvent('navigate', { detail: 'analytics' }));
      },
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      label: 'Exporter Données',
      icon: ArrowDownTrayIcon,
      onClick: () => {
        // TODO: Implémenter l'export
        console.log('Export des données Courses');
      },
      color: 'bg-orange-600 hover:bg-orange-700'
    }
  ];

  // Gestion des cours
  const handleCreateCourse = async (courseData: Course | Omit<Course, 'id'>) => {
    try {
      if (!user?.id) {
        throw new Error('Utilisateur non connecté');
      }

      let result: Course | null = null;
      
      if ('id' in courseData && courseData.id) {
        // Mise à jour
        result = await coursesService.updateCourse(courseData.id, courseData);
      } else {
        // Création
        result = await coursesService.createCourse(courseData as Omit<Course, 'id'>);
      }
      
      if (result) {
        await loadData();
        setShowCourseModal(false);
        setEditingCourse(null);
        console.log('✅ Cours sauvegardé avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde cours:', error);
      setError('Erreur lors de la sauvegarde du cours');
    }
  };

  const handleDeleteCourse = async () => {
    if (!deletingItem) return;
    
    try {
      const success = await coursesService.deleteCourse(deletingItem.id);
      if (success) {
        await loadData();
        setShowDeleteModal(false);
        setDeletingItem(null);
        console.log('✅ Cours supprimé avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur suppression cours:', error);
      setError('Erreur lors de la suppression du cours');
    }
  };

  // Gestion des leçons
  const handleCreateLesson = async (lessonData: Lesson | Omit<Lesson, 'id'>) => {
    try {
      let result: Lesson | null = null;
      
      if ('id' in lessonData && lessonData.id) {
        // Mise à jour
        result = await coursesService.updateLesson(lessonData.id, lessonData);
      } else {
        // Création
        result = await coursesService.createLesson(lessonData as Omit<Lesson, 'id'>);
      }
      
      if (result) {
        await loadData();
        setShowLessonModal(false);
        setEditingLesson(null);
        console.log('✅ Leçon sauvegardée avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde leçon:', error);
      setError('Erreur lors de la sauvegarde de la leçon');
    }
  };

  const handleDeleteLesson = async () => {
    if (!deletingItem) return;
    
    try {
      const success = await coursesService.deleteLesson(deletingItem.id);
      if (success) {
        await loadData();
        setShowDeleteModal(false);
        setDeletingItem(null);
        console.log('✅ Leçon supprimée avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur suppression leçon:', error);
      setError('Erreur lors de la suppression de la leçon');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Cours</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez vos cours et formations
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <AcademicCapIcon className="h-8 w-8 text-blue-200" />
            <div className="ml-4">
              <p className="text-blue-100 text-sm font-medium">Total Cours</p>
              <p className="text-2xl font-bold">{metrics.totalCourses}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <PlayIcon className="h-8 w-8 text-green-200" />
            <div className="ml-4">
              <p className="text-green-100 text-sm font-medium">Cours Actifs</p>
              <p className="text-2xl font-bold">{metrics.activeCourses}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <BookOpenIcon className="h-8 w-8 text-purple-200" />
            <div className="ml-4">
              <p className="text-purple-100 text-sm font-medium">Total Leçons</p>
              <p className="text-2xl font-bold">{metrics.totalLessons}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-orange-200" />
            <div className="ml-4">
              <p className="text-orange-100 text-sm font-medium">Étudiants</p>
              <p className="text-2xl font-bold">{metrics.totalStudents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`${action.color} text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200`}
            >
              <action.icon className="h-5 w-5" />
              <span className="font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('courses')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'courses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Cours ({metrics.totalCourses})
            </button>
            <button
              onClick={() => setActiveTab('lessons')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'lessons'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Leçons ({metrics.totalLessons})
            </button>
            <button
              onClick={() => setActiveTab('enrollments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'enrollments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Inscriptions ({metrics.totalEnrollments})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Filtres et contrôles */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tous les statuts</option>
                  <option value="active">Actif</option>
                  <option value="completed">Terminé</option>
                  <option value="draft">Brouillon</option>
                  <option value="archived">Archivé</option>
                </select>
                
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Toutes les catégories</option>
                  <option value="programming">Programmation</option>
                  <option value="design">Design</option>
                  <option value="business">Business</option>
                  <option value="marketing">Marketing</option>
                  <option value="data">Data Science</option>
                </select>
                
                <select
                  value={filters.level}
                  onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tous les niveaux</option>
                  <option value="beginner">Débutant</option>
                  <option value="intermediate">Intermédiaire</option>
                  <option value="advanced">Avancé</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-white shadow-sm text-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title="Vue grille"
                  >
                    <Squares2X2Icon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-white shadow-sm text-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title="Vue liste"
                  >
                    <ListBulletIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'calendar' 
                        ? 'bg-white shadow-sm text-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title="Vue calendrier"
                  >
                    <CalendarIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'courses' ? (
            filteredAndSortedCourses.length === 0 ? (
              <div className="text-center py-12">
                <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun cours</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {courses.length === 0 
                    ? "Commencez par créer votre premier cours."
                    : "Aucun cours ne correspond à vos critères de recherche."
                  }
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setEditingCourse(null);
                      setShowCourseModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Nouveau Cours
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {filteredAndSortedCourses.map((course) => (
                      <div key={course.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                            <p className="mt-1 text-sm text-gray-500">{course.instructor}</p>
                            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{course.description}</p>
                          </div>
                          <div className="ml-4 flex space-x-1">
                            <button
                              onClick={() => {
                                setSelectedCourse(course);
                                // TODO: Implémenter la vue détaillée
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Voir"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingCourse(course);
                                setShowCourseModal(true);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Modifier"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setDeletingItem({ id: course.id, type: 'cours' });
                                setShowDeleteModal(true);
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Supprimer"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            <span>{course.duration} heures</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <StarIcon className="h-4 w-4 mr-1" />
                            <span>{course.rating}/5</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <UserGroupIcon className="h-4 w-4 mr-1" />
                            <span>{course.studentsCount} étudiants</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            course.status === 'active' ? 'bg-green-100 text-green-800' :
                            course.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {course.status === 'active' ? 'Actif' : 
                             course.status === 'completed' ? 'Terminé' :
                             course.status === 'draft' ? 'Brouillon' : 'Archivé'}
                          </span>
                          <span className="text-xs font-medium">
                            {course.price?.toLocaleString()} XOF
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {viewMode === 'list' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cours
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Instructeur
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Durée
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Niveau
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Prix
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAndSortedCourses.map((course) => (
                          <tr key={course.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{course.title}</div>
                                  <div className="text-sm text-gray-500 truncate max-w-xs">{course.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {course.instructor}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {course.duration}h
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {course.level}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                course.status === 'active' ? 'bg-green-100 text-green-800' :
                                course.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {course.status === 'active' ? 'Actif' : 
                                 course.status === 'completed' ? 'Terminé' :
                                 course.status === 'draft' ? 'Brouillon' : 'Archivé'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {course.price?.toLocaleString()} XOF
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedCourse(course);
                                    // TODO: Implémenter la vue détaillée
                                  }}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Voir détails"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingCourse(course);
                                    setShowCourseModal(true);
                                  }}
                                  className="text-indigo-600 hover:text-indigo-900"
                                  title="Modifier"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setDeletingItem({ id: course.id, type: 'cours' });
                                    setShowDeleteModal(true);
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                  title="Supprimer"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          ) : (
            // Onglets Leçons et Inscriptions
            <div className="text-center py-12">
              <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {activeTab === 'lessons' ? 'Leçons' : 'Inscriptions'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeTab === 'lessons' 
                  ? "Aucune leçon trouvée."
                  : "Aucune inscription trouvée."
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {showCourseModal && (
        <CourseFormModal
          isOpen={showCourseModal}
          editingCourse={editingCourse}
          onSuccess={handleCreateCourse}
          onClose={() => {
            setShowCourseModal(false);
            setEditingCourse(null);
          }}
        />
      )}

      {showLessonModal && (
        <LessonFormModal
          isOpen={showLessonModal}
          editingLesson={editingLesson}
          onSuccess={handleCreateLesson}
          onClose={() => {
            setShowLessonModal(false);
            setEditingLesson(null);
          }}
        />
      )}

      {showDeleteModal && deletingItem && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingItem(null);
          }}
          onConfirm={deletingItem.type === 'cours' ? handleDeleteCourse : handleDeleteLesson}
          title="Supprimer l'élément"
          message={`Êtes-vous sûr de vouloir supprimer ce ${deletingItem.type} ? Cette action est irréversible.`}
          confirmText="Supprimer"
          cancelText="Annuler"
        />
      )}
    </div>
  );
};

export default CoursesUltraModernV3;
