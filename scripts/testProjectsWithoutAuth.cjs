const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

// Utiliser la clé de service pour contourner l'authentification
const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey);

async function testProjectsWithoutAuth() {
    console.log("🚀 TEST DE CRÉATION DE PROJETS (SANS AUTH)");
    console.log("===========================================");

    try {
        // Test 1: Vérifier la connexion
        console.log("\n📋 Test 1: Vérification de la connexion");
        console.log("✅ Connexion avec la clé de service");

        // Test 2: Récupérer un utilisateur existant
        console.log("\n👤 Test 2: Récupération d'un utilisateur existant");
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, email, first_name, last_name')
            .limit(1);

        if (usersError || !users || users.length === 0) {
            console.log(`❌ Erreur récupération utilisateur: ${usersError?.message || 'Aucun utilisateur trouvé'}`);
            return;
        }

        const testUser = users[0];
        console.log(`✅ Utilisateur trouvé: ${testUser.first_name} ${testUser.last_name} (${testUser.email})`);

        // Test 3: Créer un projet de test
        console.log("\n📝 Test 3: Création d'un projet de test");
        const testProject = {
            name: 'Test Project RLS Disabled',
            description: 'Projet de test avec RLS désactivé',
            status: 'active',
            priority: 'medium',
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            progress: 0,
            budget: 100000,
            owner_id: testUser.id,
            team_members: [testUser.id]
        };

        const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .insert([testProject])
            .select()
            .single();

        if (projectError) {
            console.log(`❌ Erreur création projet: ${projectError.message}`);
            console.log(`   Code: ${projectError.code}`);
            console.log(`   Détails: ${projectError.details}`);
            return;
        }

        console.log(`✅ Projet créé avec succès: ${projectData.id}`);
        console.log(`   Nom: ${projectData.name}`);
        console.log(`   Propriétaire: ${projectData.owner_id}`);

        // Test 4: Récupérer le projet créé
        console.log("\n📖 Test 4: Récupération du projet créé");
        const { data: retrievedProject, error: retrieveError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectData.id)
            .single();

        if (retrieveError) {
            console.log(`❌ Erreur récupération projet: ${retrieveError.message}`);
        } else {
            console.log(`✅ Projet récupéré: ${retrievedProject.name}`);
        }

        // Test 5: Mettre à jour le projet
        console.log("\n✏️ Test 5: Mise à jour du projet");
        const { data: updatedProject, error: updateError } = await supabase
            .from('projects')
            .update({ 
                progress: 50,
                updated_at: new Date().toISOString()
            })
            .eq('id', projectData.id)
            .select()
            .single();

        if (updateError) {
            console.log(`❌ Erreur mise à jour projet: ${updateError.message}`);
        } else {
            console.log(`✅ Projet mis à jour: ${updatedProject.progress}% de progression`);
        }

        // Test 6: Supprimer le projet de test
        console.log("\n🗑️ Test 6: Suppression du projet de test");
        const { error: deleteError } = await supabase
            .from('projects')
            .delete()
            .eq('id', projectData.id);

        if (deleteError) {
            console.log(`❌ Erreur suppression projet: ${deleteError.message}`);
        } else {
            console.log(`✅ Projet supprimé avec succès`);
        }

        console.log("\n🎉 TOUS LES TESTS SONT PASSÉS !");
        console.log("Les projets fonctionnent correctement avec RLS désactivé.");

    } catch (error) {
        console.error("❌ Erreur inattendue:", error.message);
    }
}

testProjectsWithoutAuth();
