const { Client, Account, Databases, ID } = require('appwrite');

// Configuration Appwrite
const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('68ee2dc2001f0f499c02');

const account = new Account(client);
const databases = new Databases(client);
const DATABASE_ID = '68ee527d002813e4e0ca';

// Utilisateurs SENEGEL avec mots de passe par défaut
const senegelUsers = [
  {
    firstName: 'Marieme',
    lastName: 'BADIANE',
    email: 'Mariemebl3@gmail.com',
    phone: '77 926 24 77',
    password: 'Senegel2024!',
    role: 'employee',
    department: 'Administration',
    position: 'Employée'
  },
  {
    firstName: 'Rokhaya',
    lastName: 'BODIAN',
    email: 'rokhaya@senegel.org',
    phone: '77 520 32 78',
    password: 'Senegel2024!',
    role: 'manager',
    department: 'Direction',
    position: 'Manager'
  },
  {
    firstName: 'Amy',
    lastName: 'DIAGNE',
    email: 'Nabyaminatoul08@gmail.com',
    phone: '77 905 14 87',
    password: 'Senegel2024!',
    role: 'employee',
    department: 'Technique',
    position: 'Employée'
  },
  {
    firstName: 'Awa',
    lastName: 'DIAGNE',
    email: 'awadiagne1003@gmail.com',
    phone: '77 453 44 76',
    password: 'Senegel2024!',
    role: 'employee',
    department: 'Administration',
    position: 'Employée'
  },
  {
    firstName: 'Adja Mame Sarr',
    lastName: 'DIALLO',
    email: 'adjadiallo598@gmail.com',
    phone: '77 477 39 39',
    password: 'Senegel2024!',
    role: 'employee',
    department: 'Commercial',
    position: 'Employée'
  },
  {
    firstName: 'Mouhamadou Lamine',
    lastName: 'DIASSE',
    email: 'mdiasse26@gmail.com',
    phone: '77 194 87 25',
    password: 'Senegel2024!',
    role: 'developer',
    department: 'Technique',
    position: 'Développeur'
  },
  {
    firstName: 'Ousmane',
    lastName: 'DIOP',
    email: 'diopiste@yahoo.fr',
    phone: '77 511 97 91',
    password: 'Senegel2024!',
    role: 'developer',
    department: 'Technique',
    position: 'Développeur'
  },
  {
    firstName: 'Bafode',
    lastName: 'DRAME',
    email: 'bafode.drame@senegel.org',
    phone: '77 650 96 68',
    password: 'Senegel2024!',
    role: 'employee',
    department: 'Administration',
    position: 'Employé'
  },
  {
    firstName: 'Adja Bineta Sylla',
    lastName: 'FAYE',
    email: 'adjabsf92@gmail.com',
    phone: '77 484 55 80',
    password: 'Senegel2024!',
    role: 'employee',
    department: 'RH',
    position: 'Employée'
  },
  {
    firstName: 'Oumar',
    lastName: 'GNINGUE',
    email: 'gningue04@gmail.com',
    phone: '77 768 49 99',
    password: 'Senegel2024!',
    role: 'employee',
    department: 'Commercial',
    position: 'Employé'
  },
  {
    firstName: 'Mariame Diouldé',
    lastName: 'GUINDO',
    email: 'onevisionbmca@gmail.com',
    phone: '77 564 44 40',
    password: 'Senegel2024!',
    role: 'employee',
    department: 'Marketing',
    position: 'Employée'
  },
  {
    firstName: 'Rokhaya',
    lastName: 'KEBE',
    email: 'rokhayakebe23@gmail.com',
    phone: '76 194 72 04',
    password: 'Senegel2024!',
    role: 'employee',
    department: 'Administration',
    position: 'Employée'
  },
  {
    firstName: 'Amadou Dia',
    lastName: 'LY',
    email: 'lyamadoudia@gmail.com',
    phone: '+1 (971) 270-8619',
    password: 'Senegel2024!',
    role: 'manager',
    department: 'Direction',
    position: 'Manager International'
  },
  {
    firstName: 'Cheikh Mohamed',
    lastName: 'NDIAYE',
    email: 'Wowastudios@gmail.com',
    phone: '77 283 55 14',
    password: 'Senegel2024!',
    role: 'designer',
    department: 'Technique',
    position: 'Designer'
  },
  {
    firstName: 'Charles',
    lastName: 'NYAFOUNA',
    email: 'cnyafouna@gmail.com',
    phone: '+44 7545 341935',
    password: 'Senegel2024!',
    role: 'manager',
    department: 'Direction',
    position: 'Manager International'
  },
  {
    firstName: 'Alioune Badara Pape',
    lastName: 'SAMB',
    email: 'pape@senegel.org',
    phone: '+1 (202) 557-4901',
    password: 'Senegel2024!',
    role: 'administrator',
    department: 'Direction',
    position: 'Administrateur'
  },
  {
    firstName: 'Rokhaya',
    lastName: 'SAMB',
    email: 'sambrokhy700@gmail.com',
    phone: '77 286 33 12',
    password: 'Senegel2024!',
    role: 'employee',
    department: 'Administration',
    position: 'Employée'
  },
  {
    firstName: 'Adama Mandaw',
    lastName: 'SENE',
    email: 'adamasene.fa@gmail.com',
    phone: '77 705 32 51',
    password: 'Senegel2024!',
    role: 'employee',
    department: 'Technique',
    position: 'Employé'
  },
  {
    firstName: 'CONTACT',
    lastName: 'SENEGEL',
    email: 'contact@senegel.org',
    phone: '77 853 33 99',
    password: 'Senegel2024!',
    role: 'super_administrator',
    department: 'Direction',
    position: 'Contact Principal'
  }
];

// Fonction pour créer un utilisateur
async function createUser(userData) {
  try {
    console.log(`🔄 Création compte: ${userData.firstName} ${userData.lastName}`);
    
    // 1. Créer le compte Appwrite
    const accountResponse = await account.create(
      ID.unique(),
      userData.email,
      userData.password,
      userData.firstName + ' ' + userData.lastName
    );
    
    console.log(`✅ Compte Appwrite créé: ${userData.email} (${accountResponse.$id})`);
    
    // 2. Créer le document utilisateur dans la base de données
    const userDocument = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      department: userData.department,
      position: userData.position,
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
    
    console.log(`✅ Document utilisateur créé: ${userData.firstName} ${userData.lastName} (${userDocResponse.$id})`);
    return { account: accountResponse, user: userDocResponse };
    
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

// Fonction principale
async function createSenegelUsers() {
  console.log('🚀 CRÉATION DES UTILISATEURS SENEGEL');
  console.log('=====================================\n');
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
      
      // Attendre un peu entre les créations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n🎉 CRÉATION TERMINÉE!`);
    console.log(`✅ ${successCount} utilisateurs créés avec succès`);
    console.log(`❌ ${errorCount} utilisateurs en erreur`);
    
    console.log('\n📋 UTILISATEURS SENEGEL CRÉÉS:');
    senegelUsers.forEach(user => {
      console.log(`  - ${user.firstName} ${user.lastName} (${user.role}) - ${user.email}`);
      console.log(`    Mot de passe: ${user.password}`);
    });
    
    console.log('\n🔐 INFORMATIONS DE CONNEXION:');
    console.log('Tous les utilisateurs peuvent se connecter avec:');
    console.log('Email: leur email respectif');
    console.log('Mot de passe: Senegel2024!');
    console.log('\n📧 Support: contact@senegel.org');
    console.log('📞 Téléphone: 77 853 33 99');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error.message);
  }
}

// Exécuter le script
createSenegelUsers();
