import React, { useState, useEffect } from 'react';
import { 
  BookOpenIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  UsersIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

// Types pour Course Management
interface Course {
  id: string;
  title: string;
  instructor: string;
  description: string;
  duration: number; // en heures
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  price: number; // en XOF
  status: 'draft' | 'active' | 'completed' | 'archived';
  studentsCount: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  duration: number; // en minutes
  order: number;
  videoUrl?: string;
  resources: string[];
  isCompleted: boolean;
}

interface Student {
  id: string;
  name: string;
  email: string;
  courseId: string;
  enrolledAt: string;
  progress: number; // 0-100
  lastAccessed: string;
}


const CourseManagementUltraModern: React.FC = () => {
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  
  // États pour les modales
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Calcul des métriques
  const metrics = [
    {
      title: 'Total Cours',
      value: courses.length,
      change: '+12%',
      changeType: 'increase' as const,
      icon: BookOpenIcon,
      color: 'blue'
    },
    {
      title: 'Étudiants Inscrits',
      value: students.length,
      change: '+8%',
      changeType: 'increase' as const,
      icon: UserGroupIcon,
      color: 'green'
    },
    {
      title: 'Revenus Mensuels',
      value: '2,450,000 XOF',
      change: '+15%',
      changeType: 'increase' as const,
      icon: CurrencyDollarIcon,
      color: 'purple'
    },
    {
      title: 'Taux de Completion',
      value: '78%',
      change: '+5%',
      changeType: 'increase' as const,
      icon: ChartBarIcon,
      color: 'orange'
    }
  ];

  // Actions rapides
  const quickActions = [
    {
      label: 'Nouveau Cours',
      icon: PlusIcon,
      onClick: () => setShowCourseModal(true),
      color: 'blue'
    },
    {
      label: 'Ajouter Leçon',
      icon: BookOpenIcon,
      onClick: () => setShowLessonModal(true),
      color: 'green'
    },
    {
      label: 'Voir Analytics',
      icon: ChartBarIcon,
      onClick: () => console.log('Analytics'),
      color: 'purple'
    },
    {
      label: 'Exporter Données',
      icon: CalendarIcon,
      onClick: () => console.log('Export'),
      color: 'orange'
    }
  ];

  // Filtrage des cours
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    const matchesLevel = levelFilter === 'all' || course.level === levelFilter;
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesLevel && matchesCategory;
  });

  // Gestion des cours
  const handleCreateCourse = (courseData: Partial<Course>) => {
    const newCourse: Course = {
      id: Date.now().toString(),
      title: courseData.title || '',
      instructor: courseData.instructor || '',
      description: courseData.description || '',
      duration: courseData.duration || 0,
      level: courseData.level || 'beginner',
      category: courseData.category || '',
      price: courseData.price || 0,
      status: 'draft',
      studentsCount: 0,
      rating: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setCourses([...courses, newCourse]);
    setShowCourseModal(false);
  };

  const handleUpdateCourse = (id: string, courseData: Partial<Course>) => {
    setCourses(courses.map(course => 
      course.id === id 
        ? { ...course, ...courseData, updatedAt: new Date().toISOString() }
        : course
    ));
  };

  const handleDeleteCourse = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      setCourses(courses.filter(course => course.id !== id));
    }
  };

  // Gestion des leçons
  const handleCreateLesson = (lessonData: Partial<Lesson>) => {
    const newLesson: Lesson = {
      id: Date.now().toString(),
      courseId: lessonData.courseId || '',
      title: lessonData.title || '',
      description: lessonData.description || '',
      duration: lessonData.duration || 0,
      order: lessonData.order || 1,
      videoUrl: lessonData.videoUrl,
      resources: lessonData.resources || [],
      isCompleted: false
    };
    
    setLessons([...lessons, newLesson]);
    setShowLessonModal(false);
  };

  // Gestion des étudiants
  const handleEnrollStudent = (studentData: Partial<Student>) => {
    const newStudent: Student = {
      id: Date.now().toString(),
      name: studentData.name || '',
      email: studentData.email || '',
      courseId: studentData.courseId || '',
      enrolledAt: new Date().toISOString(),
      progress: 0,
      lastAccessed: new Date().toISOString()
    };
    
    setStudents([...students, newStudent]);
    setShowStudentModal(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestion des Cours
        </h1>
        <p className="text-gray-600">
          Gérez vos cours, leçons et étudiants en toute simplicité
        </p>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {metric.value}
                </p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs mois dernier</span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${
                metric.color === 'blue' ? 'bg-blue-100' :
                metric.color === 'green' ? 'bg-green-100' :
                metric.color === 'purple' ? 'bg-purple-100' :
                'bg-orange-100'
              }`}>
                <metric.icon className={`h-6 w-6 ${
                  metric.color === 'blue' ? 'text-blue-600' :
                  metric.color === 'green' ? 'text-green-600' :
                  metric.color === 'purple' ? 'text-purple-600' :
                  'text-orange-600'
                }`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Actions Rapides
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`flex items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors ${
                action.color === 'blue' ? 'hover:bg-blue-50' :
                action.color === 'green' ? 'hover:bg-green-50' :
                action.color === 'purple' ? 'hover:bg-purple-50' :
                'hover:bg-orange-50'
              }`}
            >
              <action.icon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des cours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="active">Actif</option>
              <option value="completed">Terminé</option>
              <option value="archived">Archivé</option>
            </select>
            
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les niveaux</option>
              <option value="beginner">Débutant</option>
              <option value="intermediate">Intermédiaire</option>
              <option value="advanced">Avancé</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg ${
                viewMode === 'kanban' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Liste des cours */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Cours ({filteredCourses.length})
          </h2>
        </div>
        
        {viewMode === 'grid' ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      par {course.instructor}
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {course.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleUpdateCourse(course.id, { status: 'active' })}
                      className="p-1 text-gray-400 hover:text-blue-600"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    course.status === 'active' ? 'bg-green-100 text-green-800' :
                    course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    course.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {course.status === 'active' ? 'Actif' :
                     course.status === 'draft' ? 'Brouillon' :
                     course.status === 'completed' ? 'Terminé' : 'Archivé'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {course.duration}h
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <UsersIcon className="h-4 w-4 mr-1" />
                    {course.studentsCount} étudiants
                  </div>
                  <div className="flex items-center">
                    <StarIcon className="h-4 w-4 mr-1" />
                    {course.rating.toFixed(1)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    {course.price.toLocaleString()} XOF
                  </span>
                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Voir détails
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instructeur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Niveau
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Étudiants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {course.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {course.category}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.instructor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        course.level === 'beginner' ? 'bg-green-100 text-green-800' :
                        course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {course.level === 'beginner' ? 'Débutant' :
                         course.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.duration}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.studentsCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.price.toLocaleString()} XOF
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        course.status === 'active' ? 'bg-green-100 text-green-800' :
                        course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        course.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {course.status === 'active' ? 'Actif' :
                         course.status === 'draft' ? 'Brouillon' :
                         course.status === 'completed' ? 'Terminé' : 'Archivé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedCourse(course)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateCourse(course.id, { status: 'active' })}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="text-red-600 hover:text-red-900"
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
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Brouillons</h3>
                <div className="space-y-3">
                  {filteredCourses.filter(c => c.status === 'draft').map((course) => (
                    <div key={course.id} className="bg-white p-3 rounded-lg border">
                      <h4 className="font-medium text-gray-900">{course.title}</h4>
                      <p className="text-sm text-gray-500">{course.instructor}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Actifs</h3>
                <div className="space-y-3">
                  {filteredCourses.filter(c => c.status === 'active').map((course) => (
                    <div key={course.id} className="bg-white p-3 rounded-lg border">
                      <h4 className="font-medium text-gray-900">{course.title}</h4>
                      <p className="text-sm text-gray-500">{course.instructor}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Terminés</h3>
                <div className="space-y-3">
                  {filteredCourses.filter(c => c.status === 'completed').map((course) => (
                    <div key={course.id} className="bg-white p-3 rounded-lg border">
                      <h4 className="font-medium text-gray-900">{course.title}</h4>
                      <p className="text-sm text-gray-500">{course.instructor}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modales (à implémenter) */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Nouveau Cours</h3>
            <p className="text-gray-600 mb-4">
              Formulaire de création de cours à implémenter
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCourseModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={() => setShowCourseModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagementUltraModern;
