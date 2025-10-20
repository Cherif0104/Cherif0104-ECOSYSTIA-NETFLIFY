const fs = require('fs');
const path = require('path');

// Fonction pour remplacer les avatars dans un fichier
function replaceAvatarsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Remplacer les imports si nécessaire
    if (content.includes('src={') && content.includes('avatar') && !content.includes('import Avatar')) {
      // Trouver la ligne d'import React
      const reactImportMatch = content.match(/import React[^;]+;/);
      if (reactImportMatch) {
        const importLine = reactImportMatch[0];
        if (!importLine.includes('Avatar')) {
          content = content.replace(
            importLine,
            importLine + '\nimport Avatar from \'./common/Avatar\';'
          );
          modified = true;
        }
      }
    }

    // Remplacer les images d'avatar par le composant Avatar
    const avatarPatterns = [
      // Pattern 1: img avec src={user.avatar}
      {
        pattern: /<img\s+src=\{([^}]+)\.avatar\}\s+alt=\{([^}]+)\}\s+className="([^"]+)"/g,
        replacement: '<Avatar user={$1} size="md" className="$3"'
      },
      // Pattern 2: img avec src={user.avatar} et alt simple
      {
        pattern: /<img\s+src=\{([^}]+)\.avatar\}\s+alt="([^"]+)"\s+className="([^"]+)"/g,
        replacement: '<Avatar user={$1} size="md" className="$3"'
      },
      // Pattern 3: img avec src={user.avatar || '/default-avatar.png'}
      {
        pattern: /<img\s+src=\{([^}]+)\.avatar\s*\|\|\s*'[^']+'\}\s+alt=\{([^}]+)\}\s+className="([^"]+)"/g,
        replacement: '<Avatar user={$1} size="md" className="$3"'
      }
    ];

    avatarPatterns.forEach(({ pattern, replacement }) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Mis à jour: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Erreur avec ${filePath}:`, error.message);
    return false;
  }
}

// Fonction pour parcourir récursivement les dossiers
function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  let updatedFiles = 0;

  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      updatedFiles += processDirectory(fullPath);
    } else if (stat.isFile() && item.endsWith('.tsx')) {
      if (replaceAvatarsInFile(fullPath)) {
        updatedFiles++;
      }
    }
  });

  return updatedFiles;
}

// Traitement principal
console.log('🔄 Remplacement automatique des avatars...');
const componentsDir = path.join(__dirname, 'components');
const updatedFiles = processDirectory(componentsDir);

console.log(`\n🎉 Traitement terminé !`);
console.log(`📊 Fichiers mis à jour: ${updatedFiles}`);

if (updatedFiles === 0) {
  console.log('ℹ️  Aucun fichier nécessitant une mise à jour trouvé.');
} else {
  console.log('\n📋 Fichiers traités:');
  console.log('   - Tous les composants .tsx dans le dossier components/');
  console.log('   - Remplacement des <img src={user.avatar}> par <Avatar user={user} />');
  console.log('   - Ajout automatique des imports nécessaires');
}
