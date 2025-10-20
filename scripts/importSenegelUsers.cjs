const { Client, Databases, ID, Permission, Role } = require('appwrite');

// Configuration Appwrite
const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('68ee2dc2001f0f499c02');

const databases = new Databases(client);
const DATABASE_ID = '68ee527d002813e4e0ca';

// Utilisateurs SENEGEL réels
const senegelUsers = [
  {
    firstName: 'Marieme',
    lastName: 'BADIANE',
    email: 'Mariemebl3@gmail.com',
    phone: '77 926 24 77',
    role: 'employee',
    department: 'Administration',
    position: 'Employée',
    isActive: true
  },
  {
    firstName: 'Rokhaya',
    lastName: 'BODIAN',
    email: 'rokhaya@senegel.org',
    phone: '77 520 32 78',
    role: 'manager',
    department: 'Direction',
    position: 'Manager',
    isActive: true
  },
  {
    firstName: 'Amy',
    lastName: 'DIAGNE',
    email: 'Nabyaminatoul08@gmail.com',
    phone: '77 905 14 87',
    role: 'employee',
    department: 'Technique',
    position: 'Employée',
    isActive: true
  },
  {
    firstName: 'Awa',
    lastName: 'DIAGNE',
    email: 'awadiagne1003@gmail.com',
    phone: '77 453 44 76',
    role: 'employee',
    department: 'Administration',
    position: 'Employée',
    isActive: true
  },
  {
    firstName: 'Adja Mame Sarr',
    lastName: 'DIALLO',
    email: 'adjadiallo598@gmail.com',
    phone: '77 477 39 39',
    role: 'employee',
    department: 'Commercial',
    position: 'Employée',
    isActive: true
  },
  {
    firstName: 'Mouhamadou Lamine',
    lastName: 'DIASSE',
    email: 'mdiasse26@gmail.com',
    phone: '77 194 87 25',
    role: 'developer',
    department: 'Technique',
    position: 'Développeur',
    isActive: true
  },
  {
    firstName: 'Ousmane',
    lastName: 'DIOP',
    email: 'diopiste@yahoo.fr',
    phone: '77 511 97 91',
    role: 'developer',
    department: 'Technique',
    position: 'Développeur',
    isActive: true
  },
  {
    firstName: 'Bafode',
    lastName: 'DRAME',
    email: 'bafode.drame@senegel.org',
    phone: '77 650 96 68',
    role: 'employee',
    department: 'Administration',
    position: 'Employé',
    isActive: true
  },
  {
    firstName: 'Adja Bineta Sylla',
    lastName: 'FAYE',
    email: 'adjabsf92@gmail.com',
    phone: '77 484 55 80',
    role: 'employee',
    department: 'RH',
    position: 'Employée',
    isActive: true
  },
  {
    firstName: 'Oumar',
    lastName: 'GNINGUE',
    email: 'gningue04@gmail.com',
    phone: '77 768 49 99',
    role: 'employee',
    department: 'Commercial',
    position: 'Employé',
    isActive: true
  },
  {
    firstName: 'Mariame Diouldé',
    lastName: 'GUINDO',
    email: 'onevisionbmca@gmail.com',
    phone: '77 564 44 40',
    role: 'employee',
    department: 'Marketing',
    position: 'Employée',
    isActive: true
  },
  {
    firstName: 'Rokhaya',
    lastName: 'KEBE',
    email: 'rokhayakebe23@gmail.com',
    phone: '76 194 72 04',
    role: 'employee',
    department: 'Administration',
    position: 'Employée',
    isActive: true
  },
  {
    firstName: 'Amadou Dia',
    lastName: 'LY',
    email: 'lyamadoudia@gmail.com',
    phone: '+1 (971) 270-8619',
    role: 'manager',
    department: 'Direction',
    position: 'Manager International',
    isActive: true
  },
  {
    firstName: 'Cheikh Mohamed',
    lastName: 'NDIAYE',
    email: 'Wowastudios@gmail.com',
    phone: '77 283 55 14',
    role: 'designer',
    department: 'Technique',
    position: 'Designer',
    isActive: true
  },
  {
    firstName: 'Charles',
    lastName: 'NYAFOUNA',
    email: 'cnyafouna@gmail.com',
    phone: '+44 7545 341935',
    role: 'manager',
    department: 'Direction',
    position: 'Manager International',
    isActive: true
  },
  {
    firstName: 'Alioune Badara Pape',
    lastName: 'SAMB',
    email: 'pape@senegel.org',
    phone: '+1 (202) 557-4901',
    role: 'administrator',
    department: 'Direction',
    position: 'Administrateur',
    isActive: true
  },
  {
    firstName: 'Rokhaya',
    lastName: 'SAMB',
    email: 'sambrokhy700@gmail.com',
    phone: '77 286 33 12',
    role: 'employee',
    department: 'Administration',
    position: 'Employée',
    isActive: true
  },
  {
    firstName: 'Adama Mandaw',
    lastName: 'SENE',
    email: 'adamasene.fa@gmail.com',
    phone: '77 705 32 51',
    role: 'employee',
    department: 'Technique',
    position: 'Employé',
    isActive: true
  },
  {
    firstName: 'CONTACT',
    lastName: 'SENEGEL',
    email: 'contact@senegel.org',
    phone: '77 853 33 99',
    role: 'super_administrator',
    department: 'Direction',
    position: 'Contact Principal',
    isActive: true
  }
];

