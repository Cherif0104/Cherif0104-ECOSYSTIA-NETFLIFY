const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey);

async function populateUserData() {
    console.log("📊 PEUPLEMENT DONNÉES UTILISATEUR");
    console.log("=================================\n");

    try {
        // 1. Récupérer un utilisateur
        console.log("1️⃣ Récupération d'un utilisateur...");
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, first_name, last_name')
            .limit(1);

        if (usersError || !users || users.length === 0) {
            console.error("❌ Aucun utilisateur trouvé");
            return;
        }

        const testUser = users[0];
        console.log(`✅ Utilisateur: ${testUser.first_name} ${testUser.last_name} (${testUser.id})`);

        // 2. Créer un projet pour l'utilisateur
        console.log("\n2️⃣ Création d'un projet...");
        const testProject = {
            name: `Projet Test - ${testUser.first_name}`,
            description: 'Projet de test pour vérifier l\'isolation',
            status: 'active',
            priority: 'high',
            owner_id: testUser.id,
            team_members: [testUser.id],
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            budget: 50000
        };

        const { data: createdProject, error: projectError } = await supabase
            .from('projects')
            .insert([testProject])
            .select()
            .single();

        if (projectError) {
            console.error("❌ Erreur création projet:", projectError.message);
        } else {
            console.log("✅ Projet créé:", createdProject.id);
        }

        // 3. Créer un objectif pour l'utilisateur
        console.log("\n3️⃣ Création d'un objectif...");
        const testObjective = {
            title: `Objectif Test - ${testUser.first_name}`,
            description: 'Objectif de test pour vérifier l\'isolation',
            status: 'In Progress',
            priority: 'High',
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            progress: 25,
            owner_id: testUser.id,
            team_members: [testUser.id],
            category: 'Test',
            owner_name: `${testUser.first_name} ${testUser.last_name}`,
            quarter: 'Q1',
            year: 2024
        };

        const { data: createdObjective, error: objectiveError } = await supabase
            .from('objectives')
            .insert([testObjective])
            .select()
            .single();

        if (objectiveError) {
            console.error("❌ Erreur création objectif:", objectiveError.message);
        } else {
            console.log("✅ Objectif créé:", createdObjective.id);
        }

        // 4. Créer un time log pour l'utilisateur
        console.log("\n4️⃣ Création d'un time log...");
        const testTimeLog = {
            user_id: testUser.id,
            project_id: createdProject?.id || '00000000-0000-0000-0000-000000000000',
            description: 'Tâche de test',
            date: '2024-01-15',
            hours: 8
        };

        const { data: createdTimeLog, error: timeLogError } = await supabase
            .from('time_logs')
            .insert([testTimeLog])
            .select()
            .single();

        if (timeLogError) {
            console.error("❌ Erreur création time log:", timeLogError.message);
        } else {
            console.log("✅ Time log créé:", createdTimeLog.id);
        }

        // 5. Créer une demande de congé pour l'utilisateur
        console.log("\n5️⃣ Création d'une demande de congé...");
        const testLeaveRequest = {
            employee_id: testUser.id,
            leave_type: 'vacation',
            start_date: '2024-02-01',
            end_date: '2024-02-05',
            days_requested: 5,
            reason: 'Vacances de test',
            status: 'pending'
        };

        const { data: createdLeaveRequest, error: leaveError } = await supabase
            .from('leave_requests')
            .insert([testLeaveRequest])
            .select()
            .single();

        if (leaveError) {
            console.error("❌ Erreur création demande de congé:", leaveError.message);
        } else {
            console.log("✅ Demande de congé créée:", createdLeaveRequest.id);
        }

        console.log("\n🎉 PEUPLEMENT TERMINÉ !");
        console.log("✅ Données de test créées pour l'utilisateur");
        console.log("✅ L'isolation devrait maintenant fonctionner");

        // 6. Vérifier les données créées
        console.log("\n6️⃣ Vérification des données...");
        
        const { data: userProjects } = await supabase
            .from('projects')
            .select('*')
            .eq('owner_id', testUser.id);
        
        const { data: userObjectives } = await supabase
            .from('objectives')
            .select('*')
            .eq('owner_id', testUser.id);
        
        const { data: userTimeLogs } = await supabase
            .from('time_logs')
            .select('*')
            .eq('user_id', testUser.id);
        
        const { data: userLeaveRequests } = await supabase
            .from('leave_requests')
            .select('*')
            .eq('employee_id', testUser.id);

        console.log(`📊 Résumé pour ${testUser.first_name}:`);
        console.log(`   - Projets: ${userProjects?.length || 0}`);
        console.log(`   - Objectifs: ${userObjectives?.length || 0}`);
        console.log(`   - Time logs: ${userTimeLogs?.length || 0}`);
        console.log(`   - Demandes de congé: ${userLeaveRequests?.length || 0}`);

    } catch (error) {
        console.error(`❌ Erreur: ${error.message}`);
        console.error("Détails:", error);
    }
}

populateUserData();
