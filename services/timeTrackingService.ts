import { TimeLog } from '../types';
import { databases, DATABASE_ID } from './appwriteService';

class TimeTrackingService {
  private collectionId = 'time_logs';

  async create(timeLog: Omit<TimeLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<TimeLog> {
    try {
      const data = {
        projectId: timeLog.projectId,
        projectName: timeLog.projectName,
        taskId: timeLog.taskId,
        taskName: timeLog.taskName,
        description: timeLog.description,
        startTime: timeLog.startTime,
        endTime: timeLog.endTime,
        duration: timeLog.duration,
        status: timeLog.status,
        userId: timeLog.userId,
        tags: timeLog.tags || []
      };

      const result = await databases.createDocument(
        DATABASE_ID,
        this.collectionId,
        'unique()',
        data
      );

      return {
        id: result.$id,
        ...data,
        createdAt: result.$createdAt,
        updatedAt: result.$updatedAt
      };
    } catch (error) {
      console.error('Erreur création log temps:', error);
      throw error;
    }
  }

  async getAll(): Promise<TimeLog[]> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        this.collectionId
      );

      return result.documents.map(doc => ({
        id: doc.$id,
        projectId: doc.projectId,
        projectName: doc.projectName,
        taskId: doc.taskId,
        taskName: doc.taskName,
        description: doc.description,
        startTime: doc.startTime,
        endTime: doc.endTime,
        duration: doc.duration,
        status: doc.status,
        userId: doc.userId,
        tags: doc.tags || [],
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt
      }));
    } catch (error) {
      console.error('Erreur récupération logs temps:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<TimeLog | null> {
    try {
      const result = await databases.getDocument(
        DATABASE_ID,
        this.collectionId,
        id
      );

      return {
        id: result.$id,
        projectId: result.projectId,
        projectName: result.projectName,
        taskId: result.taskId,
        taskName: result.taskName,
        description: result.description,
        startTime: result.startTime,
        endTime: result.endTime,
        duration: result.duration,
        status: result.status,
        userId: result.userId,
        tags: result.tags || [],
        createdAt: result.$createdAt,
        updatedAt: result.$updatedAt
      };
    } catch (error) {
      console.error('Erreur récupération log temps:', error);
      return null;
    }
  }

  async update(id: string, timeLog: Partial<TimeLog>): Promise<boolean> {
    try {
      const data: any = {};
      
      if (timeLog.projectId) data.projectId = timeLog.projectId;
      if (timeLog.projectName) data.projectName = timeLog.projectName;
      if (timeLog.taskId) data.taskId = timeLog.taskId;
      if (timeLog.taskName) data.taskName = timeLog.taskName;
      if (timeLog.description) data.description = timeLog.description;
      if (timeLog.startTime) data.startTime = timeLog.startTime;
      if (timeLog.endTime) data.endTime = timeLog.endTime;
      if (timeLog.duration !== undefined) data.duration = timeLog.duration;
      if (timeLog.status) data.status = timeLog.status;
      if (timeLog.userId) data.userId = timeLog.userId;
      if (timeLog.tags) data.tags = timeLog.tags;

      await databases.updateDocument(
        DATABASE_ID,
        this.collectionId,
        id,
        data
      );

      return true;
    } catch (error) {
      console.error('Erreur mise à jour log temps:', error);
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        this.collectionId,
        id
      );

      return true;
    } catch (error) {
      console.error('Erreur suppression log temps:', error);
      return false;
    }
  }

  async getByUser(userId: string): Promise<TimeLog[]> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        this.collectionId,
        [`userId=${userId}`]
      );

      return result.documents.map(doc => ({
        id: doc.$id,
        projectId: doc.projectId,
        projectName: doc.projectName,
        taskId: doc.taskId,
        taskName: doc.taskName,
        description: doc.description,
        startTime: doc.startTime,
        endTime: doc.endTime,
        duration: doc.duration,
        status: doc.status,
        userId: doc.userId,
        tags: doc.tags || [],
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt
      }));
    } catch (error) {
      console.error('Erreur récupération logs temps utilisateur:', error);
      throw error;
    }
  }

  async getByProject(projectId: string): Promise<TimeLog[]> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        this.collectionId,
        [`projectId=${projectId}`]
      );

      return result.documents.map(doc => ({
        id: doc.$id,
        projectId: doc.projectId,
        projectName: doc.projectName,
        taskId: doc.taskId,
        taskName: doc.taskName,
        description: doc.description,
        startTime: doc.startTime,
        endTime: doc.endTime,
        duration: doc.duration,
        status: doc.status,
        userId: doc.userId,
        tags: doc.tags || [],
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt
      }));
    } catch (error) {
      console.error('Erreur récupération logs temps projet:', error);
      throw error;
    }
  }

  async getByStatus(status: string): Promise<TimeLog[]> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        this.collectionId,
        [`status=${status}`]
      );

      return result.documents.map(doc => ({
        id: doc.$id,
        projectId: doc.projectId,
        projectName: doc.projectName,
        taskId: doc.taskId,
        taskName: doc.taskName,
        description: doc.description,
        startTime: doc.startTime,
        endTime: doc.endTime,
        duration: doc.duration,
        status: doc.status,
        userId: doc.userId,
        tags: doc.tags || [],
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt
      }));
    } catch (error) {
      console.error('Erreur récupération logs temps par statut:', error);
      throw error;
    }
  }

  async getTotalHoursByUser(userId: string, startDate?: string, endDate?: string): Promise<number> {
    try {
      const logs = await this.getByUser(userId);
      
      let filteredLogs = logs;
      if (startDate && endDate) {
        filteredLogs = logs.filter(log => 
          log.startTime >= startDate && log.startTime <= endDate
        );
      }
      
      return filteredLogs.reduce((total, log) => total + log.duration, 0);
    } catch (error) {
      console.error('Erreur calcul total heures utilisateur:', error);
      return 0;
    }
  }

  async getTotalHoursByProject(projectId: string, startDate?: string, endDate?: string): Promise<number> {
    try {
      const logs = await this.getByProject(projectId);
      
      let filteredLogs = logs;
      if (startDate && endDate) {
        filteredLogs = logs.filter(log => 
          log.startTime >= startDate && log.startTime <= endDate
        );
      }
      
      return filteredLogs.reduce((total, log) => total + log.duration, 0);
    } catch (error) {
      console.error('Erreur calcul total heures projet:', error);
      return 0;
    }
  }
}

export const timeTrackingService = new TimeTrackingService();
