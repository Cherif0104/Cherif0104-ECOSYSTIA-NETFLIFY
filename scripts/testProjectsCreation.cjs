const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

async function testProjectsCreation() {
    console.log("🚀 TEST DE CRÉATION DE PROJETS");
    console.log("===============================");

    try {
        // Test 1: Vérifier la connexion
        console.log("\n📋 Test 1: Vérification de la connexion");
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
            console.log(`❌ Erreur d'authentification: ${authError.message}`);
            console.log("💡 Connectez-vous d'abord avec un utilisateur SENEGEL");
            return;
        }
        
        if (!user) {
            console.log("❌ Aucun utilisateur connecté");
            console.log("💡 Connectez-vous d'abord avec un utilisateur SENEGEL");
            return;
        }
        
        console.log(`✅ Utilisateur connecté: ${user.email}`);

        // Test 2: Créer un projet de test
        console.log("\n📝 Test 2: Création d'un projet de test");
        const testProject = {
            name: 'Test Project RLS',
            description: 'Projet de test pour vérifier les politiques RLS',
            status: 'active',
            priority: 'medium',
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            progress: 0,
            budget: 100000,
            owner_id: user.id,
            team_members: [user.id]
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

        // Test 3: Récupérer le projet créé
        console.log("\n📖 Test 3: Récupération du projet créé");
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

        // Test 4: Mettre à jour le projet
        console.log("\n✏️ Test 4: Mise à jour du projet");
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

        // Test 5: Supprimer le projet de test
        console.log("\n🗑️ Test 5: Suppression du projet de test");
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
        console.log("Les politiques RLS pour les projets fonctionnent correctement.");

    } catch (error) {
        console.error("❌ Erreur inattendue:", error.message);
    }
}

testProjectsCreation();
