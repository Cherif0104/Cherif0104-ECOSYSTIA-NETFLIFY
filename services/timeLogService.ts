import { databases, DATABASE_ID, ID, Query } from './appwriteService';
import { TimeLog, Project, Course, Task } from '../types';

class TimeLogService {
  private get collectionId() {
    return 'time_logs';
  }

  private mapFromAppwrite(doc: any): TimeLog {
    return {
      id: doc.$id,
      userId: doc.userId,
      projectId: doc.projectId,
      taskId: doc.taskId,
      courseId: doc.courseId,
      description: doc.description,
      duration: doc.duration,
      date: doc.date,
      startTime: doc.startTime,
      endTime: doc.endTime,
      type: doc.type || 'work',
      status: doc.status || 'completed',
      createdAt: doc.$createdAt,
      updatedAt: doc.$updatedAt,
    };
  }

  private mapToAppwrite(timeLog: Partial<TimeLog>): any {
    const data: any = {};
    if (timeLog.userId !== undefined) data.userId = timeLog.userId;
    if (timeLog.projectId !== undefined) data.projectId = timeLog.projectId;
    if (timeLog.taskId !== undefined) data.taskId = timeLog.taskId;
    if (timeLog.courseId !== undefined) data.courseId = timeLog.courseId;
    if (timeLog.description !== undefined) data.description = timeLog.description;
    if (timeLog.duration !== undefined) data.duration = timeLog.duration;
    if (timeLog.date !== undefined) data.date = timeLog.date;
    if (timeLog.startTime !== undefined) data.startTime = timeLog.startTime;
    if (timeLog.endTime !== undefined) data.endTime = timeLog.endTime;
    if (timeLog.type !== undefined) data.type = timeLog.type;
    if (timeLog.status !== undefined) data.status = timeLog.status;
    return data;
  }

  // ===== CRUD OPERATIONS =====

