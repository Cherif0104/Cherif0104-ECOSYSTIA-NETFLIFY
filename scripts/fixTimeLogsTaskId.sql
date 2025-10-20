-- Modifier la colonne task_id pour accepter du texte au lieu d'UUID
ALTER TABLE time_logs 
ALTER COLUMN task_id TYPE TEXT;

-- Ajouter un commentaire pour clarifier l'usage
COMMENT ON COLUMN time_logs.task_id IS 'Nom de la tâche (texte libre)';
