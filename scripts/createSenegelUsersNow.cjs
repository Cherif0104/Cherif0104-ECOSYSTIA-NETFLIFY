const { Client, Account, Databases, ID } = require('appwrite');

// Configuration Appwrite
const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('68ee2dc2001f0f499c02');

const account = new Account(client);
const databases = new Databases(client);
const DATABASE_ID = '68ee527d002813e4e0ca';

// Utilisateurs SENEGEL - Création immédiate
const senegelUsers = [
  { firstName: 'Marieme', lastName: 'BADIANE', email: 'Mariemebl3@gmail.com', phone: '77 926 24 77', role: 'hr', department: 'Ressources Humaines', position: 'Responsable RH' },
  { firstName: 'Rokhaya', lastName: 'BODIAN', email: 'rokhaya@senegel.org', phone: '77 520 32 78', role: 'manager', department: 'Direction', position: 'Directrice Générale' },
  { firstName: 'Amy', lastName: 'DIAGNE', email: 'Nabyaminatoul08@gmail.com', phone: '77 905 14 87', role: 'analyst', department: 'Analyse', position: 'Analyste de Données' },
  { firstName: 'Awa', lastName: 'DIAGNE', email: 'awadiagne1003@gmail.com', phone: '77 453 44 76', role: 'finance', department: 'Finance', position: 'Comptable' },
  { firstName: 'Adja Mame Sarr', lastName: 'DIALLO', email: 'adjadiallo598@gmail.com', phone: '77 477 39 39', role: 'sales', department: 'Commercial', position: 'Responsable Commercial' },
  { firstName: 'Mouhamadou Lamine', lastName: 'DIASSE', email: 'mdiasse26@gmail.com', phone: '77 194 87 25', role: 'developer', department: 'Technique', position: 'Développeur Senior' },
  { firstName: 'Ousmane', lastName: 'DIOP', email: 'diopiste@yahoo.fr', phone: '77 511 97 91', role: 'developer', department: 'Technique', position: 'Développeur Full-Stack' },
  { firstName: 'Bafode', lastName: 'DRAME', email: 'bafode.drame@senegel.org', phone: '77 650 96 68', role: 'operations', department: 'Opérations', position: 'Responsable Opérations' },
  { firstName: 'Adja Bineta Sylla', lastName: 'FAYE', email: 'adjabsf92@gmail.com', phone: '77 484 55 80', role: 'hr', department: 'Ressources Humaines', position: 'Assistante RH' },
  { firstName: 'Oumar', lastName: 'GNINGUE', email: 'gningue04@gmail.com', phone: '77 768 49 99', role: 'sales', department: 'Commercial', position: 'Commercial' },
  { firstName: 'Mariame Diouldé', lastName: 'GUINDO', email: 'onevisionbmca@gmail.com', phone: '77 564 44 40', role: 'marketing', department: 'Marketing', position: 'Responsable Marketing' },
  { firstName: 'Rokhaya', lastName: 'KEBE', email: 'rokhayakebe23@gmail.com', phone: '76 194 72 04', role: 'support', department: 'Support', position: 'Support Client' },
  { firstName: 'Amadou Dia', lastName: 'LY', email: 'lyamadoudia@gmail.com', phone: '+1 (971) 270-8619', role: 'manager', department: 'Direction', position: 'Manager International' },
  { firstName: 'Cheikh Mohamed', lastName: 'NDIAYE', email: 'Wowastudios@gmail.com', phone: '77 283 55 14', role: 'designer', department: 'Design', position: 'Designer UI/UX' },
  { firstName: 'Charles', lastName: 'NYAFOUNA', email: 'cnyafouna@gmail.com', phone: '+44 7545 341935', role: 'manager', department: 'Direction', position: 'Manager Stratégique' },
  { firstName: 'Alioune Badara Pape', lastName: 'SAMB', email: 'pape@senegel.org', phone: '+1 (202) 557-4901', role: 'administrator', department: 'Direction', position: 'Administrateur Principal' },
  { firstName: 'Rokhaya', lastName: 'SAMB', email: 'sambrokhy700@gmail.com', phone: '77 286 33 12', role: 'content', department: 'Communication', position: 'Responsable Contenu' },
  { firstName: 'Adama Mandaw', lastName: 'SENE', email: 'adamasene.fa@gmail.com', phone: '77 705 32 51', role: 'tester', department: 'Qualité', position: 'Testeur QA' },
  { firstName: 'CONTACT', lastName: 'SENEGEL', email: 'contact@senegel.org', phone: '77 853 33 99', role: 'super_administrator', department: 'Direction', position: 'Super Administrateur' }
];

const password = 'Senegel2024!';

// Fonction pour créer un utilisateur
async function createUser(userData, index) {
  try {
    console.log(`\n🔄 [${index + 1}/19] Création: ${userData.firstName} ${userData.lastName}`);
    
    // Attendre progressivement
    if (index > 0) {
      const waitTime = Math.min(5000 + (index * 1000), 30000);
      console.log(`⏳ Attente ${waitTime/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    // Créer le compte
    const accountResponse = await account.create(
      ID.unique(),
      userData.email,
      password,
      userData.firstName + ' ' + userData.lastName
    );
    
    console.log(`✅ Compte: ${userData.email} (${accountResponse.$id})`);
    
    // Attendre avant le document
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Créer le document utilisateur
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
    
    console.log(`✅ Profil: ${userData.firstName} ${userData.lastName} (${userDocResponse.$id})`);
    return { success: true, user: userDocResponse };
    
  } catch (error) {
    if (error.code === 409) {
      console.log(`⚠️ Existe déjà: ${userData.firstName} ${userData.lastName}`);
      return { success: true, exists: true };
    } else if (error.message.includes('Rate limit')) {
      console.log(`⏳ Rate limit - Attente 60s...`);
      await new Promise(resolve => setTimeout(resolve, 60000));
      return await createUser(userData, index); // Retry
    } else {
      console.log(`❌ Erreur: ${userData.firstName} ${userData.lastName} - ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

function getSkillsByRole(role) {
  const skills = {
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
  return skills[role] || ['Général'];
}

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
async function createAllUsers() {
  console.log('🚀 CRÉATION IMMÉDIATE DES 19 UTILISATEURS SENEGEL');
  console.log('================================================\n');
  
  let success = 0, exists = 0, errors = 0;
  
  for (let i = 0; i < senegelUsers.length; i++) {
    const result = await createUser(senegelUsers[i], i);
    if (result.success) {
      if (result.exists) exists++;
      else success++;
    } else {
      errors++;
    }
  }
  
  console.log(`\n🎉 TERMINÉ!`);
  console.log(`✅ ${success} créés | ⚠️ ${exists} existaient | ❌ ${errors} erreurs`);
  
  console.log('\n👥 UTILISATEURS PAR RÔLE:');
  const byRole = {};
  senegelUsers.forEach(u => {
    if (!byRole[u.role]) byRole[u.role] = [];
    byRole[u.role].push(u);
  });
  
  Object.keys(byRole).forEach(role => {
    console.log(`\n🔹 ${role.toUpperCase()}:`);
    byRole[role].forEach(u => {
      console.log(`  - ${u.firstName} ${u.lastName} (${u.position})`);
      console.log(`    ${u.email} | ${password}`);
    });
  });
  
  console.log('\n🔐 CONNEXION: http://localhost:5176');
  console.log(`📧 Support: contact@senegel.org | 📞 77 853 33 99`);
}

createAllUsers();

