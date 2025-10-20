import { supabase } from './supabaseService';
import { Job, JobApplication } from '../types';

class JobsService {
  private jobsTableName = 'jobs';
  private applicationsTableName = 'job_applications';

  // ===== JOBS =====

  private mapJobFromSupabase(data: any): Job {
    return {
      id: data.id,
      title: data.title,
      company: data.company,
      location: data.location,
      type: data.type,
      postedDate: data.posted_date,
      description: data.description,
      requiredSkills: data.required_skills || [],
      applicants: data.applicants || [],
      department: data.department,
      level: data.level,
      salary: data.salary || { min: 0, max: 0, currency: 'XOF' },
      status: data.status,
      requirements: data.requirements || [],
      benefits: data.benefits || [],
      applicationsCount: data.applications_count || 0,
      createdAt: data.created_at ? new Date(data.created_at) : new Date(),
      updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
      deadline: data.deadline ? new Date(data.deadline) : new Date(),
    };
  }

  private mapJobToSupabase(job: Partial<Job>): any {
    const data: any = {};
    if (job.title !== undefined) data.title = job.title;
    if (job.company !== undefined) data.company = job.company;
    if (job.location !== undefined) data.location = job.location;
    if (job.type !== undefined) data.type = job.type;
    if (job.postedDate !== undefined) data.posted_date = job.postedDate;
    if (job.description !== undefined) data.description = job.description;
    if (job.requiredSkills !== undefined) data.required_skills = job.requiredSkills;
    if (job.applicants !== undefined) data.applicants = job.applicants;
    if (job.department !== undefined) data.department = job.department;
    if (job.level !== undefined) data.level = job.level;
    if (job.salary !== undefined) data.salary = job.salary;
    if (job.status !== undefined) data.status = job.status;
    if (job.requirements !== undefined) data.requirements = job.requirements;
    if (job.benefits !== undefined) data.benefits = job.benefits;
    if (job.applicationsCount !== undefined) data.applications_count = job.applicationsCount;
    if (job.deadline !== undefined) data.deadline = job.deadline.toISOString();
    data.updated_at = new Date().toISOString();
    return data;
  }

  async createJob(jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job | null> {
    try {
      const supabaseData = this.mapJobToSupabase(jobData);
      const { data, error } = await supabase
        .from(this.jobsTableName)
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Offre d\'emploi créée dans Supabase:', data.id);
      return this.mapJobFromSupabase(data);
    } catch (error: any) {
      console.error('❌ Erreur création offre d\'emploi:', error.message);
      throw error;
    }
  }

  async getJobs(): Promise<Job[]> {
    try {
      const { data, error } = await supabase
        .from(this.jobsTableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log(`✅ ${data.length} offres d'emploi récupérées`);
      return data.map(this.mapJobFromSupabase);
    } catch (error: any) {
      console.error('❌ Erreur récupération offres d\'emploi:', error.message);
      return [];
    }
  }

  async getJobById(id: string): Promise<Job | null> {
    try {
      const { data, error } = await supabase
        .from(this.jobsTableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      console.log('✅ Offre d\'emploi récupérée:', id);
      return this.mapJobFromSupabase(data);
    } catch (error: any) {
      console.error('❌ Erreur récupération offre d\'emploi:', error.message);
      return null;
    }
  }

  async updateJob(id: string, jobData: Partial<Job>): Promise<Job | null> {
    try {
      const supabaseData = this.mapJobToSupabase(jobData);
      const { data, error } = await supabase
        .from(this.jobsTableName)
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Offre d\'emploi mise à jour dans Supabase:', id);
      return this.mapJobFromSupabase(data);
    } catch (error: any) {
      console.error('❌ Erreur mise à jour offre d\'emploi:', error.message);
      throw error;
    }
  }

  async deleteJob(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.jobsTableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      console.log('✅ Offre d\'emploi supprimée de Supabase:', id);
      return true;
    } catch (error: any) {
      console.error('❌ Erreur suppression offre d\'emploi:', error.message);
      return false;
    }
  }

  // ===== JOB APPLICATIONS =====

  private mapApplicationFromSupabase(data: any): JobApplication {
    return {
      id: data.id,
      jobId: data.job_id,
      candidateName: data.candidate_name,
      candidateEmail: data.candidate_email,
      candidatePhone: data.candidate_phone,
      resume: data.resume,
      coverLetter: data.cover_letter,
      status: data.status,
      experience: data.experience || 0,
      skills: data.skills || [],
      appliedAt: data.applied_at ? new Date(data.applied_at) : new Date(),
      notes: data.notes,
    };
  }

