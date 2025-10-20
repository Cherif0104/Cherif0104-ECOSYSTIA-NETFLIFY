/**
 * 🎓 COURSES ULTRA MODERN V3 - STANDARDISÉ SUR PROJECTS
 * Architecture 100% identique à ProjectsUltraModernV2
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  AcademicCapIcon,
  BookOpenIcon,
  PlayIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon,
  ChartBarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  Squares2X2Icon,
  ListBulletIcon,
  TableCellsIcon,
  XMarkIcon,
  ExclamationCircleIcon,
  CheckIcon,
  UserIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContextSupabase';
import { Course, Lesson, CourseEnrollment, User } from '../types';
import { coursesService } from '../services/coursesService';
import { userService } from '../services/userService';
import ConfirmationModal from './common/ConfirmationModal';
import CourseFormModal from './forms/CourseFormModal';
import LessonFormModal from './forms/LessonFormModal';

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

const CoursesUltraModernV3Standard: React.FC = () => {
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
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
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
      
      // Charger les cours, leçons, inscriptions et utilisateurs depuis Supabase (temporairement sans filtrage strict)
      const [coursesData, usersData] = await Promise.all([
        coursesService.getCourses(), // Récupérer tous les cours pour l'instant
        userService.getAll()
      ]);
      
      setCourses(coursesData);
      setUsers(usersData);
      
      console.log(`✅ ${coursesData.length} cours et ${usersData.length} utilisateurs chargés depuis Supabase`);
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
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
  const metrics = useMemo((): CourseMetrics => {
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

  // Logique de filtrage et recherche
  const getFilteredAndSortedItems = (items: any[]) => {
    let filtered = items.filter(item => {
      const matchesSearch = !filters.search ||
        item.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.instructor?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus = !filters.status || filters.status === 'all' || item.status === filters.status;
      const matchesCategory = !filters.category || filters.category === 'all' || item.category === filters.category;
      const matchesLevel = !filters.level || filters.level === 'all' || item.level === filters.level;
      const matchesInstructor = !filters.instructor || filters.instructor === 'all' || item.instructor === filters.instructor;

      return matchesSearch && matchesStatus && matchesCategory && matchesLevel && matchesInstructor;
    });

    return filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof typeof a];
      let bValue: any = b[sortBy as keyof typeof b];

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
  };

  const currentItems = useMemo(() => {
    switch (activeTab) {
      case 'courses':
        return getFilteredAndSortedItems(courses);
      case 'lessons':
        return getFilteredAndSortedItems(lessons);
      case 'enrollments':
        return getFilteredAndSortedItems(enrollments);
      default:
        return [];
    }
  }, [activeTab, courses, lessons, enrollments, filters, sortBy, sortOrder]);

  // Fonctions CRUD
  const handleCreateCourse = async (courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const createdCourse = await coursesService.createCourse(courseData);
      if (createdCourse) {
        setCourses(prev => [createdCourse, ...prev]);
        console.log('✅ Cours créé avec succès');
        await loadData(); // Recharger pour cohérence
      }
    } catch (error) {
      console.error('❌ Erreur création cours:', error);
      setError('Erreur lors de la création du cours');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async (id: string, courseData: Partial<Course>) => {
    try {
      setLoading(true);
      const updatedCourse = await coursesService.updateCourse(id, courseData);
      if (updatedCourse) {
        setCourses(prev => prev.map(course => course.id === id ? updatedCourse : course));
        console.log('✅ Cours mis à jour avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour cours:', error);
      setError('Erreur lors de la mise à jour du cours');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      setLoading(true);
      await coursesService.deleteCourse(id);
      setCourses(prev => prev.filter(course => course.id !== id));
      console.log('✅ Cours supprimé avec succès');
    } catch (error) {
      console.error('❌ Erreur suppression cours:', error);
      setError('Erreur lors de la suppression du cours');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLesson = async (lessonData: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const createdLesson = await coursesService.createLesson(lessonData);
      if (createdLesson) {
        setLessons(prev => [createdLesson, ...prev]);
        console.log('✅ Leçon créée avec succès');
        await loadData(); // Recharger pour cohérence
      }
    } catch (error) {
      console.error('❌ Erreur création leçon:', error);
      setError('Erreur lors de la création de la leçon');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLesson = async (id: string, lessonData: Partial<Lesson>) => {
    try {
      setLoading(true);
      const updatedLesson = await coursesService.updateLesson(id, lessonData);
      if (updatedLesson) {
        setLessons(prev => prev.map(lesson => lesson.id === id ? updatedLesson : lesson));
        console.log('✅ Leçon mise à jour avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour leçon:', error);
      setError('Erreur lors de la mise à jour de la leçon');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    try {
      setLoading(true);
      await coursesService.deleteLesson(id);
      setLessons(prev => prev.filter(lesson => lesson.id !== id));
      console.log('✅ Leçon supprimée avec succès');
    } catch (error) {
      console.error('❌ Erreur suppression leçon:', error);
      setError('Erreur lors de la suppression de la leçon');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    
    try {
      if (deletingItem.type === 'course') {
        await handleDeleteCourse(deletingItem.id);
      } else if (deletingItem.type === 'lesson') {
        await handleDeleteLesson(deletingItem.id);
      }
      setShowDeleteModal(false);
      setDeletingItem(null);
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
    }
  };

  // Fonctions utilitaires
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'published': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="w-4 h-4" />;
      case 'draft': return <ClockIcon className="w-4 h-4" />;
      case 'completed': return <CheckIcon className="w-4 h-4" />;
      case 'archived': return <XMarkIcon className="w-4 h-4" />;
      case 'published': return <PlayIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !isRefreshing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Cours</h1>
              <p className="text-gray-600">Cours, leçons et inscriptions</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setEditingCourse(null);
                  setEditingLesson(null);
                  if (activeTab === 'courses') setShowCourseModal(true);
                  else if (activeTab === 'lessons') setShowLessonModal(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                {activeTab === 'courses' ? 'Nouveau Cours' : activeTab === 'lessons' ? 'Nouvelle Leçon' : 'Nouvelle Inscription'}
              </button>
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Métriques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AcademicCapIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Cours</p>
                <p className="text-2xl font-semibold text-gray-900">{metrics.totalCourses}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PlayIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Cours Actifs</p>
                <p className="text-2xl font-semibold text-gray-900">{metrics.activeCourses}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpenIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Leçons</p>
                <p className="text-2xl font-semibold text-gray-900">{metrics.totalLessons}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <StarIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Note Moyenne</p>
                <p className="text-2xl font-semibold text-gray-900">{metrics.averageRating}/5</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('courses')}
              className={`${activeTab === 'courses' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
            >
              Cours
            </button>
            <button
              onClick={() => setActiveTab('lessons')}
              className={`${activeTab === 'lessons' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
            >
              Leçons
            </button>
            <button
              onClick={() => setActiveTab('enrollments')}
              className={`${activeTab === 'enrollments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
            >
              Inscriptions
            </button>
          </nav>
        </div>

        {/* Filtres et contrôles */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Recherche */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filtres */}
            <div className="flex flex-wrap items-center space-x-4">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="draft">Brouillon</option>
                <option value="completed">Terminé</option>
                <option value="archived">Archivé</option>
                <option value="published">Publié</option>
              </select>

              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les niveaux</option>
                <option value="beginner">Débutant</option>
                <option value="intermediate">Intermédiaire</option>
                <option value="advanced">Avancé</option>
                <option value="expert">Expert</option>
              </select>

              <select
                value={filters.instructor}
                onChange={(e) => setFilters(prev => ({ ...prev, instructor: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les instructeurs</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>

              {/* Tri */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt-desc">Plus récent</option>
                <option value="createdAt-asc">Plus ancien</option>
                <option value="title-asc">Titre A-Z</option>
                <option value="title-desc">Titre Z-A</option>
                <option value="price-desc">Prix (élevé)</option>
                <option value="price-asc">Prix (faible)</option>
                <option value="rating-desc">Mieux notés</option>
              </select>
            </div>

            {/* Vues */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <TableCellsIcon className="h-5 w-5" />
              </button>
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
                <p className="text-sm text-red-700 mt-1">{errorState}</p>
              </div>
            </div>
          </div>
        )}

        {/* Liste des éléments */}
        {currentItems.length === 0 ? (
          <div className="text-center py-12">
            <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun élément trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search || filters.status || filters.category || filters.level || filters.instructor
                ? 'Aucun élément ne correspond aux filtres appliqués.'
                : `Commencez par créer votre premier ${activeTab === 'courses' ? 'cours' : activeTab === 'lessons' ? 'leçon' : 'inscription'}.`
              }
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setEditingCourse(null);
                  setEditingLesson(null);
                  if (activeTab === 'courses') setShowCourseModal(true);
                  else if (activeTab === 'lessons') setShowLessonModal(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Créer un élément
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentItems.map((item: any) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                          {item.description || 'Aucune description'}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            {formatDate(item.createdAt)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.status)}
                            <span className="ml-1">{item.status}</span>
                          </span>
                        </div>
                        {activeTab === 'courses' && (
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(item.level)}`}>
                              {item.level}
                            </span>
                            <span className="flex items-center">
                              <StarIcon className="w-4 h-4 mr-1" />
                              {item.rating || 0}/5
                            </span>
                            <span className="flex items-center">
                              <UserGroupIcon className="w-4 h-4 mr-1" />
                              {item.studentsCount || 0} étudiants
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {activeTab === 'courses' ? formatCurrency(item.price || 0) : item.duration || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            if (activeTab === 'courses') {
                              setEditingCourse(item);
                              setShowCourseModal(true);
                            } else if (activeTab === 'lessons') {
                              setEditingLesson(item);
                              setShowLessonModal(true);
                            }
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                        >
                          <PencilIcon className="w-4 h-4 mr-1" />
                          Modifier
                        </button>
                        <button
                          onClick={() => {
                            setDeletingItem({ id: item.id, type: activeTab.slice(0, -1) });
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                        >
                          <TrashIcon className="w-4 h-4 mr-1" />
                          Supprimer
                        </button>
                      </div>
                      <div className="text-sm text-gray-500">
                        {activeTab === 'courses' ? item.instructor : item.courseTitle || 'N/A'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {activeTab === 'courses' ? 'Cours' : activeTab === 'lessons' ? 'Leçon' : 'Inscription'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        {activeTab === 'courses' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Niveau
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Prix
                            </th>
                          </>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.map((item: any) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(item.createdAt)}
                          </td>
                          {activeTab === 'courses' && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(item.level)}`}>
                                  {item.level}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatCurrency(item.price || 0)}
                              </td>
                            </>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  if (activeTab === 'courses') {
                                    setEditingCourse(item);
                                    setShowCourseModal(true);
                                  } else if (activeTab === 'lessons') {
                                    setEditingLesson(item);
                                    setShowLessonModal(true);
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Modifier
                              </button>
                              <button
                                onClick={() => {
                                  setDeletingItem({ id: item.id, type: activeTab.slice(0, -1) });
                                  setShowDeleteModal(true);
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {viewMode === 'table' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {activeTab === 'courses' ? 'Cours' : activeTab === 'lessons' ? 'Leçon' : 'Inscription'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        {activeTab === 'courses' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Niveau
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Prix
                            </th>
                          </>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.map((item: any) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(item.createdAt)}
                          </td>
                          {activeTab === 'courses' && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(item.level)}`}>
                                  {item.level}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatCurrency(item.price || 0)}
                              </td>
                            </>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  if (activeTab === 'courses') {
                                    setEditingCourse(item);
                                    setShowCourseModal(true);
                                  } else if (activeTab === 'lessons') {
                                    setEditingLesson(item);
                                    setShowLessonModal(true);
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Modifier
                              </button>
                              <button
                                onClick={() => {
                                  setDeletingItem({ id: item.id, type: activeTab.slice(0, -1) });
                                  setShowDeleteModal(true);
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modales */}
      <CourseFormModal
        isOpen={showCourseModal}
        onClose={() => {
          setShowCourseModal(false);
          setEditingCourse(null);
        }}
        onSuccess={editingCourse ? 
          (data) => handleUpdateCourse(editingCourse.id, data) : 
          handleCreateCourse
        }
        editingCourse={editingCourse}
        users={users}
      />

      <LessonFormModal
        isOpen={showLessonModal}
        onClose={() => {
          setShowLessonModal(false);
          setEditingLesson(null);
        }}
        onSuccess={editingLesson ? 
          (data) => handleUpdateLesson(editingLesson.id, data) : 
          handleCreateLesson
        }
        editingLesson={editingLesson}
        courses={courses}
        users={users}
      />

      {showDeleteModal && deletingItem && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingItem(null);
          }}
          onConfirm={handleDelete}
          title="Supprimer l'élément"
          message={`Êtes-vous sûr de vouloir supprimer ce ${deletingItem.type} ? Cette action est irréversible.`}
          confirmText="Supprimer"
          cancelText="Annuler"
          type="danger"
        />
      )}
    </div>
  );
};

export default CoursesUltraModernV3Standard;
