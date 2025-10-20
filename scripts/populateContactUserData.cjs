const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey);

async function populateContactUserData() {
    console.log("📊 PEUPLEMENT DONNÉES UTILISATEUR CONTACT");
    console.log("==========================================\n");

    let createdIds = {
        projects: [],
        objectives: [],
        timeLogs: [],
        leaveRequests: []
    };

    try {
        // 1. Récupérer l'utilisateur CONTACT
        console.log("1️⃣ Récupération utilisateur CONTACT...");
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, first_name, last_name, email')
            .ilike('email', 'contact@senegel.org');

        if (usersError) throw usersError;
        if (!users || users.length === 0) {
            throw new Error("Utilisateur CONTACT non trouvé");
        }

        const user = users[0];
        const userId = user.id;
        console.log(`✅ Utilisateur: ${user.first_name} ${user.last_name} (${userId})\n`);

        // 2. Créer des projets
        console.log("2️⃣ Création de projets...");
        const projectsToCreate = [
            {
                name: "Migration Supabase",
                description: "Migration complète de l'application vers Supabase",
                status: "In Progress",
                priority: "High",
                start_date: "2025-10-01",
                end_date: "2025-10-31",
                owner_id: userId,
                team_members: [userId],
                tasks: [],
                risks: []
            },
            {
                name: "Amélioration Interface",
                description: "Modernisation de l'interface utilisateur",
                status: "Planning",
                priority: "Medium",
                start_date: "2025-11-01",
                end_date: "2025-12-31",
                owner_id: userId,
                team_members: [userId],
                tasks: [],
                risks: []
            }
        ];

        for (const project of projectsToCreate) {
            const { data, error } = await supabase
                .from('projects')
                .insert([project])
                .select()
                .single();

            if (error) {
                console.error(`❌ Erreur création projet ${project.name}:`, error.message);
            } else {
                createdIds.projects.push(data.id);
                console.log(`✅ Projet créé: ${project.name} (${data.id})`);
            }
        }

        // 3. Créer des objectifs
        console.log("\n3️⃣ Création d'objectifs...");
        const objectivesToCreate = [
            {
                title: "Atteindre 100% de migration",
                description: "Migrer tous les modules vers Supabase",
                status: "In Progress",
                priority: "High",
                start_date: "2025-10-01",
                end_date: "2025-10-31",
                progress: 75,
                owner_id: userId,
                owner_name: user.first_name + " " + user.last_name,
                team_members: [userId],
                category: "Technique",
                quarter: "Q4",
                year: 2025
            },
            {
                title: "Améliorer l'expérience utilisateur",
                description: "Rendre l'application plus intuitive",
                status: "Planning",
                priority: "Medium",
                start_date: "2025-11-01",
                end_date: "2025-12-31",
                progress: 20,
                owner_id: userId,
                owner_name: user.first_name + " " + user.last_name,
                team_members: [userId],
                category: "UX",
                quarter: "Q4",
                year: 2025
            }
        ];

        for (const objective of objectivesToCreate) {
            const { data, error } = await supabase
                .from('objectives')
                .insert([objective])
                .select()
                .single();

            if (error) {
                console.error(`❌ Erreur création objectif ${objective.title}:`, error.message);
            } else {
                createdIds.objectives.push(data.id);
                console.log(`✅ Objectif créé: ${objective.title} (${data.id})`);
            }
        }

        // 4. Créer des time logs (seulement si on a au moins un projet)
        if (createdIds.projects.length > 0) {
            console.log("\n4️⃣ Création de time logs...");
            const timeLogsToCreate = [
                {
                    user_id: userId,
                    project_id: createdIds.projects[0],
                    description: "Configuration Supabase",
                    date: "2025-10-15",
                    hours: 4
                },
                {
                    user_id: userId,
                    project_id: createdIds.projects[0],
                    description: "Migration des services",
                    date: "2025-10-16",
                    hours: 6
                },
                {
                    user_id: userId,
                    project_id: createdIds.projects[0],
                    description: "Tests et corrections",
                    date: "2025-10-17",
                    hours: 5
                }
            ];

            for (const timeLog of timeLogsToCreate) {
                const { data, error } = await supabase
                    .from('time_logs')
                    .insert([timeLog])
                    .select()
                    .single();

                if (error) {
                    console.error(`❌ Erreur création time log:`, error.message);
                } else {
                    createdIds.timeLogs.push(data.id);
                    console.log(`✅ Time log créé: ${timeLog.description} (${data.id})`);
                }
            }
        }

        console.log("\n🎉 PEUPLEMENT TERMINÉ !");
        console.log("✅ Données de test créées pour l'utilisateur CONTACT");
        console.log(`   - ${createdIds.projects.length} projet(s)`);
        console.log(`   - ${createdIds.objectives.length} objectif(s)`);
        console.log(`   - ${createdIds.timeLogs.length} time log(s)`);

        // 6. Vérification finale
        console.log("\n6️⃣ Vérification des données...");
        
        const { data: projects } = await supabase.from('projects').select('*');
        const { data: objectives } = await supabase.from('objectives').select('*');
        const { data: timeLogs } = await supabase.from('time_logs').select('*');
        const { data: leaveRequests } = await supabase.from('leave_requests').select('*');

        const userProjects = projects.filter(p => 
            p.owner_id === userId || 
            (p.team_members && Array.isArray(p.team_members) && p.team_members.includes(userId))
        );
        const userObjectives = objectives.filter(o => 
            o.owner_id === userId || 
            (o.team_members && Array.isArray(o.team_members) && o.team_members.includes(userId))
        );
        const userTimeLogs = timeLogs.filter(t => t.user_id === userId);
        const userLeaveRequests = leaveRequests.filter(l => l.employee_id === userId);

        console.log(`📊 Résumé pour CONTACT:`);
        console.log(`   - Projets: ${userProjects.length}`);
        console.log(`   - Objectifs: ${userObjectives.length}`);
        console.log(`   - Time logs: ${userTimeLogs.length}`);
        console.log(`   - Demandes de congé: ${userLeaveRequests.length}`);

    } catch (error) {
        console.error("❌ Erreur:", error.message || error);
    }
}

populateContactUserData();

