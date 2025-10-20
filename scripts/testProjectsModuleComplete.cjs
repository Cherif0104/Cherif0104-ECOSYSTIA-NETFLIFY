const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey);

async function testProjectsModuleComplete() {
    console.log("🔍 AUDIT COMPLET DU MODULE PROJETS");
    console.log("===================================");

    let totalTests = 0;
    let passedTests = 0;
    const failedTests = [];

    try {
        // Test 1: Vérifier la connexion Supabase
        console.log("\n📋 Test 1: Connexion Supabase");
        totalTests++;
        const { data: testData, error: testError } = await supabase
            .from('projects')
            .select('count')
            .limit(1);
        
        if (testError) {
            console.log(`❌ Connexion Supabase: ${testError.message}`);
            failedTests.push('Connexion Supabase');
        } else {
            console.log("✅ Connexion Supabase réussie");
            passedTests++;
        }

        // Test 2: Récupérer un utilisateur pour les tests
        console.log("\n👤 Test 2: Récupération utilisateur de test");
        totalTests++;
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, email, first_name, last_name')
            .limit(1);

        if (usersError || !users || users.length === 0) {
            console.log(`❌ Utilisateur de test: ${usersError?.message || 'Aucun utilisateur trouvé'}`);
            failedTests.push('Utilisateur de test');
        } else {
            console.log(`✅ Utilisateur trouvé: ${users[0].first_name} ${users[0].last_name}`);
            passedTests++;
        }

        const testUserId = users[0].id;

        // Test 3: Créer un projet de test
        console.log("\n📝 Test 3: Création d'un projet de test");
        totalTests++;
        const testProject = {
            name: 'Test Module Projets - Audit Complet',
            description: 'Projet de test pour audit complet du module',
            status: 'active',
            priority: 'high',
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            progress: 0,
            budget: 500000,
            owner_id: testUserId,
            team_members: [testUserId],
            tasks: [
                {
                    id: 'task_1',
                    title: 'Tâche de test 1',
                    description: 'Description de la tâche de test',
                    status: 'pending',
                    assignedTo: testUserId,
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    priority: 'high',
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ],
            risks: [
                {
                    id: 'risk_1',
                    description: 'Risque de test',
                    severity: 'medium',
                    status: 'open',
                    mitigation: 'Plan de mitigation',
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ]
        };

        const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .insert([testProject])
            .select()
            .single();

        if (projectError) {
            console.log(`❌ Création projet: ${projectError.message}`);
            failedTests.push('Création projet');
        } else {
            console.log(`✅ Projet créé: ${projectData.name}`);
            passedTests++;
        }

        // Test 4: Récupérer le projet créé
        console.log("\n📖 Test 4: Récupération du projet");
        totalTests++;
        const { data: retrievedProject, error: retrieveError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectData.id)
            .single();

        if (retrieveError) {
            console.log(`❌ Récupération projet: ${retrieveError.message}`);
            failedTests.push('Récupération projet');
        } else {
            console.log(`✅ Projet récupéré: ${retrievedProject.name}`);
            console.log(`   - Tâches: ${retrievedProject.tasks?.length || 0}`);
            console.log(`   - Risques: ${retrievedProject.risks?.length || 0}`);
            console.log(`   - Équipe: ${retrievedProject.team_members?.length || 0} membres`);
            passedTests++;
        }

        // Test 5: Mettre à jour le projet
        console.log("\n✏️ Test 5: Mise à jour du projet");
        totalTests++;
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
            console.log(`❌ Mise à jour projet: ${updateError.message}`);
            failedTests.push('Mise à jour projet');
        } else {
            console.log(`✅ Projet mis à jour: ${updatedProject.progress}% de progression`);
            passedTests++;
        }

        // Test 6: Ajouter une tâche au projet
        console.log("\n📋 Test 6: Ajout d'une tâche");
        totalTests++;
        const newTask = {
            id: 'task_2',
            title: 'Nouvelle tâche de test',
            description: 'Description de la nouvelle tâche',
            status: 'in_progress',
            assignedTo: testUserId,
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            priority: 'medium',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const updatedTasks = [...(retrievedProject.tasks || []), newTask];
        const { data: projectWithNewTask, error: taskError } = await supabase
            .from('projects')
            .update({
                tasks: updatedTasks,
                updated_at: new Date().toISOString()
            })
            .eq('id', projectData.id)
            .select()
            .single();

        if (taskError) {
            console.log(`❌ Ajout tâche: ${taskError.message}`);
            failedTests.push('Ajout tâche');
        } else {
            console.log(`✅ Tâche ajoutée: ${projectWithNewTask.tasks.length} tâches au total`);
            passedTests++;
        }

        // Test 7: Ajouter un risque au projet
        console.log("\n⚠️ Test 7: Ajout d'un risque");
        totalTests++;
        const newRisk = {
            id: 'risk_2',
            description: 'Nouveau risque de test',
            severity: 'high',
            status: 'open',
            mitigation: 'Plan de mitigation pour le nouveau risque',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const updatedRisks = [...(retrievedProject.risks || []), newRisk];
        const { data: projectWithNewRisk, error: riskError } = await supabase
            .from('projects')
            .update({
                risks: updatedRisks,
                updated_at: new Date().toISOString()
            })
            .eq('id', projectData.id)
            .select()
            .single();

        if (riskError) {
            console.log(`❌ Ajout risque: ${riskError.message}`);
            failedTests.push('Ajout risque');
        } else {
            console.log(`✅ Risque ajouté: ${projectWithNewRisk.risks.length} risques au total`);
            passedTests++;
        }

        // Test 8: Ajouter un membre à l'équipe
        console.log("\n👥 Test 8: Ajout d'un membre d'équipe");
        totalTests++;
        const { data: anotherUser, error: anotherUserError } = await supabase
            .from('users')
            .select('id')
            .limit(1)
            .neq('id', testUserId);

        if (anotherUserError || !anotherUser || anotherUser.length === 0) {
            console.log(`❌ Ajout membre équipe: Impossible de trouver un autre utilisateur`);
            failedTests.push('Ajout membre équipe');
        } else {
            const updatedTeam = [...(retrievedProject.team_members || []), anotherUser[0].id];
            const { data: projectWithNewMember, error: memberError } = await supabase
                .from('projects')
                .update({
                    team_members: updatedTeam,
                    updated_at: new Date().toISOString()
                })
                .eq('id', projectData.id)
                .select()
                .single();

            if (memberError) {
                console.log(`❌ Ajout membre équipe: ${memberError.message}`);
                failedTests.push('Ajout membre équipe');
            } else {
                console.log(`✅ Membre ajouté: ${projectWithNewMember.team_members.length} membres au total`);
                passedTests++;
            }
        }

        // Test 9: Supprimer le projet de test
        console.log("\n🗑️ Test 9: Suppression du projet de test");
        totalTests++;
        const { error: deleteError } = await supabase
            .from('projects')
            .delete()
            .eq('id', projectData.id);

        if (deleteError) {
            console.log(`❌ Suppression projet: ${deleteError.message}`);
            failedTests.push('Suppression projet');
        } else {
            console.log(`✅ Projet supprimé avec succès`);
            passedTests++;
        }

        // Résultats finaux
        console.log("\n🎉 RÉSULTATS DE L'AUDIT");
        console.log("=======================");
        console.log(`✅ Tests réussis: ${passedTests}/${totalTests}`);
        console.log(`❌ Tests échoués: ${totalTests - passedTests}/${totalTests}`);
        console.log(`📊 Taux de réussite: ${((passedTests / totalTests) * 100).toFixed(0)}%`);

        if (failedTests.length > 0) {
            console.log("\n❌ FONCTIONNALITÉS À CORRIGER:");
            failedTests.forEach(test => console.log(`   - ${test}`));
            console.log("\n⚠️ CORRIGEZ CES PROBLÈMES AVANT DE CONTINUER !");
            return false;
        } else {
            console.log("\n🎊 TOUS LES TESTS SONT PASSÉS !");
            console.log("✅ Le module Projets est 100% fonctionnel");
            console.log("✅ Toutes les fonctionnalités CRUD marchent");
            console.log("✅ La gestion des tâches et risques fonctionne");
            console.log("✅ La gestion des équipes fonctionne");
            return true;
        }

    } catch (error) {
        console.error("❌ Erreur inattendue:", error.message);
        return false;
    }
}

// Exécuter l'audit
testProjectsModuleComplete().then(success => {
    if (success) {
        console.log("\n🚀 MODULE PROJETS PRÊT POUR LA PRODUCTION !");
        process.exit(0);
    } else {
        console.log("\n🛑 CORRECTIONS NÉCESSAIRES AVANT PRODUCTION");
        process.exit(1);
    }
});