  private mapApplicationToSupabase(application: Partial<JobApplication>): any {
    const data: any = {};
    if (application.jobId !== undefined) data.job_id = application.jobId;
    if (application.candidateName !== undefined) data.candidate_name = application.candidateName;
    if (application.candidateEmail !== undefined) data.candidate_email = application.candidateEmail;
    if (application.candidatePhone !== undefined) data.candidate_phone = application.candidatePhone;
    if (application.resume !== undefined) data.resume = application.resume;
    if (application.coverLetter !== undefined) data.cover_letter = application.coverLetter;
    if (application.status !== undefined) data.status = application.status;
    if (application.experience !== undefined) data.experience = application.experience;
    if (application.skills !== undefined) data.skills = application.skills;
    if (application.appliedAt !== undefined) data.applied_at = application.appliedAt.toISOString();
    if (application.notes !== undefined) data.notes = application.notes;
    data.updated_at = new Date().toISOString();
    return data;
  }

  async createApplication(applicationData: Omit<JobApplication, 'id'>): Promise<JobApplication | null> {
    try {
      const supabaseData = this.mapApplicationToSupabase(applicationData);
      const { data, error } = await supabase
        .from(this.applicationsTableName)
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour le compteur de candidatures
      const job = await this.getJobById(applicationData.jobId);
      if (job) {
        await this.updateJob(applicationData.jobId, {
          applicationsCount: (job.applicationsCount || 0) + 1
        });
      }

      console.log('✅ Candidature créée dans Supabase:', data.id);
      return this.mapApplicationFromSupabase(data);
    } catch (error: any) {
      console.error('❌ Erreur création candidature:', error.message);
      throw error;
    }
  }

  async getApplications(): Promise<JobApplication[]> {
    try {
      const { data, error } = await supabase
        .from(this.applicationsTableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log(`✅ ${data.length} candidatures récupérées`);
      return data.map(this.mapApplicationFromSupabase);
    } catch (error: any) {
      console.error('❌ Erreur récupération candidatures:', error.message);
      return [];
    }
  }

  async getApplicationsByJob(jobId: string): Promise<JobApplication[]> {
    try {
      const { data, error } = await supabase
        .from(this.applicationsTableName)
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log(`✅ ${data.length} candidatures pour le poste`);
      return data.map(this.mapApplicationFromSupabase);
    } catch (error: any) {
      console.error('❌ Erreur récupération candidatures par poste:', error.message);
      return [];
    }
  }

  async updateApplication(id: string, applicationData: Partial<JobApplication>): Promise<JobApplication | null> {
    try {
      const supabaseData = this.mapApplicationToSupabase(applicationData);
      const { data, error } = await supabase
        .from(this.applicationsTableName)
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Candidature mise à jour dans Supabase:', id);
      return this.mapApplicationFromSupabase(data);
    } catch (error: any) {
      console.error('❌ Erreur mise à jour candidature:', error.message);
      throw error;
    }
  }

  async deleteApplication(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.applicationsTableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      console.log('✅ Candidature supprimée de Supabase:', id);
      return true;
    } catch (error: any) {
      console.error('❌ Erreur suppression candidature:', error.message);
      return false;
    }
  }

  // ===== ANALYTICS =====

  async getJobsAnalytics(): Promise<any> {
    try {
      const [jobs, applications] = await Promise.all([
        this.getJobs(),
        this.getApplications()
      ]);

      const jobsByStatus = jobs.reduce((acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const jobsByDepartment = jobs.reduce((acc, job) => {
        acc[job.department] = (acc[job.department] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const applicationsByStatus = applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalJobs: jobs.length,
        openJobs: jobs.filter(j => j.status === 'open').length,
        totalApplications: applications.length,
        pendingApplications: applications.filter(a => a.status === 'pending').length,
        jobsByStatus,
        jobsByDepartment,
        applicationsByStatus,
        averageApplicationsPerJob: jobs.length > 0 ? applications.length / jobs.length : 0,
      };
    } catch (error: any) {
      console.error('❌ Erreur calcul analytics emplois:', error.message);
      throw error;
    }
  }
}

const jobsServiceInstance = new JobsService();

// Export des méthodes individuelles pour compatibilité
export const jobsService = {
  // Jobs
  getAllJobs: () => jobsServiceInstance.getJobs(),
  getJobById: (id: string) => jobsServiceInstance.getJobById(id),
  createJob: (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => jobsServiceInstance.createJob(job),
  updateJob: (id: string, job: Partial<Job>) => jobsServiceInstance.updateJob(id, job),
  deleteJob: (id: string) => jobsServiceInstance.deleteJob(id),
  
  // Applications
  getAllApplications: () => jobsServiceInstance.getApplications(),
  // getApplicationById: (id: string) => jobsServiceInstance.getApplicationById(id), // Méthode non implémentée
  createApplication: (application: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => jobsServiceInstance.createApplication(application),
  updateApplication: (id: string, application: Partial<JobApplication>) => jobsServiceInstance.updateApplication(id, application),
  deleteApplication: (id: string) => jobsServiceInstance.deleteApplication(id),
  
  // Analytics
  getJobsAnalytics: () => jobsServiceInstance.getJobsAnalytics(),
};

export default jobsService;