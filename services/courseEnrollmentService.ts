import { supabase } from './supabaseService';
import { CourseEnrollment } from '../types';

class CourseEnrollmentService {
  private tableName = 'course_enrollments';

  /**
   * Inscrire un utilisateur à un cours
   */
  async enroll(userId: string, courseId: string): Promise<CourseEnrollment | null> {
    try {
      // Vérifier si déjà inscrit
      const existing = await this.getUserCourseEnrollment(userId, courseId);
      if (existing) {
        console.log('⚠️ Utilisateur déjà inscrit à ce cours');
        return existing;
      }

      const enrollmentData = {
        user_id: userId,
        course_id: courseId,
        enrolled_date: new Date().toISOString().split('T')[0],
        progress: 0,
        completed_lessons: JSON.stringify([]),
        status: 'Active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([enrollmentData])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Inscription créée:', data.id);

      return {
        id: data.id,
        userId: data.user_id,
        courseId: data.course_id,
        enrolledDate: data.enrolled_date,
        progress: data.progress,
        completedLessons: JSON.parse(data.completed_lessons || '[]'),
        status: data.status,
        completionDate: data.completion_date,
      };
    } catch (error: any) {
      console.error('❌ Erreur inscription cours:', error.message);
      return null;
    }
  }

  /**
   * Récupérer toutes les inscriptions d'un utilisateur
   */
  async getUserEnrollments(userId: string): Promise<CourseEnrollment[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log(`✅ ${data.length} inscriptions trouvées pour l'utilisateur`);

      return data.map(doc => ({
        id: doc.id,
        userId: doc.user_id,
        courseId: doc.course_id,
        enrolledDate: doc.enrolled_date,
        progress: doc.progress,
        completedLessons: JSON.parse(doc.completed_lessons || '[]'),
        status: doc.status,
        completionDate: doc.completion_date,
      }));
    } catch (error: any) {
      console.error('❌ Erreur récupération inscriptions:', error.message);
      return [];
    }
  }

  /**
   * Récupérer l'inscription d'un utilisateur à un cours spécifique
   */
  async getUserCourseEnrollment(userId: string, courseId: string): Promise<CourseEnrollment | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return null;

      return {
        id: data.id,
        userId: data.user_id,
        courseId: data.course_id,
        enrolledDate: data.enrolled_date,
        progress: data.progress,
        completedLessons: JSON.parse(data.completed_lessons || '[]'),
        status: data.status,
        completionDate: data.completion_date,
      };
    } catch (error: any) {
      console.error('❌ Erreur vérification inscription:', error.message);
      return null;
    }
  }

  /**
   * Mettre à jour la progression (marquer une leçon comme complétée)
   */
  async markLessonCompleted(
    enrollmentId: string,
    lessonId: string,
    totalLessons: number = 10  // À calculer dynamiquement depuis le cours
  ): Promise<CourseEnrollment | null> {
    try {
      // Récupérer l'inscription actuelle
      const { data: enrollment, error: fetchError } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', enrollmentId)
        .single();

      if (fetchError) throw fetchError;

      const completedLessons = JSON.parse(enrollment.completed_lessons || '[]');
      
      // Ajouter la leçon si pas déjà complétée
      if (!completedLessons.includes(lessonId)) {
        completedLessons.push(lessonId);
      }

      // Calculer la nouvelle progression
      const newProgress = Math.min(
        Math.round((completedLessons.length / totalLessons) * 100),
        100
      );

      // Déterminer le nouveau statut
      const newStatus = newProgress === 100 ? 'Completed' : 'Active';
      const completionDate = newProgress === 100 
        ? new Date().toISOString().split('T')[0] 
        : null;

      // Mettre à jour dans Supabase
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          completed_lessons: JSON.stringify(completedLessons),
          progress: newProgress,
          status: newStatus,
          completion_date: completionDate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', enrollmentId)
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Progression mise à jour: ${newProgress}%`);

      return {
        id: data.id,
        userId: data.user_id,
        courseId: data.course_id,
        enrolledDate: data.enrolled_date,
        progress: data.progress,
        completedLessons: JSON.parse(data.completed_lessons),
        status: data.status,
        completionDate: data.completion_date,
      };
    } catch (error: any) {
      console.error('❌ Erreur mise à jour progression:', error.message);
      return null;
    }
  }

  /**
   * Abandonner un cours (Dropped)
   */
  async dropCourse(enrollmentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({ 
          status: 'Dropped',
          updated_at: new Date().toISOString()
        })
        .eq('id', enrollmentId);

      if (error) throw error;

      console.log('✅ Cours abandonné');
      return true;
    } catch (error: any) {
      console.error('❌ Erreur abandon cours:', error.message);
      return false;
    }
  }

  /**
   * Réactiver une inscription abandonnée
   */
  async reactivateEnrollment(enrollmentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({ 
          status: 'Active',
          updated_at: new Date().toISOString()
        })
        .eq('id', enrollmentId);

      if (error) throw error;

      console.log('✅ Inscription réactivée');
      return true;
    } catch (error: any) {
      console.error('❌ Erreur réactivation:', error.message);
      return false;
    }
  }

  /**
   * Récupérer tous les étudiants inscrits à un cours
   */
  async getCourseEnrollments(courseId: string): Promise<CourseEnrollment[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log(`✅ ${data.length} inscriptions au cours`);

      return data.map(doc => ({
        id: doc.id,
        userId: doc.user_id,
        courseId: doc.course_id,
        enrolledDate: doc.enrolled_date,
        progress: doc.progress,
        completedLessons: JSON.parse(doc.completed_lessons || '[]'),
        status: doc.status,
        completionDate: doc.completion_date,
      }));
    } catch (error: any) {
      console.error('❌ Erreur récupération inscriptions cours:', error.message);
      return [];
    }
  }

  /**
   * Obtenir les statistiques d'un cours
   */
  async getCourseStats(courseId: string): Promise<{
    totalEnrolled: number;
    activeStudents: number;
    completedStudents: number;
    droppedStudents: number;
    averageProgress: number;
  }> {
    try {
      const enrollments = await this.getCourseEnrollments(courseId);

      const stats = {
        totalEnrolled: enrollments.length,
        activeStudents: enrollments.filter(e => e.status === 'Active').length,
        completedStudents: enrollments.filter(e => e.status === 'Completed').length,
        droppedStudents: enrollments.filter(e => e.status === 'Dropped').length,
        averageProgress: enrollments.length > 0
          ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
          : 0,
      };

      console.log('📊 Statistiques cours:', stats);
      return stats;
    } catch (error: any) {
      console.error('❌ Erreur calcul statistiques:', error.message);
      return {
        totalEnrolled: 0,
        activeStudents: 0,
        completedStudents: 0,
        droppedStudents: 0,
        averageProgress: 0,
      };
    }
  }

  /**
   * Vérifier si un utilisateur a complété un cours
   */
  async hasCompletedCourse(userId: string, courseId: string): Promise<boolean> {
    try {
      const enrollment = await this.getUserCourseEnrollment(userId, courseId);
      return enrollment?.status === 'Completed' || false;
    } catch (error: any) {
      console.error('❌ Erreur vérification complétion:', error.message);
      return false;
    }
  }

  /**
   * Obtenir la progression d'un utilisateur sur un cours
   */
  async getUserCourseProgress(userId: string, courseId: string): Promise<number> {
    try {
      const enrollment = await this.getUserCourseEnrollment(userId, courseId);
      return enrollment?.progress || 0;
    } catch (error: any) {
      console.error('❌ Erreur récupération progression:', error.message);
      return 0;
    }
  }
}

export const courseEnrollmentService = new CourseEnrollmentService();