const { Client, Account, Databases, ID, Query } = require('appwrite');

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('68ee2dc2001f0f499c02');

const account = new Account(client);
const databases = new Databases(client);
const DATABASE_ID = '68ee527d002813e4e0ca';

// Utilisateurs existants avec leurs IDs Appwrite
const users = [
  { 
    name: 'Marieme BADIANE', 
    email: 'Mariemebl3@gmail.com', 
    phone: '77 926 24 77', 
    role: 'hr', 
    dept: 'Ressources Humaines', 
    pos: 'Responsable RH',
    appwriteId: '68f22d0c0031febb1af3'
  },
  { 
    name: 'Rokhaya BODIAN', 
    email: 'rokhaya@senegel.org', 
    phone: '77 520 32 78', 
    role: 'manager', 
    dept: 'Direction', 
    pos: 'Directrice Générale',
    appwriteId: '68f22d0f0003a5dd7a39'
  },
  { 
    name: 'Amy DIAGNE', 
    email: 'Nabyaminatoul08@gmail.com', 
    phone: '77 905 14 87', 
    role: 'analyst', 
    dept: 'Analyse', 
    pos: 'Analyste de Données',
    appwriteId: '68f22d100029d088e048'
  },
  { 
    name: 'Awa DIAGNE', 
    email: 'awadiagne1003@gmail.com', 
    phone: '77 453 44 76', 
    role: 'finance', 
    dept: 'Finance', 
    pos: 'Comptable',
    appwriteId: '68f22d12000ea54e9ef6'
  },
  { 
    name: 'Adja Mame Sarr DIALLO', 
    email: 'adjadiallo598@gmail.com', 
    phone: '77 477 39 39', 
    role: 'sales', 
    dept: 'Commercial', 
    pos: 'Responsable Commercial',
    appwriteId: '68f22d130033376272ba'
  },
  { 
    name: 'Mouhamadou Lamine DIASSE', 
    email: 'mdiasse26@gmail.com', 
    phone: '77 194 87 25', 
    role: 'developer', 
    dept: 'Technique', 
    pos: 'Développeur Senior',
    appwriteId: '68f22d1500191c42d4dd'
  },
  { 
    name: 'Ousmane DIOP', 
    email: 'diopiste@yahoo.fr', 
    phone: '77 511 97 91', 
    role: 'developer', 
    dept: 'Technique', 
    pos: 'Développeur Full-Stack',
    appwriteId: '68f22d170000864c0df0'
  },
  { 
    name: 'Bafode DRAME', 
    email: 'bafode.drame@senegel.org', 
    phone: '77 650 96 68', 
    role: 'operations', 
    dept: 'Opérations', 
    pos: 'Responsable Opérations',
    appwriteId: '68f22d180022ba7569bf'
  },
  { 
    name: 'Adja Bineta Sylla FAYE', 
    email: 'adjabsf92@gmail.com', 
    phone: '77 484 55 80', 
    role: 'hr', 
    dept: 'Ressources Humaines', 
    pos: 'Assistante RH',
    appwriteId: '68f22d1a000a97b91f2b'
  },
  { 
    name: 'Oumar GNINGUE', 
    email: 'gningue04@gmail.com', 
    phone: '77 768 49 99', 
    role: 'sales', 
    dept: 'Commercial', 
    pos: 'Commercial',
    appwriteId: '68f22d1b002e0bf11958'
  }
];

function getSkills(role) {
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

function generateAvatar(name) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  const svg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="${color}"/>
    <text x="50" y="60" font-family="Arial" font-size="40" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
  </svg>`;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

async function createUserProfile(user, i) {
  try {
    console.log(`\n[${i+1}/10] Création profil: ${user.name} (${user.role})`);
    
    // Vérifier si l'utilisateur existe déjà
    const existing = await databases.listDocuments(
      DATABASE_ID,
      'users',
      [Query.equal('email', user.email)]
    );
    
    if (existing.documents.length > 0) {
      console.log(`⚠️ Profil existe déjà: ${user.name}`);
      return true;
    }
    
    const userDocument = {
      firstName: user.name.split(' ')[0],
      lastName: user.name.split(' ').slice(1).join(' '),
      email: user.email,
      phone: user.phone,
      role: user.role,
      department: user.dept,
      position: user.pos,
      isActive: true,
      skills: getSkills(user.role),
      avatar: generateAvatar(user.name),
      lastLogin: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: user.appwriteId
    };
    
    const docRes = await databases.createDocument(
      DATABASE_ID,
      'users',
      ID.unique(),
      userDocument
    );
    
    console.log(`✅ Profil créé: ${user.name} (${docRes.$id})`);
    return true;
    
  } catch (error) {
    console.log(`❌ Erreur: ${user.name} - ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('👥 CRÉATION DES PROFILS UTILISATEURS');
  console.log('===================================\n');
  
  let success = 0, errors = 0;
  
  for (let i = 0; i < users.length; i++) {
    const result = await createUserProfile(users[i], i);
    if (result) success++;
    else errors++;
    
    // Attendre entre les créations
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log(`\n🎉 TERMINÉ!`);
  console.log(`✅ ${success} profils créés | ❌ ${errors} erreurs`);
  
  console.log('\n👥 UTILISATEURS AVEC PROFILS:');
  users.forEach(u => {
    console.log(`  - ${u.name} (${u.role}) - ${u.email}`);
  });
  
  console.log('\n🔐 CONNEXION:');
  console.log('URL: http://localhost:5176');
  console.log('Mot de passe: Senegel2024!');
}

main();
