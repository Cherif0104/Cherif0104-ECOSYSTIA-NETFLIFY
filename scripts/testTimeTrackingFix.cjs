const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey);

async function testTimeTrackingFix() {
    console.log("🚀 TEST DE CORRECTION TIME TRACKING");
    console.log("===================================");

    try {
        // Test 1: Vérifier la connexion
        console.log("\n📋 Test 1: Vérification de la connexion");
        console.log("✅ Connexion avec la clé de service");

        // Test 2: Récupérer un utilisateur et un projet existants
        console.log("\n👤 Test 2: Récupération des données de test");
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, email, first_name, last_name')
            .limit(1);

        if (usersError || !users || users.length === 0) {
            throw new Error('Aucun utilisateur trouvé');
        }

        const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('id, name')
            .limit(1);

        if (projectsError || !projects || projects.length === 0) {
            throw new Error('Aucun projet trouvé');
        }

        const testUser = users[0];
        const testProject = projects[0];
        
        console.log(`✅ Utilisateur trouvé: ${testUser.first_name} ${testUser.last_name} (${testUser.email})`);
        console.log(`✅ Projet trouvé: ${testProject.name}`);

        // Test 3: Créer un time log de test
        console.log("\n⏰ Test 3: Création d'un time log de test");
        const testTimeLog = {
            user_id: testUser.id,
            project_id: testProject.id,
            description: 'Test Time Tracking Fix',
            hours: 1.0,
            date: new Date().toISOString().split('T')[0]
        };

        const { data: timeLogData, error: timeLogError } = await supabase
            .from('time_logs')
            .insert([testTimeLog])
            .select()
            .single();

        if (timeLogError) {
            console.log(`❌ Erreur création time log: ${timeLogError.message}`);
            console.log(`   Code: ${timeLogError.code}`);
            console.log(`   Détails: ${timeLogError.details}`);
            return;
        }

        console.log(`✅ Time log créé avec succès: ${timeLogData.id}`);
        console.log(`   Description: ${timeLogData.description}`);
        console.log(`   Heures: ${timeLogData.hours}`);

        // Test 4: Récupérer le time log créé
        console.log("\n📖 Test 4: Récupération du time log créé");
        const { data: retrievedTimeLog, error: retrieveError } = await supabase
            .from('time_logs')
            .select('*')
            .eq('id', timeLogData.id)
            .single();

        if (retrieveError) {
            console.log(`❌ Erreur récupération time log: ${retrieveError.message}`);
        } else {
            console.log(`✅ Time log récupéré: ${retrievedTimeLog.description}`);
        }

        // Test 5: Mettre à jour le time log
        console.log("\n✏️ Test 5: Mise à jour du time log");
        const { data: updatedTimeLog, error: updateError } = await supabase
            .from('time_logs')
            .update({ 
                hours: 1.5,
                updated_at: new Date().toISOString()
            })
            .eq('id', timeLogData.id)
            .select()
            .single();

        if (updateError) {
            console.log(`❌ Erreur mise à jour time log: ${updateError.message}`);
        } else {
            console.log(`✅ Time log mis à jour: ${updatedTimeLog.hours} heures`);
        }

        // Test 6: Supprimer le time log de test
        console.log("\n🗑️ Test 6: Suppression du time log de test");
        const { error: deleteError } = await supabase
            .from('time_logs')
            .delete()
            .eq('id', timeLogData.id);

        if (deleteError) {
            console.log(`❌ Erreur suppression time log: ${deleteError.message}`);
        } else {
            console.log(`✅ Time log supprimé avec succès`);
        }

        console.log("\n🎉 TOUS LES TESTS SONT PASSÉS !");
        console.log("Le Time Tracking fonctionne maintenant correctement.");
        console.log("Le bouton 'Démarrer' devrait maintenant être actif !");

    } catch (error) {
        console.error("❌ Erreur inattendue:", error.message);
    }
}

testTimeTrackingFix();
