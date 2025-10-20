

export type Role = 'student' | 'employer' | 'super_administrator' | 'administrator' | 'manager' | 'supervisor' | 'editor' | 'entrepreneur' | 'funder' | 'mentor' | 'intern' | 'trainer' | 'implementer' | 'coach' | 'facilitator' | 'publisher' | 'producer' | 'artist' | 'alumni';

export interface KeyResult {
  id: string;
  objectiveId?: string;
  title: string;
  description?: string;
  target: number;
  current: number;
  unit: string;
  progress: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Objective {
  id: string;
  projectId?: string;
  title: string;
  description?: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  startDate: string;
  endDate: string;
  progress: number;
  owner: string;
  team: string[];
  keyResults: KeyResult[];
  createdAt?: string;
  updatedAt?: string;
  period?: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Annual';
  quarter?: string;
  year?: number;
  ownerId?: string;
}



export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  skills: string[];
  phone?: string;
  location?: string;
}

export interface FileAttachment {
  fileName: string;
  dataUrl: string;
}

export type EvidenceDocument = FileAttachment;
export type Receipt = FileAttachment;



export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  evidenceDocuments?: EvidenceDocument[];
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  duration: number; // in minutes
  progress: number;
  icon: string;
  description: string;
  modules: Module[];
  completedLessons?: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  status: 'active' | 'completed' | 'draft';
  rating: number;
  studentsCount: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  order: number;
  videoUrl?: string;
  resources?: string[];
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'CDI' | 'CDD';
  postedDate: string;
  description: string;
  requiredSkills: string[];
  applicants: User[];
  department: string;
  level: 'junior' | 'intermediate' | 'senior' | 'expert';
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  status: 'open' | 'closed' | 'paused';
  requirements: string[];
  benefits: string[];
  applicationsCount: number;
  createdAt: Date;
  updatedAt: Date;
  deadline: Date;
}

export interface JobApplication {
  id: string;
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  resume: string;
  coverLetter: string;
  status: 'pending' | 'reviewed' | 'interviewed' | 'accepted' | 'rejected';
  experience: number;
  skills: string[];
  appliedAt: Date;
  notes?: string;
}

export interface Task {
  id: string;
  text: string;
  status: 'To Do' | 'In Progress' | 'Done';
  priority: 'High' | 'Medium' | 'Low';
  assignee?: User;
  estimatedTime?: number;
  loggedTime?: number;
  dueDate?: string;
}

export interface Risk {
  id: string;
  description: string;
  likelihood: 'High' | 'Medium' | 'Low';
  impact: 'High' | 'Medium' | 'Low';
  mitigationStrategy: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  startDate?: string;  // AJOUTÉ pour alignement MVP client
  dueDate: string;
  budget?: number;
  client?: string;
  tags: string[];
  team: User[];
  tasks: Task[];
  risks: Risk[];
  owner?: string;      // AJOUTÉ pour compatibilité
  ownerId?: string;    // Garder pour Supabase
  createdAt?: string;
  updatedAt?: string;
}



export interface Contact {
  id: string;
  name: string;
  workEmail: string;
  personalEmail?: string;
  company: string;
  status: 'Lead' | 'Contacted' | 'Prospect' | 'Customer';
  avatar: string;
  officePhone?: string;
  mobilePhone?: string;
  whatsappNumber?: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface TimeLog {
  id: string;
  userId: string;
  entityType: 'project' | 'course' | 'task';
  entityId: string;
  entityTitle: string;
  date: string;
  duration: number; // in minutes
  description: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;  // ID de l'employé
  leaveType: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'other';  // Type de congé
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';  // Statut de la demande
  projectId?: string;  // ID du projet associé
  daysRequested: number;  // Nombre de jours demandés
  approvedBy?: string;  // ID du manager qui a validé/rejeté
  approvedAt?: string;  // Date de validation/rejet
  createdAt?: string;
  updatedAt?: string;
  // Nouvelles propriétés pour l'éligibilité et la validation
  isEligible?: boolean;  // Si l'employé est éligible pour un congé
  eligibilityReason?: string;  // Raison de non-éligibilité
  managerId?: string;  // Manager assigné pour validation
  isManualRequest?: boolean;  // Demande manuelle créée par un manager
  createdBy?: string;  // Qui a créé la demande (employé ou manager)
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  dueDate: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Partially Paid';
  receipt?: Receipt;
  paidDate?: string;
  paidAmount?: number;
  recurringSourceId?: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  dueDate?: string;
  receipt?: Receipt;
  status: 'Paid' | 'Unpaid';
  budgetItemId?: string;
  recurringSourceId?: string;
}

export type RecurrenceFrequency = 'Monthly' | 'Quarterly' | 'Annually';

export interface RecurringInvoice {
    id: string;
    clientName: string;
    amount: number;
    frequency: RecurrenceFrequency;
    startDate: string;
    endDate?: string;
    lastGeneratedDate: string;
}

export interface RecurringExpense {
    id: string;
    category: string;
    description: string;
    amount: number;
    frequency: RecurrenceFrequency;
    startDate: string;
    endDate?: string;
    lastGeneratedDate: string;
}

export interface BudgetItem {
    id: string;
    description: string;
    amount: number;
}

export interface BudgetLine {
    id: string;
    title: string;
    items: BudgetItem[];
}

export interface Budget {
    id: string;
    title: string;
    type: 'Project' | 'Office';
    amount: number;
    startDate: string;
    endDate: string;
    projectId?: string;
    budgetLines: BudgetLine[];
}

export interface Meeting {
    id: string;
    title: string;
    startTime: string; // ISO string
    endTime: string; // ISO string
    attendees: User[];
    organizerId: string;
    description?: string;
}

export enum Language {
    EN = 'en',
    FR = 'fr',
}

export type Translation = { [key: string]: string };
export type Translations = { [key in Language]: Translation };

export interface AppNotification {
    id: string;
    message: string;
    date: string;
    entityType: 'invoice' | 'expense';
    entityId: string;
    isRead: boolean;
}

export interface AgentMessage {
  role: 'user' | 'ai';
  content: string;
}

export interface CourseEnrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledDate: string;
  progress: number;  // 0-100
  completedLessons: string[];  // Array of lesson IDs
  status: 'Active' | 'Completed' | 'Dropped';
  completionDate?: string;
}


export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  type: 'article' | 'tutorial' | 'faq' | 'guide';
  status: 'published' | 'draft' | 'archived';
  tags: string[];
  author: string;
  views: number;
  rating: number;
  helpful: number;
  createdAt: Date;
  updatedAt: Date;
  lastViewed?: Date;
}

export interface KnowledgeCategory {
  id: string;
  name: string;
  description: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  articleCount: number;
  createdAt: Date;
}