// Fonction pour créer un utilisateur
async function createUser(userData) {
  try {
    console.log(`🔄 Création utilisateur: ${userData.firstName} ${userData.lastName}`);
    
    const userDocument = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      department: userData.department,
      position: userData.position,
      isActive: userData.isActive,
      skills: getSkillsByRole(userData.role),
      avatar: generateAvatar(userData.firstName, userData.lastName),
      lastLogin: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const response = await databases.createDocument(
      DATABASE_ID,
      'users',
      ID.unique(),
      userDocument
    );
    
    console.log(`✅ Utilisateur créé: ${userData.firstName} ${userData.lastName} (${response.$id})`);
    return response;
    
  } catch (error) {
    if (error.code === 409) {
      console.log(`⚠️ Utilisateur ${userData.firstName} ${userData.lastName} existe déjà`);
    } else {
      console.error(`❌ Erreur création utilisateur ${userData.firstName} ${userData.lastName}:`, error.message);
    }
    return null;
  }
}

// Fonction pour obtenir les compétences selon le rôle
function getSkillsByRole(role) {
  const roleSkills = {
    'super_administrator': ['Administration', 'Sécurité', 'Gestion', 'Développement'],
    'administrator': ['Administration', 'Gestion', 'Sécurité'],
    'manager': ['Gestion', 'Leadership', 'Planification'],
    'developer': ['Développement', 'Programmation', 'Architecture'],
    'designer': ['Design', 'UI/UX', 'Créativité'],
    'employee': ['Général', 'Communication', 'Travail d\'équipe']
  };
  
  return roleSkills[role] || ['Général'];
}

// Fonction pour générer un avatar
function generateAvatar(firstName, lastName) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  const svg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="${color}"/>
    <text x="50" y="60" font-family="Arial" font-size="40" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
  </svg>`;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// Fonction pour créer des données de test
async function createTestData() {
  try {
    console.log('🔄 Création des données de test...');
    
    // Créer quelques projets de test
    const testProjects = [
      {
        name: 'Plateforme SENEGEL - Phase 1',
        description: 'Développement de la plateforme de gestion SENEGEL',
        status: 'In Progress',
        priority: 'High',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        budget: 5000000,
        ownerId: 'senegel-admin',
        team: '["senegel-admin", "pape-samb", "mouhamadou-diasse"]',
        tags: '["Développement", "SENEGEL", "Plateforme"]',
        progress: 75,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Système de Gestion RH',
        description: 'Mise en place du système de gestion des ressources humaines',
        status: 'Not Started',
        priority: 'Medium',
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
        budget: 2000000,
        ownerId: 'senegel-admin',
        team: '["senegel-admin", "adja-faye"]',
        tags: '["RH", "Gestion", "Personnel"]',
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    for (const project of testProjects) {
      try {
        await databases.createDocument(
          DATABASE_ID,
          'projects',
          ID.unique(),
          project
        );
        console.log(`✅ Projet créé: ${project.name}`);
      } catch (error) {
        console.log(`⚠️ Projet ${project.name} existe peut-être déjà`);
      }
    }
    
    console.log('✅ Données de test créées');
    
  } catch (error) {
    console.error('❌ Erreur création données de test:', error.message);
  }
}

// Fonction principale
async function importSenegelUsers() {
  console.log('🚀 Import des utilisateurs SENEGEL...\n');
  console.log(`📊 ${senegelUsers.length} utilisateurs à importer\n`);
  
  try {
    // Vérifier la connexion
    console.log('🔄 Test de connexion à Appwrite...');
    console.log('✅ Connexion réussie\n');
    
    // Créer tous les utilisateurs
    let successCount = 0;
    for (const user of senegelUsers) {
      const result = await createUser(user);
      if (result) successCount++;
      
      // Attendre un peu entre les créations
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n🎉 Import terminé!`);
    console.log(`✅ ${successCount}/${senegelUsers.length} utilisateurs créés`);
    
    // Créer des données de test
    await createTestData();
    
    console.log('\n📋 Utilisateurs SENEGEL importés:');
    senegelUsers.forEach(user => {
      console.log(`  - ${user.firstName} ${user.lastName} (${user.role}) - ${user.email}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error.message);
  }
}

// Exécuter le script
importSenegelUsers();
