const fs = require('fs');
const path = require('path');

// Fonction pour corriger les imports dans un fichier
function fixAuthImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remplacer l'ancien import AuthContext par AuthContextSupabase
    const oldImport = "from '../contexts/AuthContext'";
    const newImport = "from '../contexts/AuthContextSupabase'";
    
    if (content.includes(oldImport)) {
      content = content.replace(new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newImport);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Corrigé: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Erreur avec ${filePath}:`, error.message);
    return false;
  }
}

// Fonction pour parcourir récursivement les dossiers
function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  let fixedCount = 0;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      fixedCount += walkDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      if (fixAuthImports(filePath)) {
        fixedCount++;
      }
    }
  });
  
  return fixedCount;
}

// Exécuter la correction
console.log('🔧 Correction automatique des imports AuthContext...');
const fixedCount = walkDirectory('./components');
console.log(`\n🎉 Correction terminée ! ${fixedCount} fichiers corrigés.`);
