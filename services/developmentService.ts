import { supabase } from './supabaseService';

// Types pour Development
export interface Deployment {
  id: string;
  name: string;
  environment: 'Development' | 'Staging' | 'Production';
  status: 'Running' | 'Stopped' | 'Failed' | 'Building';
  version: string;
  branch: string;
  commitHash: string;
  deployedAt: string;
  deployedBy: string;
  url?: string;
  logs: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BugReport {
  id: string;
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Fixed' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  reporter: string;
  assignee?: string;
  project: string;
  steps: string[];
  expectedResult: string;
  actualResult: string;
  attachments: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CodeReview {
  id: string;
  title: string;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Changes Requested';
  reviewer: string;
  author: string;
  project: string;
  pullRequestUrl: string;
  filesChanged: string[];
  comments: Array<{
    id: string;
    content: string;
    author: string;
    createdAt: string;
    lineNumber?: number;
    filePath?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

class DevelopmentService {
  private deploymentsTableName = 'deployments';
  private bugReportsTableName = 'bug_reports';
  private codeReviewsTableName = 'code_reviews';

  // ===== DEPLOYMENTS =====

  private mapDeploymentFromSupabase(data: any): Deployment {
    return {
      id: data.id,
      name: data.name,
      environment: data.environment,
      status: data.status,
      version: data.version,
      branch: data.branch,
      commitHash: data.commit_hash,
      deployedAt: data.deployed_at,
      deployedBy: data.deployed_by,
      url: data.url,
      logs: data.logs || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapDeploymentToSupabase(deployment: Omit<Deployment, 'id'>): any {
    return {
      name: deployment.name,
      environment: deployment.environment,
      status: deployment.status,
      version: deployment.version,
      branch: deployment.branch,
      commit_hash: deployment.commitHash,
      deployed_at: deployment.deployedAt,
      deployed_by: deployment.deployedBy,
      url: deployment.url,
      logs: deployment.logs,
    };
  }

  async getAllDeployments(): Promise<Deployment[]> {
    try {
      console.log('🔄 Récupération déploiements Supabase...');
      
      const { data, error } = await supabase
        .from(this.deploymentsTableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const deployments = (data || []).map(item => this.mapDeploymentFromSupabase(item));
      console.log(`✅ ${deployments.length} déploiements récupérés`);
      return deployments;
    } catch (error) {
      console.error('❌ Erreur récupération déploiements:', error);
      return [];
    }
  }

  async createDeployment(deployment: Omit<Deployment, 'id'>): Promise<Deployment | null> {
    try {
      console.log('🔄 Création déploiement Supabase:', deployment.name);
      
      const supabaseData = this.mapDeploymentToSupabase(deployment);
      const { data, error } = await supabase
        .from(this.deploymentsTableName)
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;

      const createdDeployment = this.mapDeploymentFromSupabase(data);
      console.log('✅ Déploiement créé:', createdDeployment.id);
      return createdDeployment;
    } catch (error) {
      console.error('❌ Erreur création déploiement:', error);
      return null;
    }
  }

  async updateDeployment(id: string, deployment: Partial<Deployment>): Promise<Deployment | null> {
    try {
      console.log('🔄 Mise à jour déploiement Supabase:', id);
      
      const supabaseData = this.mapDeploymentToSupabase(deployment as Omit<Deployment, 'id'>);
      const { data, error } = await supabase
        .from(this.deploymentsTableName)
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedDeployment = this.mapDeploymentFromSupabase(data);
      console.log('✅ Déploiement mis à jour:', updatedDeployment.id);
      return updatedDeployment;
    } catch (error) {
      console.error('❌ Erreur mise à jour déploiement:', error);
      return null;
    }
  }

  async deleteDeployment(id: string): Promise<boolean> {
    try {
      console.log('🔄 Suppression déploiement Supabase:', id);
      
      const { error } = await supabase
        .from(this.deploymentsTableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('✅ Déploiement supprimé:', id);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression déploiement:', error);
      return false;
    }
  }

  // ===== BUG REPORTS =====

  private mapBugReportFromSupabase(data: any): BugReport {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      severity: data.severity,
      status: data.status,
      priority: data.priority,
      reporter: data.reporter,
      assignee: data.assignee,
      project: data.project,
      steps: data.steps || [],
      expectedResult: data.expected_result,
      actualResult: data.actual_result,
      attachments: data.attachments || [],
      tags: data.tags || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapBugReportToSupabase(bugReport: Omit<BugReport, 'id'>): any {
    return {
      title: bugReport.title,
      description: bugReport.description,
      severity: bugReport.severity,
      status: bugReport.status,
      priority: bugReport.priority,
      reporter: bugReport.reporter,
      assignee: bugReport.assignee,
      project: bugReport.project,
      steps: bugReport.steps,
      expected_result: bugReport.expectedResult,
      actual_result: bugReport.actualResult,
      attachments: bugReport.attachments,
      tags: bugReport.tags,
    };
  }

  async getAllBugReports(): Promise<BugReport[]> {
    try {
      console.log('🔄 Récupération rapports de bugs Supabase...');
      
      const { data, error } = await supabase
        .from(this.bugReportsTableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const bugReports = (data || []).map(item => this.mapBugReportFromSupabase(item));
      console.log(`✅ ${bugReports.length} rapports de bugs récupérés`);
      return bugReports;
    } catch (error) {
      console.error('❌ Erreur récupération rapports de bugs:', error);
      return [];
    }
  }

  async createBugReport(bugReport: Omit<BugReport, 'id'>): Promise<BugReport | null> {
    try {
      console.log('🔄 Création rapport de bug Supabase:', bugReport.title);
      
      const supabaseData = this.mapBugReportToSupabase(bugReport);
      const { data, error } = await supabase
        .from(this.bugReportsTableName)
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;

      const createdBugReport = this.mapBugReportFromSupabase(data);
      console.log('✅ Rapport de bug créé:', createdBugReport.id);
      return createdBugReport;
    } catch (error) {
      console.error('❌ Erreur création rapport de bug:', error);
      return null;
    }
  }

  async updateBugReport(id: string, bugReport: Partial<BugReport>): Promise<BugReport | null> {
    try {
      console.log('🔄 Mise à jour rapport de bug Supabase:', id);
      
      const supabaseData = this.mapBugReportToSupabase(bugReport as Omit<BugReport, 'id'>);
      const { data, error } = await supabase
        .from(this.bugReportsTableName)
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedBugReport = this.mapBugReportFromSupabase(data);
      console.log('✅ Rapport de bug mis à jour:', updatedBugReport.id);
      return updatedBugReport;
    } catch (error) {
      console.error('❌ Erreur mise à jour rapport de bug:', error);
      return null;
    }
  }

  async deleteBugReport(id: string): Promise<boolean> {
    try {
      console.log('🔄 Suppression rapport de bug Supabase:', id);
      
      const { error } = await supabase
        .from(this.bugReportsTableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('✅ Rapport de bug supprimé:', id);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression rapport de bug:', error);
      return false;
    }
  }

  // ===== CODE REVIEWS =====

  private mapCodeReviewFromSupabase(data: any): CodeReview {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      reviewer: data.reviewer,
      author: data.author,
      project: data.project,
      pullRequestUrl: data.pull_request_url,
      filesChanged: data.files_changed || [],
      comments: data.comments || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapCodeReviewToSupabase(codeReview: Omit<CodeReview, 'id'>): any {
    return {
      title: codeReview.title,
      description: codeReview.description,
      status: codeReview.status,
      reviewer: codeReview.reviewer,
      author: codeReview.author,
      project: codeReview.project,
      pull_request_url: codeReview.pullRequestUrl,
      files_changed: codeReview.filesChanged,
      comments: codeReview.comments,
    };
  }

  async getAllCodeReviews(): Promise<CodeReview[]> {
    try {
      console.log('🔄 Récupération revues de code Supabase...');
      
      const { data, error } = await supabase
        .from(this.codeReviewsTableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const codeReviews = (data || []).map(item => this.mapCodeReviewFromSupabase(item));
      console.log(`✅ ${codeReviews.length} revues de code récupérées`);
      return codeReviews;
    } catch (error) {
      console.error('❌ Erreur récupération revues de code:', error);
      return [];
    }
  }

  async createCodeReview(codeReview: Omit<CodeReview, 'id'>): Promise<CodeReview | null> {
    try {
      console.log('🔄 Création revue de code Supabase:', codeReview.title);
      
      const supabaseData = this.mapCodeReviewToSupabase(codeReview);
      const { data, error } = await supabase
        .from(this.codeReviewsTableName)
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;

      const createdCodeReview = this.mapCodeReviewFromSupabase(data);
      console.log('✅ Revue de code créée:', createdCodeReview.id);
      return createdCodeReview;
    } catch (error) {
      console.error('❌ Erreur création revue de code:', error);
      return null;
    }
  }

  async updateCodeReview(id: string, codeReview: Partial<CodeReview>): Promise<CodeReview | null> {
    try {
      console.log('🔄 Mise à jour revue de code Supabase:', id);
      
      const supabaseData = this.mapCodeReviewToSupabase(codeReview as Omit<CodeReview, 'id'>);
      const { data, error } = await supabase
        .from(this.codeReviewsTableName)
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedCodeReview = this.mapCodeReviewFromSupabase(data);
      console.log('✅ Revue de code mise à jour:', updatedCodeReview.id);
      return updatedCodeReview;
    } catch (error) {
      console.error('❌ Erreur mise à jour revue de code:', error);
      return null;
    }
  }

  async deleteCodeReview(id: string): Promise<boolean> {
    try {
      console.log('🔄 Suppression revue de code Supabase:', id);
      
      const { error } = await supabase
        .from(this.codeReviewsTableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('✅ Revue de code supprimée:', id);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression revue de code:', error);
      return false;
    }
  }
}

export const developmentService = new DevelopmentService();
