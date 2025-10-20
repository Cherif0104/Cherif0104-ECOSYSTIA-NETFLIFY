const fs = require('fs');
const path = require('path');

console.log('🧹 Nettoyage des références Appwrite...');

// Fichiers à nettoyer
const filesToClean = [
  'components/ProjectsUltraModernV2Old.tsx',
  'components/ProjectsAppwrite.tsx',
  'components/TimeTrackingAppwrite.tsx',
  'components/GoalsAppwrite.tsx',
  'components/CRMAppwrite.tsx',
  'components/ProjectsUltraModernV2Production.tsx',
  'components/KnowledgeBaseUltraModernV2.tsx',
  'components/JobsUltraModernV2.tsx',
  'components/DevelopmentUltraModernV2.tsx'
];

// Remplacer les références Appwrite par Supabase
const replacements = [
  { from: /Appwrite/gi, to: 'Supabase' },
  { from: /appwrite/gi, to: 'supabase' },
  { from: /depuis Appwrite/gi, to: 'depuis Supabase' },
  { from: /chargés depuis Appwrite/gi, to: 'chargés depuis Supabase' },
  { from: /sauvegardé dans Appwrite/gi, to: 'sauvegardé dans Supabase' },
  { from: /mis à jour dans Appwrite/gi, to: 'mis à jour dans Supabase' },
  { from: /supprimé de Appwrite/gi, to: 'supprimé de Supabase' },
  { from: /connexion Appwrite/gi, to: 'connexion Supabase' },
  { from: /Session Appwrite/gi, to: 'Session Supabase' },
  { from: /Connexion Appwrite/gi, to: 'Connexion Supabase' },
  { from: /Appwrite non connecté/gi, to: 'Supabase non connecté' },
  { from: /données Appwrite/gi, to: 'données Supabase' },
  { from: /Erreur chargement données Appwrite/gi, to: 'Erreur chargement données Supabase' },
  { from: /En production, ces données viendraient d'Appwrite/gi, to: 'En production, ces données viendraient de Supabase' }
];

let cleanedFiles = 0;
let totalReplacements = 0;

filesToClean.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (fs.existsSync(fullPath)) {
    try {
      let content = fs.readFileSync(fullPath, 'utf8');
      let fileReplacements = 0;
      
      replacements.forEach(({ from, to }) => {
        const matches = content.match(from);
        if (matches) {
          content = content.replace(from, to);
          fileReplacements += matches.length;
        }
      });
      
      if (fileReplacements > 0) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ ${filePath}: ${fileReplacements} remplacements`);
        cleanedFiles++;
        totalReplacements += fileReplacements;
      } else {
        console.log(`ℹ️ ${filePath}: Aucun remplacement nécessaire`);
      }
    } catch (error) {
      console.error(`❌ Erreur traitement ${filePath}:`, error.message);
    }
  } else {
    console.log(`⚠️ Fichier non trouvé: ${filePath}`);
  }
});

console.log(`\n🎉 Nettoyage terminé !`);
console.log(`📁 Fichiers traités: ${cleanedFiles}`);
console.log(`🔄 Total remplacements: ${totalReplacements}`);
