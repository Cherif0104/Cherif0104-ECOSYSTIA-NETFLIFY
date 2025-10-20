const { Client, Account, Databases, ID } = require('appwrite');

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('68ee2dc2001f0f499c02');

const account = new Account(client);
const databases = new Databases(client);
const DATABASE_ID = '68ee527d002813e4e0ca';

const users = [
  { name: 'Marieme BADIANE', email: 'Mariemebl3@gmail.com', phone: '77 926 24 77', role: 'hr', dept: 'RH', pos: 'Responsable RH' },
  { name: 'Rokhaya BODIAN', email: 'rokhaya@senegel.org', phone: '77 520 32 78', role: 'manager', dept: 'Direction', pos: 'Directrice Générale' },
  { name: 'Amy DIAGNE', email: 'Nabyaminatoul08@gmail.com', phone: '77 905 14 87', role: 'analyst', dept: 'Analyse', pos: 'Analyste' },
  { name: 'Awa DIAGNE', email: 'awadiagne1003@gmail.com', phone: '77 453 44 76', role: 'finance', dept: 'Finance', pos: 'Comptable' },
  { name: 'Adja Mame Sarr DIALLO', email: 'adjadiallo598@gmail.com', phone: '77 477 39 39', role: 'sales', dept: 'Commercial', pos: 'Responsable Commercial' },
  { name: 'Mouhamadou Lamine DIASSE', email: 'mdiasse26@gmail.com', phone: '77 194 87 25', role: 'developer', dept: 'Technique', pos: 'Développeur Senior' },
  { name: 'Ousmane DIOP', email: 'diopiste@yahoo.fr', phone: '77 511 97 91', role: 'developer', dept: 'Technique', pos: 'Développeur Full-Stack' },
  { name: 'Bafode DRAME', email: 'bafode.drame@senegel.org', phone: '77 650 96 68', role: 'operations', dept: 'Opérations', pos: 'Responsable Opérations' },
  { name: 'Adja Bineta Sylla FAYE', email: 'adjabsf92@gmail.com', phone: '77 484 55 80', role: 'hr', dept: 'RH', pos: 'Assistante RH' },
  { name: 'Oumar GNINGUE', email: 'gningue04@gmail.com', phone: '77 768 49 99', role: 'sales', dept: 'Commercial', pos: 'Commercial' },
  { name: 'Mariame Diouldé GUINDO', email: 'onevisionbmca@gmail.com', phone: '77 564 44 40', role: 'marketing', dept: 'Marketing', pos: 'Responsable Marketing' },
  { name: 'Rokhaya KEBE', email: 'rokhayakebe23@gmail.com', phone: '76 194 72 04', role: 'support', dept: 'Support', pos: 'Support Client' },
  { name: 'Amadou Dia LY', email: 'lyamadoudia@gmail.com', phone: '+1 (971) 270-8619', role: 'manager', dept: 'Direction', pos: 'Manager International' },
  { name: 'Cheikh Mohamed NDIAYE', email: 'Wowastudios@gmail.com', phone: '77 283 55 14', role: 'designer', dept: 'Design', pos: 'Designer UI/UX' },
  { name: 'Charles NYAFOUNA', email: 'cnyafouna@gmail.com', phone: '+44 7545 341935', role: 'manager', dept: 'Direction', pos: 'Manager Stratégique' },
  { name: 'Alioune Badara Pape SAMB', email: 'pape@senegel.org', phone: '+1 (202) 557-4901', role: 'administrator', dept: 'Direction', pos: 'Administrateur Principal' },
  { name: 'Rokhaya SAMB', email: 'sambrokhy700@gmail.com', phone: '77 286 33 12', role: 'content', dept: 'Communication', pos: 'Responsable Contenu' },
  { name: 'Adama Mandaw SENE', email: 'adamasene.fa@gmail.com', phone: '77 705 32 51', role: 'tester', dept: 'Qualité', pos: 'Testeur QA' },
  { name: 'CONTACT SENEGEL', email: 'contact@senegel.org', phone: '77 853 33 99', role: 'super_administrator', dept: 'Direction', pos: 'Super Administrateur' }
];

const password = 'Senegel2024!';

async function createUser(user, i) {
  try {
    console.log(`\n[${i+1}/19] ${user.name} (${user.role})`);
    
    if (i > 0) {
      await new Promise(r => setTimeout(r, 3000));
    }
    
    const accountRes = await account.create(ID.unique(), user.email, password, user.name);
    console.log(`✅ Compte: ${user.email}`);
    
    await new Promise(r => setTimeout(r, 1000));
    
    const userDoc = {
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
      ownerId: accountRes.$id
    };
    
    const docRes = await databases.createDocument(DATABASE_ID, 'users', ID.unique(), userDoc);
    console.log(`✅ Profil: ${user.name}`);
    return true;
    
  } catch (error) {
    if (error.code === 409) {
      console.log(`⚠️ Existe: ${user.name}`);
      return true;
    } else if (error.message.includes('Rate limit')) {
      console.log(`⏳ Rate limit - Attente 30s...`);
      await new Promise(r => setTimeout(r, 30000));
      return await createUser(user, i);
    } else {
      console.log(`❌ Erreur: ${user.name} - ${error.message}`);
      return false;
    }
  }
}

function getSkills(role) {
  const skills = {
    'super_administrator': ['Administration', 'Sécurité', 'Gestion'],
    'administrator': ['Administration', 'Gestion', 'Sécurité'],
    'manager': ['Gestion', 'Leadership', 'Planification'],
    'developer': ['Développement', 'Programmation', 'Architecture'],
    'designer': ['Design', 'UI/UX', 'Créativité'],
    'analyst': ['Analyse', 'Données', 'Reporting'],
    'tester': ['Test', 'Qualité', 'Validation'],
    'hr': ['RH', 'Gestion', 'Recrutement'],
    'finance': ['Finance', 'Comptabilité', 'Analyse'],
    'sales': ['Vente', 'Commercial', 'Négociation'],
    'marketing': ['Marketing', 'Communication', 'Stratégie'],
    'support': ['Support', 'Assistance', 'Communication'],
    'operations': ['Opérations', 'Gestion', 'Optimisation'],
    'content': ['Contenu', 'Rédaction', 'Communication']
  };
  return skills[role] || ['Général'];
}

function generateAvatar(name) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  const svg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="${color}"/>
    <text x="50" y="60" font-family="Arial" font-size="40" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
  </svg>`;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

async function main() {
  console.log('🚀 CRÉATION DES 19 UTILISATEURS SENEGEL');
  console.log('======================================\n');
  
  let success = 0, errors = 0;
  
  for (let i = 0; i < users.length; i++) {
    const result = await createUser(users[i], i);
    if (result) success++;
    else errors++;
  }
  
  console.log(`\n🎉 TERMINÉ!`);
  console.log(`✅ ${success} succès | ❌ ${errors} erreurs`);
  
  console.log('\n👥 UTILISATEURS CRÉÉS:');
  users.forEach(u => {
    console.log(`  - ${u.name} (${u.role}) - ${u.email}`);
  });
  
  console.log('\n🔐 CONNEXION:');
  console.log('URL: http://localhost:5176');
  console.log('Mot de passe: Senegel2024!');
  console.log('\n📧 Support: contact@senegel.org');
  console.log('📞 Téléphone: 77 853 33 99');
}

main();
