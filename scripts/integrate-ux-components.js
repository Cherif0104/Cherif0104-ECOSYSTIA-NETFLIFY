/**
 * 🎨 SCRIPT D'INTÉGRATION UX COMPONENTS
 * Intègre automatiquement nos composants UX dans tous les modules V3
 */

const fs = require('fs');
const path = require('path');

// Liste des modules V3 à traiter
const V3_MODULES = [
  'components/FinanceUltraModernV3Standard.tsx',
  'components/LeaveManagementUltraModernV3Standard.tsx',
  'components/KnowledgeBaseUltraModernV3Standard.tsx',
  'components/DevelopmentUltraModernV3.tsx',
  'components/CoursesUltraModernV3Standard.tsx',
  'components/JobsUltraModernV3Standard.tsx',
  'components/AICoachUltraModernV3.tsx',
  'components/GenAILabUltraModernV3.tsx',
  'components/CRMSalesUltraModernV3.tsx',
  'components/CourseManagementUltraModernV3.tsx',
  'components/SettingsUltraModernV3.tsx'
];

// Imports à ajouter
const UX_IMPORTS = `import { useFeedback } from '../hooks/useFeedback';
import FeedbackDisplay from './common/FeedbackDisplay';
import LoadingButton from './common/LoadingButton';`;

// Hook à ajouter dans le composant
const UX_HOOK = `  const { 
    isSubmitting, 
    submitSuccess, 
    submitError, 
    setSubmitting, 
    setSuccess, 
    setError 
  } = useFeedback();`;

// Composant FeedbackDisplay à ajouter
const FEEDBACK_DISPLAY = `      {/* Messages de feedback */}
      <FeedbackDisplay
        success={submitSuccess}
        error={submitError}
        warning={null}
        info={null}
        onClearError={() => setError("")}
      />`;

function integrateUXComponents() {
  console.log('🎨 Intégration des composants UX dans tous les modules V3...');
  
  V3_MODULES.forEach(modulePath => {
    if (fs.existsSync(modulePath)) {
      console.log(`📝 Traitement de ${modulePath}...`);
      
      let content = fs.readFileSync(modulePath, 'utf8');
      
      // 1. Ajouter les imports UX
      if (!content.includes('useFeedback')) {
        const importMatch = content.match(/import.*from.*@heroicons\/react\/24\/outline.*;/);
        if (importMatch) {
          const insertIndex = importMatch.index + importMatch[0].length;
          content = content.slice(0, insertIndex) + '\n' + UX_IMPORTS + content.slice(insertIndex);
        }
      }
      
      // 2. Ajouter le hook useFeedback
      if (!content.includes('useFeedback()')) {
        const componentMatch = content.match(/const.*React\.FC.*=.*\(\) => \{/);
        if (componentMatch) {
          const insertIndex = componentMatch.index + componentMatch[0].length;
          content = content.slice(0, insertIndex) + '\n' + UX_HOOK + content.slice(insertIndex);
        }
      }
      
      // 3. Ajouter FeedbackDisplay après le header
      if (!content.includes('FeedbackDisplay')) {
        const headerMatch = content.match(/<\/div>\s*{/\s*\/\* Filtres/);
        if (headerMatch) {
          const insertIndex = headerMatch.index;
          content = content.slice(0, insertIndex) + '\n' + FEEDBACK_DISPLAY + '\n' + content.slice(insertIndex);
        }
      }
      
      // Sauvegarder le fichier modifié
      fs.writeFileSync(modulePath, content);
      console.log(`✅ ${modulePath} mis à jour`);
    } else {
      console.log(`⚠️ ${modulePath} non trouvé`);
    }
  });
  
  console.log('🎉 Intégration UX terminée !');
}

// Exécuter le script
integrateUXComponents();
