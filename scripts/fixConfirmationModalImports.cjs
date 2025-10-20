const fs = require('fs');
const path = require('path');

console.log('🔧 Correction des imports ConfirmationModal...');

// Rechercher tous les fichiers .tsx
function findTsxFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...findTsxFiles(fullPath));
    } else if (item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

const tsxFiles = findTsxFiles(process.cwd());
let fixedFiles = 0;

tsxFiles.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Corriger les imports incorrects
    const incorrectImport = /import\s+ConfirmationModal\s+from\s+['"]\.\/modals\/ConfirmationModal['"];?/g;
    const correctImport = "import ConfirmationModal from './common/ConfirmationModal';";
    
    if (incorrectImport.test(content)) {
      content = content.replace(incorrectImport, correctImport);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Corrigé: ${path.relative(process.cwd(), filePath)}`);
      fixedFiles++;
    }
  } catch (error) {
    console.error(`❌ Erreur traitement ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 Correction terminée !`);
console.log(`📁 Fichiers corrigés: ${fixedFiles}`);
