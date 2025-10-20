import { LeaveRequest, LeavePolicy } from '../types';
import { databases, DATABASE_ID } from './appwriteService';

class LeaveService {
  private collectionId = 'leave_requests';

  async create(leaveRequest: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeaveRequest> {
    try {
      const data = {
        employeeId: leaveRequest.employeeId,
        employeeName: leaveRequest.employeeName,
        leaveType: leaveRequest.leaveType,
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
        days: leaveRequest.days,
        reason: leaveRequest.reason,
        status: leaveRequest.status,
        submittedAt: leaveRequest.submittedAt,
        reviewedAt: leaveRequest.reviewedAt,
        reviewedBy: leaveRequest.reviewedBy,
        comments: leaveRequest.comments || ''
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
      console.error('Erreur création demande congé:', error);
      throw error;
    }
  }

  async getAll(): Promise<LeaveRequest[]> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        this.collectionId
      );

      return result.documents.map(doc => ({
        id: doc.$id,
        employeeId: doc.employeeId,
        employeeName: doc.employeeName,
        leaveType: doc.leaveType,
        startDate: doc.startDate,
        endDate: doc.endDate,
        days: doc.days,
        reason: doc.reason,
        status: doc.status,
        submittedAt: doc.submittedAt,
        reviewedAt: doc.reviewedAt,
        reviewedBy: doc.reviewedBy,
        comments: doc.comments || '',
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt
      }));
    } catch (error) {
      console.error('Erreur récupération demandes congé:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<LeaveRequest | null> {
    try {
      const result = await databases.getDocument(
        DATABASE_ID,
        this.collectionId,
        id
      );

      return {
        id: result.$id,
        employeeId: result.employeeId,
        employeeName: result.employeeName,
        leaveType: result.leaveType,
        startDate: result.startDate,
        endDate: result.endDate,
        days: result.days,
        reason: result.reason,
        status: result.status,
        submittedAt: result.submittedAt,
        reviewedAt: result.reviewedAt,
        reviewedBy: result.reviewedBy,
        comments: result.comments || '',
        createdAt: result.$createdAt,
        updatedAt: result.$updatedAt
      };
    } catch (error) {
      console.error('Erreur récupération demande congé:', error);
      return null;
    }
  }

  async update(id: string, leaveRequest: Partial<LeaveRequest>): Promise<boolean> {
    try {
      const data: any = {};
      
      if (leaveRequest.employeeId) data.employeeId = leaveRequest.employeeId;
      if (leaveRequest.employeeName) data.employeeName = leaveRequest.employeeName;
      if (leaveRequest.leaveType) data.leaveType = leaveRequest.leaveType;
      if (leaveRequest.startDate) data.startDate = leaveRequest.startDate;
      if (leaveRequest.endDate) data.endDate = leaveRequest.endDate;
      if (leaveRequest.days !== undefined) data.days = leaveRequest.days;
      if (leaveRequest.reason) data.reason = leaveRequest.reason;
      if (leaveRequest.status) data.status = leaveRequest.status;
      if (leaveRequest.submittedAt) data.submittedAt = leaveRequest.submittedAt;
      if (leaveRequest.reviewedAt) data.reviewedAt = leaveRequest.reviewedAt;
      if (leaveRequest.reviewedBy) data.reviewedBy = leaveRequest.reviewedBy;
      if (leaveRequest.comments !== undefined) data.comments = leaveRequest.comments;

      await databases.updateDocument(
        DATABASE_ID,
        this.collectionId,
        id,
        data
      );

      return true;
    } catch (error) {
      console.error('Erreur mise à jour demande congé:', error);
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
      console.error('Erreur suppression demande congé:', error);
      return false;
    }
  }

  async getByEmployee(employeeId: string): Promise<LeaveRequest[]> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        this.collectionId,
        [`employeeId=${employeeId}`]
      );

      return result.documents.map(doc => ({
        id: doc.$id,
        employeeId: doc.employeeId,
        employeeName: doc.employeeName,
        leaveType: doc.leaveType,
        startDate: doc.startDate,
        endDate: doc.endDate,
        days: doc.days,
        reason: doc.reason,
        status: doc.status,
        submittedAt: doc.submittedAt,
        reviewedAt: doc.reviewedAt,
        reviewedBy: doc.reviewedBy,
        comments: doc.comments || '',
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt
      }));
    } catch (error) {
      console.error('Erreur récupération demandes congé employé:', error);
      throw error;
    }
  }

  async getByStatus(status: string): Promise<LeaveRequest[]> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        this.collectionId,
        [`status=${status}`]
      );

      return result.documents.map(doc => ({
        id: doc.$id,
        employeeId: doc.employeeId,
        employeeName: doc.employeeName,
        leaveType: doc.leaveType,
        startDate: doc.startDate,
        endDate: doc.endDate,
        days: doc.days,
        reason: doc.reason,
        status: doc.status,
        submittedAt: doc.submittedAt,
        reviewedAt: doc.reviewedAt,
        reviewedBy: doc.reviewedBy,
        comments: doc.comments || '',
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt
      }));
    } catch (error) {
      console.error('Erreur récupération demandes congé par statut:', error);
      throw error;
    }
  }
}

export const leaveService = new LeaveService();
