const { Client, Account, Databases, ID } = require('appwrite');

// Configuration Appwrite
const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('68ee2dc2001f0f499c02');

const account = new Account(client);
const databases = new Databases(client);
const DATABASE_ID = '68ee527d002813e4e0ca';

// Utilisateurs SENEGEL avec rôles spécifiques
const senegelUsers = [
  {
    firstName: 'Marieme',
    lastName: 'BADIANE',
    email: 'Mariemebl3@gmail.com',
    phone: '77 926 24 77',
    password: 'Senegel2024!',
    role: 'hr',
    department: 'Ressources Humaines',
    position: 'Responsable RH',
    description: 'Gestion du personnel et des ressources humaines'
  },
  {
    firstName: 'Rokhaya',
    lastName: 'BODIAN',
    email: 'rokhaya@senegel.org',
    phone: '77 520 32 78',
    password: 'Senegel2024!',
    role: 'manager',
    department: 'Direction',
    position: 'Directrice Générale',
    description: 'Direction générale de l\'entreprise'
  },
  {
    firstName: 'Amy',
    lastName: 'DIAGNE',
    email: 'Nabyaminatoul08@gmail.com',
    phone: '77 905 14 87',
    password: 'Senegel2024!',
    role: 'analyst',
    department: 'Analyse',
    position: 'Analyste de Données',
    description: 'Analyse des données et reporting'
  },
  {
    firstName: 'Awa',
    lastName: 'DIAGNE',
    email: 'awadiagne1003@gmail.com',
    phone: '77 453 44 76',
    password: 'Senegel2024!',
    role: 'finance',
    department: 'Finance',
    position: 'Comptable',
    description: 'Gestion comptable et financière'
  },
  {
    firstName: 'Adja Mame Sarr',
    lastName: 'DIALLO',
    email: 'adjadiallo598@gmail.com',
    phone: '77 477 39 39',
    password: 'Senegel2024!',
    role: 'sales',
    department: 'Commercial',
    position: 'Responsable Commercial',
    description: 'Gestion des ventes et du commercial'
  },
  {
    firstName: 'Mouhamadou Lamine',
    lastName: 'DIASSE',
    email: 'mdiasse26@gmail.com',
    phone: '77 194 87 25',
    password: 'Senegel2024!',
    role: 'developer',
    department: 'Technique',
    position: 'Développeur Senior',
    description: 'Développement et maintenance technique'
  },
  {
    firstName: 'Ousmane',
    lastName: 'DIOP',
    email: 'diopiste@yahoo.fr',
    phone: '77 511 97 91',
    password: 'Senegel2024!',
    role: 'developer',
    department: 'Technique',
    position: 'Développeur Full-Stack',
    description: 'Développement frontend et backend'
  },
  {
    firstName: 'Bafode',
    lastName: 'DRAME',
    email: 'bafode.drame@senegel.org',
    phone: '77 650 96 68',
    password: 'Senegel2024!',
    role: 'operations',
    department: 'Opérations',
    position: 'Responsable Opérations',
    description: 'Gestion des opérations quotidiennes'
  },
  {
    firstName: 'Adja Bineta Sylla',
    lastName: 'FAYE',
    email: 'adjabsf92@gmail.com',
    phone: '77 484 55 80',
    password: 'Senegel2024!',
    role: 'hr',
    department: 'Ressources Humaines',
    position: 'Assistante RH',
    description: 'Support aux ressources humaines'
  },
  {
    firstName: 'Oumar',
    lastName: 'GNINGUE',
    email: 'gningue04@gmail.com',
    phone: '77 768 49 99',
    password: 'Senegel2024!',
    role: 'sales',
    department: 'Commercial',
    position: 'Commercial',
    description: 'Prospection et vente'
  },
  {
    firstName: 'Mariame Diouldé',
    lastName: 'GUINDO',
    email: 'onevisionbmca@gmail.com',
    phone: '77 564 44 40',
    password: 'Senegel2024!',
    role: 'marketing',
    department: 'Marketing',
    position: 'Responsable Marketing',
    description: 'Stratégie marketing et communication'
  },
  {
    firstName: 'Rokhaya',
    lastName: 'KEBE',
    email: 'rokhayakebe23@gmail.com',
    phone: '76 194 72 04',
    password: 'Senegel2024!',
    role: 'support',
    department: 'Support',
    position: 'Support Client',
    description: 'Assistance et support aux clients'
  },
  {
    firstName: 'Amadou Dia',
    lastName: 'LY',
    email: 'lyamadoudia@gmail.com',
    phone: '+1 (971) 270-8619',
    password: 'Senegel2024!',
    role: 'manager',
    department: 'Direction',
    position: 'Manager International',
    description: 'Gestion des opérations internationales'
  },
  {
    firstName: 'Cheikh Mohamed',
    lastName: 'NDIAYE',
    email: 'Wowastudios@gmail.com',
    phone: '77 283 55 14',
    password: 'Senegel2024!',
    role: 'designer',
    department: 'Design',
    position: 'Designer UI/UX',
    description: 'Design d\'interface et expérience utilisateur'
  },
  {
    firstName: 'Charles',
    lastName: 'NYAFOUNA',
    email: 'cnyafouna@gmail.com',
    phone: '+44 7545 341935',
    password: 'Senegel2024!',
    role: 'manager',
    department: 'Direction',
    position: 'Manager Stratégique',
    description: 'Stratégie et planification'
  },
  {
    firstName: 'Alioune Badara Pape',
    lastName: 'SAMB',
    email: 'pape@senegel.org',
    phone: '+1 (202) 557-4901',
    password: 'Senegel2024!',
    role: 'administrator',
    department: 'Direction',
    position: 'Administrateur Principal',
    description: 'Administration générale et sécurité'
  },
  {
    firstName: 'Rokhaya',
    lastName: 'SAMB',
    email: 'sambrokhy700@gmail.com',
    phone: '77 286 33 12',
    password: 'Senegel2024!',
    role: 'content',
    department: 'Communication',
    position: 'Responsable Contenu',
    description: 'Création et gestion de contenu'
  },
  {
    firstName: 'Adama Mandaw',
    lastName: 'SENE',
    email: 'adamasene.fa@gmail.com',
    phone: '77 705 32 51',
    password: 'Senegel2024!',
    role: 'tester',
    department: 'Qualité',
    position: 'Testeur QA',
    description: 'Tests et assurance qualité'
  },
  {
    firstName: 'CONTACT',
    lastName: 'SENEGEL',
    email: 'contact@senegel.org',
    phone: '77 853 33 99',
    password: 'Senegel2024!',
    role: 'super_administrator',
    department: 'Direction',
    position: 'Super Administrateur',
    description: 'Accès complet et administration système'
  }
];

