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
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import CourseFormModal from './forms/CourseFormModal';
import LessonFormModal from './forms/LessonFormModal';
import { Course, Lesson, CourseEnrollment } from '../types';
import { useLocalization } from '../contexts/LocalizationContext';
import { coursesService } from '../services/coursesService';

const CoursesUltraModernV2: React.FC = () => {
  const { t } = useLocalization();
  const [activeTab, setActiveTab] = useState<'courses' | 'lessons' | 'enrollments'>('courses');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Course | Lesson | CourseEnrollment | null>(null);

  // State pour les données
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fonction pour charger les données
  const loadData = async () => {
    try {
      setIsLoading(true);
      const coursesData = await coursesService.getCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error('Erreur lors du chargement des cours:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadData();
  }, []);

  // États pour les autres données
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);

  // Calculs de métriques
  const metrics = useMemo(() => {
    const totalCourses = courses.length;
    const publishedCourses = courses.filter(course => course.status === 'Published').length;
    const draftCourses = courses.filter(course => course.status === 'Draft').length;
    const totalStudents = enrollments.length;
    const activeStudents = enrollments.filter(enrollment => enrollment.status === 'Active').length;
    const completedStudents = enrollments.filter(enrollment => enrollment.status === 'Completed').length;
    const totalLessons = lessons.length;
    const avgRating = courses.reduce((sum, course) => sum + course.rating, 0) / courses.length || 0;
    const totalRevenue = courses.reduce((sum, course) => sum + (course.price * course.studentCount), 0);
    const avgProgress = enrollments.reduce((sum, enrollment) => sum + enrollment.progress, 0) / enrollments.length || 0;

    return {
      totalCourses,
      publishedCourses,
      draftCourses,
      totalStudents,
      activeStudents,
      completedStudents,
      totalLessons,
      avgRating,
      totalRevenue,
      avgProgress
    };
  }, [courses, lessons, enrollments]);

  // Filtrage des données
  const filteredData = useMemo(() => {
    let data: any[] = [];
    
    switch (activeTab) {
      case 'courses':
        data = courses;
        break;
      case 'lessons':
        data = lessons;
        break;
      case 'enrollments':
        data = enrollments;
        break;
    }

    return data.filter(item => {
      const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [activeTab, courses, lessons, enrollments, searchTerm, filterStatus, filterCategory]);

  const handleCreate = () => {
    setEditingItem(null);
    switch (activeTab) {
      case 'courses':
        setShowCourseModal(true);
        break;
      case 'lessons':
        setShowLessonModal(true);
        break;
    }
  };

  const handleEdit = (item: Course | Lesson | CourseEnrollment) => {
    setEditingItem(item);
    switch (activeTab) {
      case 'courses':
        setShowCourseModal(true);
        break;
      case 'lessons':
        setShowLessonModal(true);
        break;
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('confirm_delete'))) {
      switch (activeTab) {
        case 'courses':
          setCourses(prev => prev.filter(course => course.id !== id));
          break;
        case 'lessons':
          setLessons(prev => prev.filter(lesson => lesson.id !== id));
          break;
        case 'enrollments':
          setEnrollments(prev => prev.filter(enrollment => enrollment.id !== id));
          break;
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published':
      case 'Active':
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Draft':
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Archived':
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Débutant':
        return 'bg-blue-100 text-blue-800';
      case 'Intermédiaire':
        return 'bg-yellow-100 text-yellow-800';
      case 'Avancé':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <AcademicCapIcon className="h-8 w-8 text-blue-600" />
                {t('courses_management')}
              </h1>
              <p className="text-gray-600 mt-1">{t('manage_courses_lessons_enrollments')}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-2 rounded-lg ${viewMode === 'calendar' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title={t('calendar_view')}
              >
                <CalendarIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title={t('grid_view')}
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title={t('list_view')}
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
              <button
                onClick={handleCreate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                {t('add_new')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Métriques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('total_courses')}</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalCourses}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpenIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">{t('published')}: {metrics.publishedCourses}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('total_students')}</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalStudents}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">{t('active')}: {metrics.activeStudents}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('avg_rating')}</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.avgRating.toFixed(1)}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <StarIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-yellow-600 font-medium">{t('out_of_5')}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('total_revenue')}</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalRevenue)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <ArrowUpTrayIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-purple-600 font-medium">{t('avg_progress')}: {metrics.avgProgress.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'courses', label: t('courses'), count: courses.length },
                { id: 'lessons', label: t('lessons'), count: lessons.length },
                { id: 'enrollments', label: t('enrollments'), count: enrollments.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Filtres et recherche */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('search_courses')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">{t('all_status')}</option>
                  <option value="Published">{t('published')}</option>
                  <option value="Draft">{t('draft')}</option>
                  <option value="Archived">{t('archived')}</option>
                  <option value="Active">{t('active')}</option>
                  <option value="Completed">{t('completed')}</option>
                  <option value="Cancelled">{t('cancelled')}</option>
                </select>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">{t('all_categories')}</option>
                  <option value="Développement">{t('development')}</option>
                  <option value="Management">{t('management')}</option>
                  <option value="Design">{t('design')}</option>
                  <option value="Marketing">{t('marketing')}</option>
                </select>
                <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <FunnelIcon className="h-4 w-4" />
                  {t('filters')}
                </button>
              </div>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-6">
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredData.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {item.description}
                        </p>
                        {item.level && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(item.level)}`}>
                            {item.level}
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {item.instructor && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{t('instructor')}:</span>
                          <span className="text-gray-900">{item.instructor}</span>
                        </div>
                      )}
                      {item.duration && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{t('duration')}:</span>
                          <span className="text-gray-900">{item.duration} min</span>
                        </div>
                      )}
                      {item.price && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{t('price')}:</span>
                          <span className="text-gray-900 font-semibold">{formatCurrency(item.price)}</span>
                        </div>
                      )}
                      {item.rating && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{t('rating')}:</span>
                          <span className="text-gray-900 flex items-center gap-1">
                            <StarIcon className="h-4 w-4 text-yellow-500" />
                            {item.rating}
                          </span>
                        </div>
                      )}
                      {item.progress !== undefined && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{t('progress')}:</span>
                          <span className="text-gray-900">{item.progress}%</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 flex items-center justify-center gap-2"
                      >
                        <PencilIcon className="h-4 w-4" />
                        {t('edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 flex items-center justify-center gap-2"
                      >
                        <TrashIcon className="h-4 w-4" />
                        {t('delete')}
                      </button>
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
                        {t('title')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {activeTab === 'courses' ? t('instructor') : activeTab === 'lessons' ? t('course') : t('student')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('status')}
                      </th>
                      {activeTab === 'courses' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('price')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('students')}
                          </th>
                        </>
                      )}
                      {activeTab === 'enrollments' && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('progress')}
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.description?.substring(0, 100)}...
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.instructor || item.courseTitle || item.studentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        {activeTab === 'courses' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(item.price || 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.studentCount || 0}
                            </td>
                          </>
                        )}
                        {activeTab === 'enrollments' && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.progress}%
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
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
            )}

            {viewMode === 'calendar' && (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('calendar_view')}</h3>
                <p className="text-gray-600">{t('calendar_view_coming_soon')}</p>
              </div>
            )}

            {filteredData.length === 0 && (
              <div className="text-center py-12">
                <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_courses_data')}</h3>
                <p className="text-gray-600 mb-6">{t('no_courses_data_description')}</p>
                <button
                  onClick={handleCreate}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
                >
                  <PlusIcon className="h-5 w-5" />
                  {t('create_first')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      {showCourseModal && (
        <CourseFormModal
          isOpen={showCourseModal}
          onClose={() => {
            setShowCourseModal(false);
            setEditingItem(null);
          }}
          onSuccess={() => {
            // Handle course submission
            setShowCourseModal(false);
            setEditingItem(null);
            loadData(); // Reload data after successful submission
          }}
          editingCourse={editingItem as Course}
        />
      )}

      {showLessonModal && (
        <LessonFormModal
          isOpen={showLessonModal}
          onClose={() => {
            setShowLessonModal(false);
            setEditingItem(null);
          }}
          onSubmit={(data) => {
            // Handle lesson submission
            setShowLessonModal(false);
            setEditingItem(null);
          }}
          initialData={editingItem as Lesson}
          courses={courses}
        />
      )}
    </div>
  );
};

export default CoursesUltraModernV2;

