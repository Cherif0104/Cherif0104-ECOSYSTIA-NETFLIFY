-- Créer la table leave_requests pour le module Leave Management
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL CHECK (leave_type IN ('vacation', 'sick', 'personal', 'maternity', 'paternity', 'other')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    days_requested INTEGER NOT NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index sur employee_id pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON leave_requests(employee_id);

-- Créer un index sur status pour le filtrage
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);

-- Créer un index sur les dates pour les requêtes de période
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(start_date, end_date);

-- Activer RLS (Row Level Security)
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

-- Politique RLS : Les utilisateurs peuvent voir leurs propres demandes
CREATE POLICY "Users can view their own leave requests" ON leave_requests
    FOR SELECT USING (auth.uid() = employee_id);

-- Politique RLS : Les utilisateurs peuvent créer leurs propres demandes
CREATE POLICY "Users can create their own leave requests" ON leave_requests
    FOR INSERT WITH CHECK (auth.uid() = employee_id);

-- Politique RLS : Les utilisateurs peuvent modifier leurs propres demandes (si en attente)
CREATE POLICY "Users can update their own pending leave requests" ON leave_requests
    FOR UPDATE USING (auth.uid() = employee_id AND status = 'pending');

-- Politique RLS : Les utilisateurs peuvent supprimer leurs propres demandes (si en attente)
CREATE POLICY "Users can delete their own pending leave requests" ON leave_requests
    FOR DELETE USING (auth.uid() = employee_id AND status = 'pending');

-- Politique RLS : Les managers peuvent voir toutes les demandes
CREATE POLICY "Managers can view all leave requests" ON leave_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('manager', 'admin', 'super_admin')
        )
    );

-- Politique RLS : Les managers peuvent approuver/rejeter les demandes
CREATE POLICY "Managers can approve/reject leave requests" ON leave_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('manager', 'admin', 'super_admin')
        )
    );

-- Commentaires sur la table
COMMENT ON TABLE leave_requests IS 'Table des demandes de congés et absences';
COMMENT ON COLUMN leave_requests.employee_id IS 'ID de l''employé qui fait la demande';
COMMENT ON COLUMN leave_requests.leave_type IS 'Type de congé (vacation, sick, personal, etc.)';
COMMENT ON COLUMN leave_requests.start_date IS 'Date de début du congé';
COMMENT ON COLUMN leave_requests.end_date IS 'Date de fin du congé';
COMMENT ON COLUMN leave_requests.reason IS 'Motif du congé';
COMMENT ON COLUMN leave_requests.status IS 'Statut de la demande (pending, approved, rejected)';
COMMENT ON COLUMN leave_requests.days_requested IS 'Nombre de jours demandés';
COMMENT ON COLUMN leave_requests.approved_by IS 'ID de la personne qui a approuvé/rejeté';
COMMENT ON COLUMN leave_requests.comments IS 'Commentaires de l''approbateur';