  async createTimeLog(timeLogData: Omit<TimeLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<TimeLog | null> {
    try {
      const appwriteData = this.mapToAppwrite(timeLogData);
      const response = await databases.createDocument(
        DATABASE_ID,
        this.collectionId,
        ID.unique(),
        appwriteData
      );
      console.log('✅ Time log créé dans Appwrite:', response.$id);
      return this.mapFromAppwrite(response);
    } catch (error) {
      console.error('❌ Erreur création time log:', error);
      throw error;
    }
  }

  async getTimeLogs(): Promise<TimeLog[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        this.collectionId
      );
      console.log(`✅ ${response.documents.length} time logs récupérés`);
      return response.documents.map(doc => this.mapFromAppwrite(doc));
    } catch (error) {
      console.error('❌ Erreur récupération time logs:', error);
      return [];
    }
  }

  async getTimeLogById(id: string): Promise<TimeLog | null> {
    try {
      const response = await databases.getDocument(
        DATABASE_ID,
        this.collectionId,
        id
      );
      console.log('✅ Time log récupéré:', id);
      return this.mapFromAppwrite(response);
    } catch (error) {
      console.error('❌ Erreur récupération time log:', error);
      return null;
    }
  }

  async updateTimeLog(id: string, timeLogData: Partial<TimeLog>): Promise<TimeLog | null> {
    try {
      const appwriteData = this.mapToAppwrite(timeLogData);
      const response = await databases.updateDocument(
        DATABASE_ID,
        this.collectionId,
        id,
        appwriteData
      );
      console.log('✅ Time log mis à jour dans Appwrite:', id);
      return this.mapFromAppwrite(response);
    } catch (error) {
      console.error('❌ Erreur mise à jour time log:', error);
      throw error;
    }
  }

  async deleteTimeLog(id: string): Promise<boolean> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        this.collectionId,
        id
      );
      console.log('✅ Time log supprimé de Appwrite:', id);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression time log:', error);
      return false;
    }
  }

  // ===== USER-SPECIFIC OPERATIONS =====

  async getTimeLogsByUser(userId: string): Promise<TimeLog[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        this.collectionId,
        [Query.equal('userId', userId)]
      );
      console.log(`✅ ${response.documents.length} time logs récupérés pour utilisateur ${userId}`);
      return response.documents.map(doc => this.mapFromAppwrite(doc));
    } catch (error) {
      console.error('❌ Erreur récupération time logs utilisateur:', error);
      return [];
    }
  }

  async getTimeLogsByProject(projectId: string): Promise<TimeLog[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        this.collectionId,
        [Query.equal('projectId', projectId)]
      );
      console.log(`✅ ${response.documents.length} time logs récupérés pour projet ${projectId}`);
      return response.documents.map(doc => this.mapFromAppwrite(doc));
    } catch (error) {
      console.error('❌ Erreur récupération time logs projet:', error);
      return [];
    }
  }

  async getTimeLogsByCourse(courseId: string): Promise<TimeLog[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        this.collectionId,
        [Query.equal('courseId', courseId)]
      );
      console.log(`✅ ${response.documents.length} time logs récupérés pour cours ${courseId}`);
      return response.documents.map(doc => this.mapFromAppwrite(doc));
    } catch (error) {
      console.error('❌ Erreur récupération time logs cours:', error);
      return [];
    }
  }

  async getTimeLogsByTask(taskId: string): Promise<TimeLog[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        this.collectionId,
        [Query.equal('taskId', taskId)]
      );
      console.log(`✅ ${response.documents.length} time logs récupérés pour tâche ${taskId}`);
      return response.documents.map(doc => this.mapFromAppwrite(doc));
    } catch (error) {
      console.error('❌ Erreur récupération time logs tâche:', error);
      return [];
    }
  }

  // ===== DATE FILTERING =====

  async getTimeLogsByDateRange(startDate: string, endDate: string): Promise<TimeLog[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        this.collectionId,
        [
          Query.greaterThanEqual('date', startDate),
          Query.lessThanEqual('date', endDate)
        ]
      );
      console.log(`✅ ${response.documents.length} time logs récupérés entre ${startDate} et ${endDate}`);
      return response.documents.map(doc => this.mapFromAppwrite(doc));
    } catch (error) {
      console.error('❌ Erreur récupération time logs par période:', error);
      return [];
    }
  }

  async getTimeLogsByDate(date: string): Promise<TimeLog[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        this.collectionId,
        [Query.equal('date', date)]
      );
      console.log(`✅ ${response.documents.length} time logs récupérés pour ${date}`);
      return response.documents.map(doc => this.mapFromAppwrite(doc));
    } catch (error) {
      console.error('❌ Erreur récupération time logs par date:', error);
      return [];
    }
  }

  async getTimeLogsByWeek(startOfWeek: string): Promise<TimeLog[]> {
    try {
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      const endOfWeekStr = endOfWeek.toISOString().split('T')[0];

      return await this.getTimeLogsByDateRange(startOfWeek, endOfWeekStr);
    } catch (error) {
      console.error('❌ Erreur récupération time logs par semaine:', error);
      return [];
    }
  }

  async getTimeLogsByMonth(year: number, month: number): Promise<TimeLog[]> {
    try {
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];

      return await this.getTimeLogsByDateRange(startDate, endDate);
    } catch (error) {
      console.error('❌ Erreur récupération time logs par mois:', error);
      return [];
    }
  }

  // ===== REPORTS =====

  async getTimeReport(userId: string, period: string): Promise<any> {
    try {
      const now = new Date();
      let startDate: string;
      let endDate: string;

      switch (period) {
        case 'today':
          startDate = endDate = now.toISOString().split('T')[0];
          break;
        case 'week':
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startDate = startOfWeek.toISOString().split('T')[0];
          endDate = now.toISOString().split('T')[0];
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
          endDate = now.toISOString().split('T')[0];
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          endDate = now.toISOString().split('T')[0];
      }

      const timeLogs = await this.getTimeLogsByDateRange(startDate, endDate);
      const userTimeLogs = timeLogs.filter(log => log.userId === userId);

      const totalDuration = userTimeLogs.reduce((sum, log) => sum + log.duration, 0);
      const projectTime = userTimeLogs
        .filter(log => log.projectId)
        .reduce((acc, log) => {
          acc[log.projectId!] = (acc[log.projectId!] || 0) + log.duration;
          return acc;
        }, {} as Record<string, number>);

      const courseTime = userTimeLogs
        .filter(log => log.courseId)
        .reduce((acc, log) => {
          acc[log.courseId!] = (acc[log.courseId!] || 0) + log.duration;
          return acc;
        }, {} as Record<string, number>);

      const typeBreakdown = userTimeLogs.reduce((acc, log) => {
        acc[log.type] = (acc[log.type] || 0) + log.duration;
        return acc;
      }, {} as Record<string, number>);

      return {
        period,
        startDate,
        endDate,
        totalDuration,
        totalLogs: userTimeLogs.length,
        projectTime,
        courseTime,
        typeBreakdown,
        timeLogs: userTimeLogs,
      };
    } catch (error) {
      console.error('❌ Erreur génération rapport temps:', error);
      throw error;
    }
  }

  async getProjectTimeReport(projectId: string): Promise<any> {
    try {
      const timeLogs = await this.getTimeLogsByProject(projectId);
      
      const totalDuration = timeLogs.reduce((sum, log) => sum + log.duration, 0);
      const userBreakdown = timeLogs.reduce((acc, log) => {
        acc[log.userId] = (acc[log.userId] || 0) + log.duration;
        return acc;
      }, {} as Record<string, number>);

      const taskBreakdown = timeLogs
        .filter(log => log.taskId)
        .reduce((acc, log) => {
          acc[log.taskId!] = (acc[log.taskId!] || 0) + log.duration;
          return acc;
        }, {} as Record<string, number>);

      const dailyBreakdown = timeLogs.reduce((acc, log) => {
        acc[log.date] = (acc[log.date] || 0) + log.duration;
        return acc;
      }, {} as Record<string, number>);

      return {
        projectId,
        totalDuration,
        totalLogs: timeLogs.length,
        userBreakdown,
        taskBreakdown,
        dailyBreakdown,
        timeLogs,
      };
    } catch (error) {
      console.error('❌ Erreur génération rapport temps projet:', error);
      throw error;
    }
  }

  async getWeeklyTimeReport(userId: string): Promise<any> {
    try {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

      const timeLogs = await this.getTimeLogsByWeek(startOfWeekStr);
      const userTimeLogs = timeLogs.filter(log => log.userId === userId);

      const dailyBreakdown = userTimeLogs.reduce((acc, log) => {
        acc[log.date] = (acc[log.date] || 0) + log.duration;
        return acc;
      }, {} as Record<string, number>);

      const totalDuration = userTimeLogs.reduce((sum, log) => sum + log.duration, 0);
      const averageDaily = totalDuration / 7;

      return {
        week: startOfWeekStr,
        totalDuration,
        averageDaily,
        dailyBreakdown,
        timeLogs: userTimeLogs,
      };
    } catch (error) {
      console.error('❌ Erreur génération rapport temps hebdomadaire:', error);
      throw error;
    }
  }

  // ===== ANALYTICS =====

  async getTimeAnalytics(userId?: string): Promise<any> {
    try {
      const timeLogs = userId 
        ? await this.getTimeLogsByUser(userId)
        : await this.getTimeLogs();

      const totalDuration = timeLogs.reduce((sum, log) => sum + log.duration, 0);
      const totalLogs = timeLogs.length;
      const averageDuration = totalLogs > 0 ? totalDuration / totalLogs : 0;

      const typeBreakdown = timeLogs.reduce((acc, log) => {
        acc[log.type] = (acc[log.type] || 0) + log.duration;
        return acc;
      }, {} as Record<string, number>);

      const statusBreakdown = timeLogs.reduce((acc, log) => {
        acc[log.status] = (acc[log.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const monthlyBreakdown = timeLogs.reduce((acc, log) => {
        const month = log.date.substring(0, 7); // YYYY-MM
        acc[month] = (acc[month] || 0) + log.duration;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalDuration,
        totalLogs,
        averageDuration,
        typeBreakdown,
        statusBreakdown,
        monthlyBreakdown,
      };
    } catch (error) {
      console.error('❌ Erreur calcul analytics temps:', error);
      throw error;
    }
  }

  // ===== BULK OPERATIONS =====

  async createBulkTimeLogs(timeLogsData: Omit<TimeLog, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<TimeLog[]> {
    try {
      const results: TimeLog[] = [];
      
      for (const timeLogData of timeLogsData) {
        const timeLog = await this.createTimeLog(timeLogData);
        if (timeLog) {
          results.push(timeLog);
        }
      }

      console.log(`✅ ${results.length} time logs créés en lot`);
      return results;
    } catch (error) {
      console.error('❌ Erreur création time logs en lot:', error);
      throw error;
    }
  }

  async deleteTimeLogsByProject(projectId: string): Promise<number> {
    try {
      const timeLogs = await this.getTimeLogsByProject(projectId);
      let deletedCount = 0;

      for (const timeLog of timeLogs) {
        const success = await this.deleteTimeLog(timeLog.id);
        if (success) {
          deletedCount++;
        }
      }

      console.log(`✅ ${deletedCount} time logs supprimés pour projet ${projectId}`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Erreur suppression time logs par projet:', error);
      throw error;
    }
  }
}

export const timeLogService = new TimeLogService();
