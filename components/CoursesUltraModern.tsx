import React, { useState, useMemo } from 'react';
import { Course, Lesson } from '../types';
import CourseFormModal from './forms/CourseFormModal';
import LessonFormModal from './forms/LessonFormModal';

interface CoursesUltraModernProps {
  onAddCourse?: (course: Course) => void;
  onUpdateCourse?: (id: string, course: Course) => void;
  onDeleteCourse?: (id: string) => void;
  onAddLesson?: (courseId: string, lesson: Lesson) => void;
  onUpdateLesson?: (courseId: string, lessonId: string, lesson: Lesson) => void;
  onDeleteLesson?: (courseId: string, lessonId: string) => void;
}

const CoursesUltraModern: React.FC<CoursesUltraModernProps> = ({
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson
}) => {
  const [activeTab, setActiveTab] = useState<'courses' | 'lessons' | 'progress' | 'analytics'>('courses');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'progress' | 'rating'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'draft'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // État pour les modales
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Données de démonstration
  const [courses, setCourses] = useState<Course[]>([
    {
      id: '1',
      title: 'React Avancé',
      description: 'Maîtrisez les concepts avancés de React',
      instructor: 'Jean Dupont',
      duration: 120,
      level: 'intermediate',
      category: 'Développement',
      status: 'active',
      progress: 75,
      rating: 4.8,
      studentsCount: 1250,
      price: 99,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      lessons: [
        {
          id: '1-1',
          title: 'Hooks avancés',
          description: 'useEffect, useContext, useReducer',
          duration: 45,
          order: 1,
          videoUrl: 'https://example.com/video1',
          resources: ['PDF Guide', 'Code Examples']
        },
        {
          id: '1-2',
          title: 'Performance Optimization',
          description: 'Memoization et optimisation des performances',
          duration: 60,
          order: 2,
          videoUrl: 'https://example.com/video2',
          resources: ['Performance Checklist']
        }
      ]
    },
    {
      id: '2',
      title: 'TypeScript Fundamentals',
      description: 'Apprenez TypeScript de A à Z',
      instructor: 'Marie Martin',
      duration: 90,
      level: 'beginner',
      category: 'Développement',
      status: 'active',
      progress: 60,
      rating: 4.9,
      studentsCount: 2100,
      price: 79,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-18'),
      lessons: [
        {
          id: '2-1',
          title: 'Types de base',
          description: 'string, number, boolean, array',
          duration: 30,
          order: 1,
          videoUrl: 'https://example.com/video3',
          resources: ['TypeScript Cheat Sheet']
        }
      ]
    },
    {
      id: '3',
      title: 'UI/UX Design',
      description: 'Principes de design moderne',
      instructor: 'Sophie Bernard',
      duration: 150,
      level: 'intermediate',
      category: 'Design',
      status: 'draft',
      progress: 25,
      rating: 4.7,
      studentsCount: 890,
      price: 129,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-15'),
      lessons: []
    }
  ]);

  const [lessons, setLessons] = useState<Lesson[]>([]);

  // Métriques
  const metrics = useMemo(() => {
    const totalCourses = courses.length;
    const activeCourses = courses.filter(c => c.status === 'active').length;
    const totalStudents = courses.reduce((sum, c) => sum + c.studentsCount, 0);
    const averageRating = courses.length > 0 ? courses.reduce((sum, c) => sum + c.rating, 0) / courses.length : 0;
    const totalRevenue = courses.reduce((sum, c) => sum + (c.price * c.studentsCount), 0);
    const averageProgress = courses.length > 0 ? courses.reduce((sum, c) => sum + c.progress, 0) / courses.length : 0;

    return {
      totalCourses,
      activeCourses,
      totalStudents,
      averageRating,
      totalRevenue,
      averageProgress
    };
  }, [courses]);

  // Filtrage et tri
  const filteredCourses = useMemo(() => {
    let filtered = courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });

    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'progress':
          aValue = a.progress;
          bValue = b.progress;
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        default:
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [courses, searchTerm, sortBy, sortOrder, filterStatus, filterCategory]);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(courses.map(c => c.category))];
    return uniqueCategories;
  }, [courses]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    if (progress >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const handleAddCourse = () => {
    setEditingCourse(null);
    setIsCourseModalOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsCourseModalOpen(true);
  };

  const handleDeleteCourse = (courseId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      setCourses(prev => prev.filter(c => c.id !== courseId));
      if (onDeleteCourse) onDeleteCourse(courseId);
    }
  };

  const handleAddLesson = (course: Course) => {
    setSelectedCourse(course);
    setEditingLesson(null);
    setIsLessonModalOpen(true);
  };

  const handleEditLesson = (course: Course, lesson: Lesson) => {
    setSelectedCourse(course);
    setEditingLesson(lesson);
    setIsLessonModalOpen(true);
  };

  const handleDeleteLesson = (courseId: string, lessonId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette leçon ?')) {
      setCourses(prev => prev.map(c => 
        c.id === courseId 
          ? { ...c, lessons: c.lessons.filter(l => l.id !== lessonId) }
          : c
      ));
      if (onDeleteLesson) onDeleteLesson(courseId, lessonId);
    }
  };

  const renderCourseCard = (course: Course) => (
    <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {course.title}
            </h3>
            <p className="text-gray-600 text-sm mb-2">{course.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span><i className="fas fa-user mr-1"></i>{course.instructor}</span>
              <span><i className="fas fa-clock mr-1"></i>{formatDuration(course.duration)}</span>
              <span><i className="fas fa-users mr-1"></i>{course.studentsCount}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(course.price)}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-yellow-500">
                <i className="fas fa-star"></i>
              </span>
              <span className="text-sm text-gray-600">{course.rating}</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Progression</span>
            <span className="text-sm font-medium text-gray-900">{course.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getProgressColor(course.progress)}`}
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
              {course.status}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
              {course.level}
            </span>
          </div>
          <span className="text-sm text-gray-500">{course.category}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {course.lessons.length} leçon{course.lessons.length > 1 ? 's' : ''}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleEditCourse(course)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Modifier"
            >
              <i className="fas fa-edit"></i>
            </button>
            <button
              onClick={() => handleAddLesson(course)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Ajouter leçon"
            >
              <i className="fas fa-plus"></i>
            </button>
            <button
              onClick={() => handleDeleteCourse(course.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Supprimer"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLessonCard = (course: Course, lesson: Lesson) => (
    <div key={lesson.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-1">{lesson.title}</h4>
            <p className="text-gray-600 text-sm mb-2">{lesson.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span><i className="fas fa-clock mr-1"></i>{formatDuration(lesson.duration)}</span>
              <span><i className="fas fa-sort-numeric-up mr-1"></i>Ordre: {lesson.order}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleEditLesson(course, lesson)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Modifier"
            >
              <i className="fas fa-edit"></i>
            </button>
            <button
              onClick={() => handleDeleteLesson(course.id, lesson.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Supprimer"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        </div>

        {lesson.resources && lesson.resources.length > 0 && (
          <div className="mt-3">
            <div className="text-sm text-gray-600 mb-2">Ressources:</div>
            <div className="flex flex-wrap gap-2">
              {lesson.resources.map((resource, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  {resource}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Cours</h1>
              <p className="text-gray-600">Formations et leçons interactives</p>
            </div>
            <button
              onClick={handleAddCourse}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <i className="fas fa-plus"></i>
              <span>Nouveau Cours</span>
            </button>
          </div>
        </div>
      </div>

      {/* Métriques */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
            <div className="flex items-center">
              <i className="fas fa-graduation-cap text-2xl mr-3"></i>
              <div>
                <p className="text-blue-100 text-sm">Total Cours</p>
                <p className="text-2xl font-bold">{metrics.totalCourses}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
            <div className="flex items-center">
              <i className="fas fa-play-circle text-2xl mr-3"></i>
              <div>
                <p className="text-green-100 text-sm">Cours Actifs</p>
                <p className="text-2xl font-bold">{metrics.activeCourses}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
            <div className="flex items-center">
              <i className="fas fa-users text-2xl mr-3"></i>
              <div>
                <p className="text-purple-100 text-sm">Étudiants</p>
                <p className="text-2xl font-bold">{metrics.totalStudents.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 rounded-lg text-white">
            <div className="flex items-center">
              <i className="fas fa-star text-2xl mr-3"></i>
              <div>
                <p className="text-yellow-100 text-sm">Note Moyenne</p>
                <p className="text-2xl font-bold">{metrics.averageRating.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="px-6 py-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'courses', label: 'Cours', icon: 'fas fa-graduation-cap' },
            { id: 'lessons', label: 'Leçons', icon: 'fas fa-book' },
            { id: 'progress', label: 'Progression', icon: 'fas fa-chart-line' },
            { id: 'analytics', label: 'Analytics', icon: 'fas fa-chart-bar' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className={tab.icon}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Rechercher des cours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="completed">Terminé</option>
              <option value="draft">Brouillon</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="createdAt">Date de création</option>
              <option value="title">Titre</option>
              <option value="progress">Progression</option>
              <option value="rating">Note</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title={`Trier ${sortOrder === 'asc' ? 'décroissant' : 'croissant'}`}
            >
              <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Boutons de vue */}
      <div className="px-6 py-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Vue:</span>
          <div className="flex space-x-1">
            {[
              { id: 'grid', icon: 'fas fa-th', label: 'Grille' },
              { id: 'list', icon: 'fas fa-list', label: 'Liste' },
              { id: 'kanban', icon: 'fas fa-columns', label: 'Kanban' }
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as any)}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === mode.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={mode.label}
              >
                <i className={mode.icon}></i>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="px-6 pb-6">
        {activeTab === 'courses' && (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : viewMode === 'list'
              ? 'grid-cols-1'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {filteredCourses.map(course => renderCourseCard(course))}
          </div>
        )}

        {activeTab === 'lessons' && (
          <div className="space-y-4">
            {courses.map(course => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                  <p className="text-gray-600 text-sm">{course.lessons.length} leçon{course.lessons.length > 1 ? 's' : ''}</p>
                </div>
                <div className="p-4">
                  {course.lessons.length > 0 ? (
                    <div className="grid gap-4">
                      {course.lessons.map(lesson => renderLessonCard(course, lesson))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <i className="fas fa-book text-4xl mb-4"></i>
                      <p>Aucune leçon disponible</p>
                      <button
                        onClick={() => handleAddLesson(course)}
                        className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Ajouter la première leçon
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="grid gap-6">
            {courses.map(course => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                  <span className="text-2xl font-bold text-gray-900">{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div 
                    className={`h-3 rounded-full ${getProgressColor(course.progress)}`}
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{course.lessons.length} leçon{course.lessons.length > 1 ? 's' : ''}</span>
                  <span>{formatDuration(course.duration)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenus par cours</h3>
              <div className="space-y-4">
                {courses.map(course => (
                  <div key={course.id} className="flex items-center justify-between">
                    <span className="text-gray-600">{course.title}</span>
                    <span className="font-semibold">{formatCurrency(course.price * course.studentsCount)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Revenus totaux</span>
                  <span className="font-semibold text-green-600">{formatCurrency(metrics.totalRevenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Progression moyenne</span>
                  <span className="font-semibold">{metrics.averageProgress.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Note moyenne</span>
                  <span className="font-semibold">{metrics.averageRating.toFixed(1)}/5</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modales améliorées avec formulaires complets */}
      <CourseFormModal
        isOpen={isCourseModalOpen}
        onClose={() => {
          setIsCourseModalOpen(false);
          setEditingCourse(null);
        }}
        onSuccess={() => {
          // Recharger les cours
          console.log('Cours créé/modifié avec succès');
        }}
        editingCourse={editingCourse}
      />

      <LessonFormModal
        isOpen={isLessonModalOpen}
        onClose={() => {
          setIsLessonModalOpen(false);
          setEditingLesson(null);
        }}
        onSuccess={() => {
          // Recharger les leçons
          console.log('Leçon créée/modifiée avec succès');
        }}
        editingLesson={editingLesson}
        courseId={selectedCourse?.id}
        existingOrders={selectedCourse?.lessons.map(l => l.order) || []}
      />
    </div>
  );
};

export default CoursesUltraModern;
