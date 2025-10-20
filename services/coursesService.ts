import { supabase } from './supabaseService';
import { Course, Lesson } from '../types';

class CoursesService {
  private coursesTableName = 'courses';
  private lessonsTableName = 'lessons';

  // ===== COURSES =====

  private mapCourseFromSupabase(data: any): Course {
    return {
      id: data.id,
      title: data.title,
      instructor: data.instructor,
      description: data.description,
      duration: data.duration,
      level: data.level,
      category: data.category,
      price: data.price,
      status: data.status,
      icon: data.icon,
      progress: data.progress || 0,
      rating: data.rating || 0,
      studentsCount: data.students_count || 0,
      lessons: data.lessons || [],
      modules: data.modules || [],
      createdAt: data.created_at ? new Date(data.created_at) : new Date(),
      updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
    };
  }

  private mapCourseToSupabase(course: Partial<Course>): any {
    const data: any = {};
    if (course.title !== undefined) data.title = course.title;
    if (course.instructor !== undefined) data.instructor = course.instructor;
    if (course.description !== undefined) data.description = course.description;
    if (course.duration !== undefined) data.duration = course.duration;
    if (course.level !== undefined) data.level = course.level;
    if (course.category !== undefined) data.category = course.category;
    if (course.price !== undefined) data.price = course.price;
    if (course.status !== undefined) data.status = course.status;
    if (course.icon !== undefined) data.icon = course.icon;
    if (course.progress !== undefined) data.progress = course.progress;
    if (course.rating !== undefined) data.rating = course.rating;
    if (course.studentsCount !== undefined) data.students_count = course.studentsCount;
    if (course.lessons !== undefined) data.lessons = course.lessons;
    if (course.modules !== undefined) data.modules = course.modules;
    data.updated_at = new Date().toISOString();
    return data;
  }

