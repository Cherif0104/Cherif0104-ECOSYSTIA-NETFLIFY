const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

async function testProjectsInTimeTracking() {
    console.log("🔍 TEST PROJETS DANS TIME TRACKING");
    console.log("==================================\n");

    try {
        // 1. Vérifier les projets disponibles
        console.log("1️⃣ Récupération des projets...");
        const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('id, name, status')
            .order('created_at', { ascending: false });

        if (projectsError) throw projectsError;

        console.log(`✅ ${projects.length} projet(s) trouvé(s):`);
        projects.forEach((project, index) => {
            console.log(`   ${index + 1}. ${project.name} (${project.id}) - ${project.status}`);
        });

        // 2. Vérifier les time logs existants
        console.log("\n2️⃣ Récupération des time logs...");
        const { data: timeLogs, error: timeLogsError } = await supabase
            .from('time_logs')
            .select('*')
            .order('created_at', { ascending: false });

        if (timeLogsError) throw timeLogsError;

        console.log(`✅ ${timeLogs.length} time log(s) trouvé(s):`);
        timeLogs.forEach((log, index) => {
            console.log(`   ${index + 1}. ${log.task_id || 'Sans nom'} - Projet: ${log.project_id}`);
        });

        // 3. Tester la création d'un time log avec un projet existant
        if (projects.length > 0) {
            console.log("\n3️⃣ Test création time log avec projet...");
            const testProject = projects[0];
            
            const testTimeLog = {
                user_id: "00000000-0000-0000-0000-000000000000",
                project_id: testProject.id,
                description: "Test Time Tracking avec Projet", // Utiliser description pour le nom de la tâche
                date: "2024-01-15",
                hours: 4
            };

            const { data: created, error: createError } = await supabase
                .from('time_logs')
                .insert([testTimeLog])
                .select()
                .single();

            if (createError) {
                console.error("❌ Erreur création:", createError.message);
            } else {
                console.log("✅ Time log créé avec succès:");
                console.log(`   - ID: ${created.id}`);
                console.log(`   - Tâche: ${created.description}`);
                console.log(`   - Projet: ${created.project_id}`);
                console.log(`   - Durée: ${created.hours}h`);

                // Nettoyer
                await supabase
                    .from('time_logs')
                    .delete()
                    .eq('id', created.id);
                console.log("✅ Time log de test supprimé");
            }
        } else {
            console.log("⚠️ Aucun projet trouvé pour le test");
        }

        console.log("\n🎉 TEST TERMINÉ !");
        console.log("✅ Les projets sont disponibles pour Time Tracking");

    } catch (error) {
        console.error(`❌ Erreur: ${error.message}`);
        console.error("Détails:", error);
    }
}

testProjectsInTimeTracking();
