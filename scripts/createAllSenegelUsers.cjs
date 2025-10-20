const { Client, Account, Databases, ID } = require('appwrite');

// Configuration Appwrite
const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('68ee2dc2001f0f499c02');

const account = new Account(client);
const databases = new Databases(client);
const DATABASE_ID = '68ee527d002813e4e0ca';

// Tous les utilisateurs SENEGEL avec rôles spécifiques
const allSenegelUsers = [
  {
    firstName: 'Marieme',
    lastName: 'BADIANE',
    email: 'Mariemebl3@gmail.com',
    phone: '77 926 24 77',
    password: 'Senegel2024!',
    role: 'hr',
    department: 'Ressources Humaines',
    position: 'Responsable RH'
  },
  {
    firstName: 'Rokhaya',
    lastName: 'BODIAN',
    email: 'rokhaya@senegel.org',
    phone: '77 520 32 78',
    password: 'Senegel2024!',
    role: 'manager',
    department: 'Direction',
    position: 'Directrice Générale'
  },
  {
    firstName: 'Amy',
    lastName: 'DIAGNE',
    email: 'Nabyaminatoul08@gmail.com',
    phone: '77 905 14 87',
    password: 'Senegel2024!',
    role: 'analyst',
    department: 'Analyse',
    position: 'Analyste de Données'
  },
  {
    firstName: 'Awa',
    lastName: 'DIAGNE',
    email: 'awadiagne1003@gmail.com',
    phone: '77 453 44 76',
    password: 'Senegel2024!',
    role: 'finance',
    department: 'Finance',
    position: 'Comptable'
  },
  {
    firstName: 'Adja Mame Sarr',
    lastName: 'DIALLO',
    email: 'adjadiallo598@gmail.com',
    phone: '77 477 39 39',
    password: 'Senegel2024!',
    role: 'sales',
    department: 'Commercial',
    position: 'Responsable Commercial'
  },
  {
    firstName: 'Mouhamadou Lamine',
    lastName: 'DIASSE',
    email: 'mdiasse26@gmail.com',
    phone: '77 194 87 25',
    password: 'Senegel2024!',
    role: 'developer',
    department: 'Technique',
    position: 'Développeur Senior'
  },
  {
    firstName: 'Ousmane',
    lastName: 'DIOP',
    email: 'diopiste@yahoo.fr',
    phone: '77 511 97 91',
    password: 'Senegel2024!',
    role: 'developer',
    department: 'Technique',
    position: 'Développeur Full-Stack'
  },
  {
    firstName: 'Bafode',
    lastName: 'DRAME',
    email: 'bafode.drame@senegel.org',
    phone: '77 650 96 68',
    password: 'Senegel2024!',
    role: 'operations',
    department: 'Opérations',
    position: 'Responsable Opérations'
  },
  {
    firstName: 'Adja Bineta Sylla',
    lastName: 'FAYE',
    email: 'adjabsf92@gmail.com',
    phone: '77 484 55 80',
    password: 'Senegel2024!',
    role: 'hr',
    department: 'Ressources Humaines',
    position: 'Assistante RH'
  },
  {
    firstName: 'Oumar',
    lastName: 'GNINGUE',
    email: 'gningue04@gmail.com',
    phone: '77 768 49 99',
    password: 'Senegel2024!',
    role: 'sales',
    department: 'Commercial',
    position: 'Commercial'
  },
  {
    firstName: 'Mariame Diouldé',
    lastName: 'GUINDO',
    email: 'onevisionbmca@gmail.com',
    phone: '77 564 44 40',
    password: 'Senegel2024!',
    role: 'marketing',
    department: 'Marketing',
    position: 'Responsable Marketing'
  },
  {
    firstName: 'Rokhaya',
    lastName: 'KEBE',
    email: 'rokhayakebe23@gmail.com',
    phone: '76 194 72 04',
    password: 'Senegel2024!',
    role: 'support',
    department: 'Support',
    position: 'Support Client'
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
    department: 'Design',
    position: 'Designer UI/UX'
  },
  {
    firstName: 'Charles',
    lastName: 'NYAFOUNA',
    email: 'cnyafouna@gmail.com',
    phone: '+44 7545 341935',
    password: 'Senegel2024!',
    role: 'manager',
    department: 'Direction',
    position: 'Manager Stratégique'
  },
  {
    firstName: 'Alioune Badara Pape',
    lastName: 'SAMB',
    email: 'pape@senegel.org',
    phone: '+1 (202) 557-4901',
    password: 'Senegel2024!',
    role: 'administrator',
    department: 'Direction',
    position: 'Administrateur Principal'
  },
  {
    firstName: 'Rokhaya',
    lastName: 'SAMB',
    email: 'sambrokhy700@gmail.com',
    phone: '77 286 33 12',
    password: 'Senegel2024!',
    role: 'content',
    department: 'Communication',
    position: 'Responsable Contenu'
  },
  {
    firstName: 'Adama Mandaw',
    lastName: 'SENE',
    email: 'adamasene.fa@gmail.com',
    phone: '77 705 32 51',
    password: 'Senegel2024!',
    role: 'tester',
    department: 'Qualité',
    position: 'Testeur QA'
  },
  {
    firstName: 'CONTACT',
    lastName: 'SENEGEL',
    email: 'contact@senegel.org',
    phone: '77 853 33 99',
    password: 'Senegel2024!',
    role: 'super_administrator',
    department: 'Direction',
    position: 'Super Administrateur'
  }
];

