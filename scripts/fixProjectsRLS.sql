-- Script pour corriger les politiques RLS de la table projects
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

-- Créer de nouvelles politiques plus permissives pour les utilisateurs authentifiés

-- 1. Politique pour la création de projets
CREATE POLICY "Authenticated users can create projects" ON projects
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- 2. Politique pour la lecture des projets
CREATE POLICY "Authenticated users can view projects" ON projects
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- 3. Politique pour la mise à jour des projets
CREATE POLICY "Authenticated users can update projects" ON projects
  FOR UPDATE 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 4. Politique pour la suppression des projets
CREATE POLICY "Authenticated users can delete projects" ON projects
  FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Alternative plus restrictive (si vous préférez)
-- Utilisez ces politiques à la place des précédentes si vous voulez plus de sécurité

/*
-- 1. Politique pour la création de projets (plus restrictive)
CREATE POLICY "Users can create projects" ON projects
  FOR INSERT 
  WITH CHECK (
    auth.role() = 'authenticated' AND 
    (owner_id IS NULL OR auth.uid() = owner_id)
  );

-- 2. Politique pour la lecture des projets (plus restrictive)
CREATE POLICY "Users can view projects" ON projects
  FOR SELECT 
  USING (
    auth.role() = 'authenticated' AND (
      auth.uid() = owner_id OR 
      auth.uid() = ANY(team_members) OR
      owner_id IS NULL
    )
  );

-- 3. Politique pour la mise à jour des projets (plus restrictive)
CREATE POLICY "Users can update projects" ON projects
  FOR UPDATE 
  USING (
    auth.role() = 'authenticated' AND (
      auth.uid() = owner_id OR 
      auth.uid() = ANY(team_members)
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND (
      auth.uid() = owner_id OR 
      auth.uid() = ANY(team_members)
    )
  );

-- 4. Politique pour la suppression des projets (plus restrictive)
CREATE POLICY "Users can delete projects" ON projects
  FOR DELETE 
  USING (
    auth.role() = 'authenticated' AND auth.uid() = owner_id
  );
*/

-- Vérifier que les politiques ont été créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'projects'
ORDER BY policyname;
