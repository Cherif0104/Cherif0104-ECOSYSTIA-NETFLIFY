const { Client, Account, Databases, Query, ID } = require('appwrite');

// Configuration Appwrite
const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('68ee2dc2001f0f499c02');

const account = new Account(client);
const databases = new Databases(client);
const DATABASE_ID = '68ee527d002813e4e0ca';

// Mapping des utilisateurs existants avec leurs rôles
const userRoles = {
  'Mariemebl3@gmail.com': {
    firstName: 'Marieme',
    lastName: 'BADIANE',
    role: 'hr',
    department: 'Ressources Humaines',
    position: 'Responsable RH',
    phone: '77 926 24 77'
  },
  'rokhaya@senegel.org': {
    firstName: 'Rokhaya',
    lastName: 'BODIAN',
    role: 'manager',
    department: 'Direction',
    position: 'Directrice Générale',
    phone: '77 520 32 78'
  },
  'Nabyaminatoul08@gmail.com': {
    firstName: 'Amy',
    lastName: 'DIAGNE',
    role: 'analyst',
    department: 'Analyse',
    position: 'Analyste de Données',
    phone: '77 905 14 87'
  },
  'awadiagne1003@gmail.com': {
    firstName: 'Awa',
    lastName: 'DIAGNE',
    role: 'finance',
    department: 'Finance',
    position: 'Comptable',
    phone: '77 453 44 76'
  },
  'adjadiallo598@gmail.com': {
    firstName: 'Adja Mame Sarr',
    lastName: 'DIALLO',
    role: 'sales',
    department: 'Commercial',
    position: 'Responsable Commercial',
    phone: '77 477 39 39'
  },
  'mdiasse26@gmail.com': {
    firstName: 'Mouhamadou Lamine',
    lastName: 'DIASSE',
    role: 'developer',
    department: 'Technique',
    position: 'Développeur Senior',
    phone: '77 194 87 25'
  },
  'diopiste@yahoo.fr': {
    firstName: 'Ousmane',
    lastName: 'DIOP',
    role: 'developer',
    department: 'Technique',
    position: 'Développeur Full-Stack',
    phone: '77 511 97 91'
  },
  'bafode.drame@senegel.org': {
    firstName: 'Bafode',
    lastName: 'DRAME',
    role: 'operations',
    department: 'Opérations',
    position: 'Responsable Opérations',
    phone: '77 650 96 68'
  },
  'adjabsf92@gmail.com': {
    firstName: 'Adja Bineta Sylla',
    lastName: 'FAYE',
    role: 'hr',
    department: 'Ressources Humaines',
    position: 'Assistante RH',
    phone: '77 484 55 80'
  },
  'gningue04@gmail.com': {
    firstName: 'Oumar',
    lastName: 'GNINGUE',
    role: 'sales',
    department: 'Commercial',
    position: 'Commercial',
    phone: '77 768 49 99'
  }
};

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

// Fonction pour mettre à jour un utilisateur
async function updateUser(email, userData) {
  try {
    console.log(`🔄 Mise à jour: ${userData.firstName} ${userData.lastName} (${userData.role})`);
    
    // Créer le document utilisateur avec les bonnes données
    const userDocument = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: email,
      phone: userData.phone,
      role: userData.role,
      department: userData.department,
      position: userData.position,
      isActive: true,
      skills: getSkillsByRole(userData.role),
      avatar: generateAvatar(userData.firstName, userData.lastName),
      lastLogin: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const userDocResponse = await databases.createDocument(
      DATABASE_ID,
      'users',
      ID.unique(),
      userDocument
    );
    
    console.log(`✅ Profil créé: ${userData.firstName} ${userData.lastName} (${userDocResponse.$id})`);
    return userDocResponse;
    
  } catch (error) {
    if (error.code === 409) {
      console.log(`⚠️ Utilisateur ${userData.firstName} ${userData.lastName} existe déjà`);
    } else {
      console.error(`❌ Erreur ${userData.firstName} ${userData.lastName}: ${error.message}`);
    }
    return null;
  }
}

// Fonction principale
async function updateUserRoles() {
  console.log('🔄 MISE À JOUR DES RÔLES UTILISATEURS SENEGEL');
  console.log('============================================\n');
  
  try {
    let successCount = 0;
    let totalCount = Object.keys(userRoles).length;
    
    for (const [email, userData] of Object.entries(userRoles)) {
      const result = await updateUser(email, userData);
      if (result) {
        successCount++;
      }
      
      // Attendre entre les mises à jour
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`\n🎉 MISE À JOUR TERMINÉE!`);
    console.log(`✅ ${successCount}/${totalCount} utilisateurs mis à jour`);
    
    // Afficher les accès par rôle
    console.log('\n👥 UTILISATEURS PAR RÔLE:');
    console.log('========================');
    
    const usersByRole = {};
    Object.values(userRoles).forEach(user => {
      if (!usersByRole[user.role]) {
        usersByRole[user.role] = [];
      }
      usersByRole[user.role].push(user);
    });
    
    Object.keys(usersByRole).forEach(role => {
      console.log(`\n🔹 ${role.toUpperCase()}:`);
      usersByRole[role].forEach(user => {
        console.log(`  - ${user.firstName} ${user.lastName} (${user.position})`);
      });
    });
    
    console.log('\n🔐 INFORMATIONS DE CONNEXION:');
    console.log('URL: http://localhost:5176');
    console.log('Email: [email de l\'utilisateur]');
    console.log('Mot de passe: Senegel2024!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error.message);
  }
}

// Exécuter le script
updateUserRoles();
