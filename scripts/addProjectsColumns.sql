-- Ajouter les colonnes manquantes à la table projects
-- =====================================================

-- Ajouter la colonne tasks (JSONB pour stocker les tâches)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS tasks JSONB DEFAULT '[]'::jsonb;

-- Ajouter la colonne risks (JSONB pour stocker les risques)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS risks JSONB DEFAULT '[]'::jsonb;

-- Ajouter des commentaires pour documenter les colonnes
COMMENT ON COLUMN projects.tasks IS 'Array of task objects stored as JSONB';
COMMENT ON COLUMN projects.risks IS 'Array of risk objects stored as JSONB';

-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND column_name IN ('tasks', 'risks')
ORDER BY ordinal_position;