// Fonction pour créer un utilisateur avec retry
async function createUserWithRetry(userData, index, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`\n🔄 [${index + 1}/19] Tentative ${attempt}: ${userData.firstName} ${userData.lastName} (${userData.role})`);
      
      // Attendre progressivement plus longtemps
      if (index > 0) {
        const waitTime = Math.min(10000 + (index * 2000), 60000); // Max 1 minute
        console.log(`⏳ Attente de ${waitTime/1000} secondes...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
      // 1. Créer le compte Appwrite
      const accountResponse = await account.create(
        ID.unique(),
        userData.email,
        userData.password,
        userData.firstName + ' ' + userData.lastName
      );
      
      console.log(`✅ Compte créé: ${userData.email} (${accountResponse.$id})`);
      
      // Attendre avant de créer le document
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 2. Créer le document utilisateur
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
      
      console.log(`✅ Profil créé: ${userData.firstName} ${userData.lastName} (${userDocResponse.$id})`);
      return { success: true, account: accountResponse, user: userDocResponse };
      
    } catch (error) {
      if (error.code === 409) {
        console.log(`⚠️ Utilisateur ${userData.firstName} ${userData.lastName} existe déjà`);
        return { success: true, exists: true };
      } else if (error.message.includes('Rate limit')) {
        console.log(`⏳ Rate limit atteint - Attente de ${60 * attempt} secondes...`);
        await new Promise(resolve => setTimeout(resolve, 60000 * attempt));
        continue; // Réessayer
      } else {
        console.error(`❌ Erreur tentative ${attempt}: ${error.message}`);
        if (attempt === maxRetries) {
          return { success: false, error: error.message };
        }
        // Attendre avant de réessayer
        await new Promise(resolve => setTimeout(resolve, 10000 * attempt));
      }
    }
  }
  
  return { success: false, error: 'Max retries atteint' };
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
async function createAllSenegelUsers() {
  console.log('🚀 CRÉATION DE TOUS LES 19 UTILISATEURS SENEGEL');
  console.log('===============================================\n');
  console.log(`📊 ${allSenegelUsers.length} utilisateurs à créer`);
  console.log('⏳ Temps estimé: ~30-45 minutes (avec retry et attentes)\n');
  
  const results = {
    success: 0,
    exists: 0,
    error: 0,
    users: []
  };
  
  try {
    for (let i = 0; i < allSenegelUsers.length; i++) {
      const user = allSenegelUsers[i];
      const result = await createUserWithRetry(user, i);
      
      if (result.success) {
        if (result.exists) {
          results.exists++;
          console.log(`✅ ${user.firstName} ${user.lastName} - EXISTE DÉJÀ`);
        } else {
          results.success++;
          console.log(`✅ ${user.firstName} ${user.lastName} - CRÉÉ AVEC SUCCÈS`);
        }
        results.users.push({ ...user, status: 'success' });
      } else {
        results.error++;
        console.log(`❌ ${user.firstName} ${user.lastName} - ÉCHEC: ${result.error}`);
        results.users.push({ ...user, status: 'error', error: result.error });
      }
    }
    
    console.log(`\n🎉 CRÉATION TERMINÉE!`);
    console.log(`✅ ${results.success} utilisateurs créés avec succès`);
    console.log(`⚠️ ${results.exists} utilisateurs existaient déjà`);
    console.log(`❌ ${results.error} utilisateurs en erreur`);
    
    // Afficher le résumé par rôle
    console.log('\n👥 RÉSUMÉ PAR RÔLE:');
    console.log('==================');
    
    const usersByRole = {};
    results.users.forEach(user => {
      if (!usersByRole[user.role]) {
        usersByRole[user.role] = [];
      }
      usersByRole[user.role].push(user);
    });
    
    Object.keys(usersByRole).forEach(role => {
      console.log(`\n🔹 ${role.toUpperCase()}:`);
      usersByRole[role].forEach(user => {
        const status = user.status === 'success' ? '✅' : user.status === 'error' ? '❌' : '⚠️';
        console.log(`  ${status} ${user.firstName} ${user.lastName} (${user.position})`);
        console.log(`    Email: ${user.email} | Mot de passe: ${user.password}`);
      });
    });
    
    console.log('\n🔐 INFORMATIONS DE CONNEXION:');
    console.log('URL: http://localhost:5176');
    console.log('Mot de passe: Senegel2024!');
    console.log('\n📧 Support: contact@senegel.org');
    console.log('📞 Téléphone: 77 853 33 99');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error.message);
  }
}

// Exécuter le script
createAllSenegelUsers();

