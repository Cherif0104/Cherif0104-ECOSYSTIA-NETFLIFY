import { Client, Databases, ID, Query, Account, Storage, Functions, Teams, Locale, Avatars } from 'appwrite';

// Configuration de l'application
const config = {
  APPWRITE_ENDPOINT: 'https://nyc.cloud.appwrite.io/v1',
  APPWRITE_PROJECT_ID: '68ee2dc2001f0f499c02',
  APPWRITE_DATABASE_ID: '68ee527d002813e4e0ca',
  APPWRITE_API_KEY: 'standard_02717fc47c45cff4edc16624ae9127ca436dff8bd115037e795dec54eb8c50f53d989078ad57f2ca52daa41ce272dfc205bca21613f2d07c98525613e3da936d71ff2c5804b392c7c79760dcd3c8a7998c1c2078d73bd310b8dde7224c14fb802c5302625bd3a3fca79c7ca5d52b4585dcd959a9810d387a065f2e64af71df38',
  GEMINI_API_KEY: 'AIzaSyBvQZvQZvQZvQZvQZvQZvQZvQZvQZvQZvQZvQ',
  USERS_COLLECTION_ID: 'users',
  PROJECTS_COLLECTION_ID: 'projects',
  OBJECTIVES_COLLECTION_ID: 'objectives',
  KEY_RESULTS_COLLECTION_ID: 'key_results',
  INVOICES_COLLECTION_ID: 'invoices',
  EXPENSES_COLLECTION_ID: 'expenses',
  CONTACTS_COLLECTION_ID: 'contacts',
  LEADS_COLLECTION_ID: 'leads',
  TIME_LOGS_COLLECTION_ID: 'time_logs',
  MEETINGS_COLLECTION_ID: 'meetings',
};

// Configuration du client Appwrite
const client = new Client()
  .setEndpoint(config.APPWRITE_ENDPOINT)
  .setProject(config.APPWRITE_PROJECT_ID);

// Services Appwrite
export const databases = new Databases(client);
export const account = new Account(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
export const teams = new Teams(client);
export const locale = new Locale(client);
export const avatars = new Avatars(client);

// Export des utilitaires
export { ID, Query };

// Configuration de la base de données
export const DATABASE_ID = config.APPWRITE_DATABASE_ID;

// Collections
export const COLLECTIONS = {
  USERS: config.USERS_COLLECTION_ID,
  PROJECTS: config.PROJECTS_COLLECTION_ID,
  OBJECTIVES: config.OBJECTIVES_COLLECTION_ID,
  KEY_RESULTS: config.KEY_RESULTS_COLLECTION_ID,
  INVOICES: config.INVOICES_COLLECTION_ID,
  EXPENSES: config.EXPENSES_COLLECTION_ID,
  CONTACTS: config.CONTACTS_COLLECTION_ID,
  LEADS: config.LEADS_COLLECTION_ID,
  TIME_LOGS: config.TIME_LOGS_COLLECTION_ID,
  MEETINGS: config.MEETINGS_COLLECTION_ID,
  ROLES: 'roles',
  INTERACTIONS: 'interactions',
  ARTICLES: 'articles',
  CATEGORIES: 'categories',
  COURSES: 'courses',
  LESSONS: 'lessons',
  JOBS: 'jobs',
  APPLICATIONS: 'applications'
};

export default client;
