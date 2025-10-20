/**
 * 👥 SCRIPT CRÉATION UTILISATEURS DE TEST - ECOSYSTIA
 * Crée des utilisateurs de test avec différents rôles
 * Référence : MERISE/02-MLD-MPD-IMPLEMENTATION-APPWRITE.md - Collection 1
 */

import { Client, Account, Databases, ID, Query } from 'appwrite';
import { Role } from '../types';

// Configuration Appwrite
const APPWRITE_ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '68ee2dc2001f0f499c02';
const APPWRITE_DATABASE_ID = '68ee527d002813e4e0ca';
const APPWRITE_API_KEY = 'standard_02717fc47c45cff4edc16624ae9127ca436dff8bd115037e795dec54eb8c50f53d989078ad57f2ca52daa41ce272dfc205bca21613f2d07c98525613e3da936d71ff2c5804b392c7c79760dcd3c8a7998c1c2078d73bd310b8dde7224c14fb802c5302625bd3a3fca79c7ca5d52b4585dcd959a9810d387a065f2e64af71df38';

// Initialisation Appwrite
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const account = new Account(client);
const databases = new Databases(client);
const DATABASE_ID = APPWRITE_DATABASE_ID;

interface TestUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  skills?: string[];
}

const testUsers: TestUser[] = [
  // Administrateurs
  {
    firstName: 'Admin',
    lastName: 'Principal',
    email: 'admin@ecosystia.sn',
    password: 'Admin123!',
    role: 'super_administrator',
    phone: '+221 77 123 45 67',
    skills: ['Gestion', 'Administration', 'Sécurité']
  },
  {
    firstName: 'Manager',
    lastName: 'Projet',
    email: 'manager@ecosystia.sn',
    password: 'Manager123!',
    role: 'manager',
    phone: '+221 77 234 56 78',
    skills: ['Gestion de projet', 'Leadership', 'Communication']
  },
  
  // Jeunes
  {
    firstName: 'Aminata',
    lastName: 'Diop',
    email: 'aminata@ecosystia.sn',
    password: 'Student123!',
    role: 'student',
    phone: '+221 77 345 67 89',
    skills: ['Développement', 'Design', 'Marketing']
  },
  {
    firstName: 'Moussa',
    lastName: 'Fall',
    email: 'moussa@ecosystia.sn',
    password: 'Entrepreneur123!',
    role: 'entrepreneur',
    phone: '+221 77 456 78 90',
    skills: ['Business', 'Innovation', 'Finance']
  },
  
  // Partenaires
  {
    firstName: 'Fatou',
    lastName: 'Sarr',
    email: 'fatou@ecosystia.sn',
    password: 'Employer123!',
    role: 'employer',
    phone: '+221 77 567 89 01',
    skills: ['RH', 'Recrutement', 'Formation']
  },
  {
    firstName: 'Ibrahima',
    lastName: 'Ndiaye',
    email: 'ibrahima@ecosystia.sn',
    password: 'Trainer123!',
    role: 'trainer',
    phone: '+221 77 678 90 12',
    skills: ['Formation', 'Pédagogie', 'Technologie']
  },
  
  // Contributeurs
  {
    firstName: 'Aïcha',
    lastName: 'Ba',
    email: 'aicha@ecosystia.sn',
    password: 'Mentor123!',
    role: 'mentor',
    phone: '+221 77 789 01 23',
    skills: ['Mentorat', 'Coaching', 'Développement personnel']
  },
  {
    firstName: 'Cheikh',
    lastName: 'Wade',
    email: 'cheikh@ecosystia.sn',
    password: 'Coach123!',
    role: 'coach',
    phone: '+221 77 890 12 34',
    skills: ['Coaching', 'Leadership', 'Performance']
  }
];

async function createTestUser(userData: TestUser): Promise<boolean> {
  try {
    console.log(`🔄 Création utilisateur: ${userData.email} (${userData.role})`);

    // 1. Créer le compte Appwrite Auth
    const accountResponse = await account.create(
      ID.unique(),
      userData.email,
      userData.password,
      `${userData.firstName} ${userData.lastName}`
    );

    if (!accountResponse) {
      throw new Error('Échec de la création du compte');
    }

    // 2. Créer le document utilisateur dans la collection
    const userDoc = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: userData.role,
      phone: userData.phone || '',
      skills: JSON.stringify(userData.skills || []),
      avatar: '',
    };

    const userResponse = await databases.createDocument(
      DATABASE_ID,
      'users',
      accountResponse.$id, // Utiliser l'ID du compte comme ID du document
      userDoc
    );

    console.log(`✅ Utilisateur créé: ${userData.email} (ID: ${userResponse.$id})`);
    return true;

  } catch (error: any) {
    if (error.message?.includes('User already exists')) {
      console.log(`⚠️ Utilisateur existe déjà: ${userData.email}`);
      return true; // Considérer comme succès
    }
    console.error(`❌ Erreur création ${userData.email}:`, error.message);
    return false;
  }
}

async function createAllTestUsers(): Promise<void> {
  console.log('🚀 DÉBUT CRÉATION UTILISATEURS DE TEST');
  console.log('=====================================');

  let successCount = 0;
  let errorCount = 0;

  for (const user of testUsers) {
    const success = await createTestUser(user);
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
    
    // Pause entre les créations pour éviter les limites de taux
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('=====================================');
  console.log(`✅ CRÉATION TERMINÉE !`);
  console.log(`📊 Résultats:`);
  console.log(`   - Succès: ${successCount}`);
  console.log(`   - Erreurs: ${errorCount}`);
  console.log(`   - Total: ${testUsers.length}`);
  
  if (successCount > 0) {
    console.log('\n🔑 IDENTIFIANTS DE TEST:');
    console.log('========================');
    testUsers.forEach(user => {
      console.log(`${user.role}: ${user.email} / ${user.password}`);
    });
  }
}

// Exécuter le script
createAllTestUsers()
  .then(() => {
    console.log('\n✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur script:', error);
    process.exit(1);
  });