  async createCourse(courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<Course | null> {
    try {
      const supabaseData = this.mapCourseToSupabase(courseData);
      const { data, error } = await supabase
        .from(this.coursesTableName)
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Cours créé dans Supabase:', data.id);
      return this.mapCourseFromSupabase(data);
    } catch (error: any) {
      console.error('❌ Erreur création cours:', error.message);
      throw error;
    }
  }

  async getCourses(): Promise<Course[]> {
    try {
      const { data, error } = await supabase
        .from(this.coursesTableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log(`✅ ${data.length} cours récupérés`);
      return data.map(this.mapCourseFromSupabase);
    } catch (error: any) {
      console.error('❌ Erreur récupération cours:', error.message);
      return [];
    }
  }

  async getCourseById(id: string): Promise<Course | null> {
    try {
      const { data, error } = await supabase
        .from(this.coursesTableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      console.log('✅ Cours récupéré:', id);
      return this.mapCourseFromSupabase(data);
    } catch (error: any) {
      console.error('❌ Erreur récupération cours:', error.message);
      return null;
    }
  }

  async updateCourse(id: string, courseData: Partial<Course>): Promise<Course | null> {
    try {
      const supabaseData = this.mapCourseToSupabase(courseData);
      const { data, error } = await supabase
        .from(this.coursesTableName)
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Cours mis à jour dans Supabase:', id);
      return this.mapCourseFromSupabase(data);
    } catch (error: any) {
      console.error('❌ Erreur mise à jour cours:', error.message);
      throw error;
    }
  }

  async deleteCourse(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.coursesTableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      console.log('✅ Cours supprimé de Supabase:', id);
      return true;
    } catch (error: any) {
      console.error('❌ Erreur suppression cours:', error.message);
      return false;
    }
  }

  // ===== LESSONS =====

  private mapLessonFromSupabase(data: any): Lesson {
    return {
      id: data.id,
      courseId: data.course_id,
      title: data.title,
      description: data.description,
      content: data.content,
      duration: data.duration,
      orderIndex: data.order_index,
      videoUrl: data.video_url,
      resources: data.resources || [],
      isPublished: data.is_published,
      createdAt: data.created_at ? new Date(data.created_at) : new Date(),
      updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
    };
  }

  private mapLessonToSupabase(lesson: Partial<Lesson>): any {
    const data: any = {};
    if (lesson.courseId !== undefined) data.course_id = lesson.courseId;
    if (lesson.title !== undefined) data.title = lesson.title;
    if (lesson.description !== undefined) data.description = lesson.description;
    if (lesson.content !== undefined) data.content = lesson.content;
    if (lesson.duration !== undefined) data.duration = lesson.duration;
    if (lesson.orderIndex !== undefined) data.order_index = lesson.orderIndex;
    if (lesson.videoUrl !== undefined) data.video_url = lesson.videoUrl;
    if (lesson.resources !== undefined) data.resources = lesson.resources;
    if (lesson.isPublished !== undefined) data.is_published = lesson.isPublished;
    data.updated_at = new Date().toISOString();
    return data;
  }

  async createLesson(lessonData: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lesson | null> {
    try {
      const supabaseData = this.mapLessonToSupabase(lessonData);
      const { data, error } = await supabase
        .from(this.lessonsTableName)
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Leçon créée dans Supabase:', data.id);
      return this.mapLessonFromSupabase(data);
    } catch (error: any) {
      console.error('❌ Erreur création leçon:', error.message);
      throw error;
    }
  }

  async getLessonsByCourse(courseId: string): Promise<Lesson[]> {
    try {
      const { data, error } = await supabase
        .from(this.lessonsTableName)
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      console.log(`✅ ${data.length} leçons récupérées pour le cours`);
      return data.map(this.mapLessonFromSupabase);
    } catch (error: any) {
      console.error('❌ Erreur récupération leçons:', error.message);
      return [];
    }
  }

  async updateLesson(id: string, lessonData: Partial<Lesson>): Promise<Lesson | null> {
    try {
      const supabaseData = this.mapLessonToSupabase(lessonData);
      const { data, error } = await supabase
        .from(this.lessonsTableName)
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Leçon mise à jour dans Supabase:', id);
      return this.mapLessonFromSupabase(data);
    } catch (error: any) {
      console.error('❌ Erreur mise à jour leçon:', error.message);
      throw error;
    }
  }

  async deleteLesson(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.lessonsTableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      console.log('✅ Leçon supprimée de Supabase:', id);
      return true;
    } catch (error: any) {
      console.error('❌ Erreur suppression leçon:', error.message);
      return false;
    }
  }

  // ===== ANALYTICS =====

  async getCoursesAnalytics(): Promise<any> {
    try {
      const courses = await this.getCourses();

      const coursesByStatus = courses.reduce((acc, course) => {
        acc[course.status] = (acc[course.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const coursesByCategory = courses.reduce((acc, course) => {
        acc[course.category] = (acc[course.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const coursesByLevel = courses.reduce((acc, course) => {
        acc[course.level] = (acc[course.level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalStudents = courses.reduce((sum, course) => sum + course.studentsCount, 0);
      const avgRating = courses.length > 0
        ? courses.reduce((sum, course) => sum + course.rating, 0) / courses.length
        : 0;

      return {
        totalCourses: courses.length,
        activeCourses: courses.filter(c => c.status === 'active').length,
        draftCourses: courses.filter(c => c.status === 'draft').length,
        totalStudents,
        avgRating,
        coursesByStatus,
        coursesByCategory,
        coursesByLevel,
        topRatedCourses: courses.sort((a, b) => b.rating - a.rating).slice(0, 5),
        mostPopularCourses: courses.sort((a, b) => b.studentsCount - a.studentsCount).slice(0, 5),
      };
    } catch (error: any) {
      console.error('❌ Erreur calcul analytics cours:', error.message);
      throw error;
    }
  }
}

export const coursesService = new CoursesService();