// Fonction pour créer un utilisateur
async function createUser(userData) {
  try {
    console.log(`🔄 Création: ${userData.firstName} ${userData.lastName} (${userData.role})`);
    
    // 1. Créer le compte Appwrite
    const accountResponse = await account.create(
      ID.unique(),
      userData.email,
      userData.password,
      userData.firstName + ' ' + userData.lastName
    );
    
    console.log(`✅ Compte créé: ${userData.email} (${accountResponse.$id})`);
    
    // 2. Créer le document utilisateur
    const userDocument = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      department: userData.department,
      position: userData.position,
      description: userData.description,
      isActive: true,
      skills: getSkillsByRole(userData.role),
      avatar: generateAvatar(userData.firstName, userData.lastName),
      lastLogin: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: accountResponse.$id
    };
    
    const userDocResponse = await databases.createDocument(
      DATABASE_ID,
      'users',
      ID.unique(),
      userDocument
    );
    
    console.log(`✅ Profil créé: ${userData.firstName} ${userData.lastName} (${userDocResponse.$id})`);
    return { account: accountResponse, user: userDocResponse };
    
  } catch (error) {
    if (error.code === 409) {
      console.log(`⚠️ Utilisateur ${userData.firstName} ${userData.lastName} existe déjà`);
    } else {
      console.error(`❌ Erreur ${userData.firstName} ${userData.lastName}: ${error.message}`);
    }
    return null;
  }
}

// Fonction pour obtenir les compétences selon le rôle
function getSkillsByRole(role) {
  const roleSkills = {
    'super_administrator': ['Administration', 'Sécurité', 'Gestion', 'Développement'],
    'administrator': ['Administration', 'Gestion', 'Sécurité'],
    'manager': ['Gestion', 'Leadership', 'Planification', 'Stratégie'],
    'developer': ['Développement', 'Programmation', 'Architecture', 'Technologie'],
    'designer': ['Design', 'UI/UX', 'Créativité', 'Prototypage'],
    'analyst': ['Analyse', 'Données', 'Reporting', 'Business Intelligence'],
    'tester': ['Test', 'Qualité', 'Validation', 'Assurance Qualité'],
    'hr': ['RH', 'Gestion', 'Recrutement', 'Formation'],
    'finance': ['Finance', 'Comptabilité', 'Analyse', 'Budget'],
    'sales': ['Vente', 'Commercial', 'Négociation', 'Prospection'],
    'marketing': ['Marketing', 'Communication', 'Stratégie', 'Branding'],
    'support': ['Support', 'Assistance', 'Communication', 'Résolution'],
    'operations': ['Opérations', 'Gestion', 'Optimisation', 'Processus'],
    'content': ['Contenu', 'Rédaction', 'Communication', 'Création']
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

// Fonction principale
async function createSenegelUsersFinal() {
  console.log('🚀 CRÉATION DES UTILISATEURS SENEGEL FINAUX');
  console.log('==========================================\n');
  console.log(`📊 ${senegelUsers.length} utilisateurs à créer\n`);
  
  try {
    let successCount = 0;
    let errorCount = 0;
    
    for (const user of senegelUsers) {
      const result = await createUser(user);
      if (result) {
        successCount++;
      } else {
        errorCount++;
      }
      
      // Attendre entre les créations
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`\n🎉 CRÉATION TERMINÉE!`);
    console.log(`✅ ${successCount} utilisateurs créés avec succès`);
    console.log(`❌ ${errorCount} utilisateurs en erreur`);
    
    // Afficher les accès par rôle
    console.log('\n👥 ACCÈS PAR RÔLE:');
    console.log('==================');
    
    const usersByRole = {};
    senegelUsers.forEach(user => {
      if (!usersByRole[user.role]) {
        usersByRole[user.role] = [];
      }
      usersByRole[user.role].push(user);
    });
    
    Object.keys(usersByRole).forEach(role => {
      console.log(`\n🔹 ${role.toUpperCase()}:`);
      usersByRole[role].forEach(user => {
        console.log(`  - ${user.firstName} ${user.lastName} (${user.position})`);
        console.log(`    Email: ${user.email} | Mot de passe: ${user.password}`);
      });
    });
    
    console.log('\n📧 Support: contact@senegel.org');
    console.log('📞 Téléphone: 77 853 33 99');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error.message);
  }
}

// Exécuter le script
createSenegelUsersFinal();
