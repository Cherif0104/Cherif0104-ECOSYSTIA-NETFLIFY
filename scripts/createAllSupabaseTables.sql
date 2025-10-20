-- Script pour créer toutes les tables Supabase nécessaires
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- 1. Table knowledge_articles
CREATE TABLE IF NOT EXISTS knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  category VARCHAR(100),
  type VARCHAR(50) DEFAULT 'article',
  status VARCHAR(20) DEFAULT 'draft',
  tags TEXT[] DEFAULT '{}',
  author VARCHAR(255),
  views INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  helpful INTEGER DEFAULT 0,
  last_viewed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table knowledge_categories
CREATE TABLE IF NOT EXISTS knowledge_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  article_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table jobs
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  type VARCHAR(50) DEFAULT 'full-time',
  posted_date DATE DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  required_skills TEXT[] DEFAULT '{}',
  applicants TEXT[] DEFAULT '{}',
  department VARCHAR(100),
  level VARCHAR(50) DEFAULT 'entry',
  salary JSONB DEFAULT '{"min": 0, "max": 0, "currency": "XOF"}',
  status VARCHAR(20) DEFAULT 'open',
  requirements TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  applications_count INTEGER DEFAULT 0,
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table job_applications
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_name VARCHAR(255) NOT NULL,
  candidate_email VARCHAR(255) NOT NULL,
  candidate_phone VARCHAR(20),
  resume TEXT,
  cover_letter TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  experience INTEGER DEFAULT 0,
  skills TEXT[] DEFAULT '{}',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table course_enrollments
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID, -- Référence vers une table courses si elle existe
  enrolled_date DATE DEFAULT CURRENT_DATE,
  progress INTEGER DEFAULT 0,
  completed_lessons TEXT[] DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'Active',
  completion_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Table courses (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  instructor VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  duration INTEGER NOT NULL, -- en minutes
  level VARCHAR(20) DEFAULT 'beginner',
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft',
  icon VARCHAR(50) DEFAULT 'fa-graduation-cap',
  progress INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  students_count INTEGER DEFAULT 0,
  lessons JSONB DEFAULT '[]',
  modules JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Table lessons (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT,
  duration INTEGER DEFAULT 0, -- en minutes
  order_index INTEGER DEFAULT 0,
  video_url TEXT,
  resources JSONB DEFAULT '[]',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_category ON knowledge_articles(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_status ON knowledge_articles(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_author ON knowledge_articles(author);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_department ON jobs(department);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);

CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON course_enrollments(status);

CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor);

CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(course_id, order_index);

-- Activer RLS (Row Level Security) sur toutes les tables
ALTER TABLE knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour knowledge_articles
CREATE POLICY "Anyone can view published articles" ON knowledge_articles
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can create articles" ON knowledge_articles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own articles" ON knowledge_articles
  FOR UPDATE USING (auth.uid()::text = author);

CREATE POLICY "Users can delete their own articles" ON knowledge_articles
  FOR DELETE USING (auth.uid()::text = author);

-- Politiques RLS pour knowledge_categories
CREATE POLICY "Anyone can view categories" ON knowledge_categories
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create categories" ON knowledge_categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update categories" ON knowledge_categories
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete categories" ON knowledge_categories
  FOR DELETE USING (auth.role() = 'authenticated');

-- Politiques RLS pour jobs
CREATE POLICY "Anyone can view open jobs" ON jobs
  FOR SELECT USING (status = 'open');

CREATE POLICY "Authenticated users can create jobs" ON jobs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update jobs" ON jobs
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete jobs" ON jobs
  FOR DELETE USING (auth.role() = 'authenticated');

-- Politiques RLS pour job_applications
CREATE POLICY "Users can view their own applications" ON job_applications
  FOR SELECT USING (auth.uid()::text = candidate_email);

CREATE POLICY "Anyone can create applications" ON job_applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own applications" ON job_applications
  FOR UPDATE USING (auth.uid()::text = candidate_email);

CREATE POLICY "Users can delete their own applications" ON job_applications
  FOR DELETE USING (auth.uid()::text = candidate_email);

-- Politiques RLS pour course_enrollments
CREATE POLICY "Users can view their own enrollments" ON course_enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own enrollments" ON course_enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enrollments" ON course_enrollments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own enrollments" ON course_enrollments
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques RLS pour courses
CREATE POLICY "Anyone can view published courses" ON courses
  FOR SELECT USING (status = 'active');

CREATE POLICY "Authenticated users can create courses" ON courses
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update courses" ON courses
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete courses" ON courses
  FOR DELETE USING (auth.role() = 'authenticated');

-- Politiques RLS pour lessons
CREATE POLICY "Anyone can view published lessons" ON lessons
  FOR SELECT USING (is_published = true);

CREATE POLICY "Authenticated users can create lessons" ON lessons
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update lessons" ON lessons
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete lessons" ON lessons
  FOR DELETE USING (auth.role() = 'authenticated');

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_knowledge_articles_updated_at BEFORE UPDATE ON knowledge_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_categories_updated_at BEFORE UPDATE ON knowledge_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON job_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_enrollments_updated_at BEFORE UPDATE ON course_enrollments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insérer quelques catégories par défaut
INSERT INTO knowledge_categories (name, description, color) VALUES
('Général', 'Articles généraux et informations de base', '#3B82F6'),
('Technique', 'Articles techniques et guides avancés', '#10B981'),
('FAQ', 'Questions fréquemment posées', '#F59E0B'),
('Tutoriels', 'Guides pas à pas', '#8B5CF6'),
('Actualités', 'Nouvelles et mises à jour', '#EF4444')
ON CONFLICT (name) DO NOTHING;

-- Insérer quelques cours par défaut
INSERT INTO courses (title, instructor, description, duration, level, category, price, status) VALUES
('Introduction à React', 'Dr. Jean Sénégal', 'Apprenez les bases de React et créez votre première application', 600, 'beginner', 'Développement Web', 50000, 'active'),
('Data Science avec Python', 'Prof. Marie Diop', 'Maîtrisez l''analyse de données avec Python et ses bibliothèques', 1200, 'intermediate', 'Data Science', 75000, 'active'),
('Design UI/UX', 'Cheikh Ndiaye', 'Créez des interfaces utilisateur modernes et intuitives', 900, 'beginner', 'Design', 60000, 'active')
ON CONFLICT DO NOTHING;

COMMIT;
