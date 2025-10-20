const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey);

async function testAllModulesPersistence() {
    console.log("🚀 TEST DE PERSISTANCE DE TOUS LES MODULES");
    console.log("==========================================");

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    const testResults = [];

    // Test 1: Projects
    console.log("\n📁 Test 1: Module Projects");
    try {
        totalTests++;
        
        // Récupérer un utilisateur pour le test
        const { data: users } = await supabase.from('users').select('id').limit(1);
        if (!users || users.length === 0) {
            throw new Error('Aucun utilisateur trouvé');
        }
        
        const testUser = users[0];
        
        // Créer un projet de test
        const testProject = {
            name: 'Test Project CRUD',
            description: 'Projet de test pour vérifier les fonctionnalités CRUD',
            status: 'active',
            priority: 'high',
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            progress: 0,
            budget: 500000,
            owner_id: testUser.id,
            team_members: [testUser.id]
        };

        const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .insert([testProject])
            .select()
            .single();

        if (projectError) throw projectError;

        // Mettre à jour le projet
        const { data: updatedProject, error: updateError } = await supabase
            .from('projects')
            .update({ progress: 50, updated_at: new Date().toISOString() })
            .eq('id', projectData.id)
            .select()
            .single();

        if (updateError) throw updateError;

        // Supprimer le projet
        const { error: deleteError } = await supabase
            .from('projects')
            .delete()
            .eq('id', projectData.id);

        if (deleteError) throw deleteError;

        console.log("✅ Projects: CRUD complet fonctionnel");
        passedTests++;
        testResults.push({ module: 'Projects', status: 'PASS', details: 'CRUD complet' });
    } catch (error) {
        console.log(`❌ Projects: ${error.message}`);
        failedTests++;
        testResults.push({ module: 'Projects', status: 'FAIL', details: error.message });
    }

    // Test 2: Knowledge Base
    console.log("\n📚 Test 2: Module Knowledge Base");
    try {
        totalTests++;
        
        // Créer un article de test
        const testArticle = {
            title: 'Test Article CRUD',
            content: 'Contenu de test pour vérifier la persistance',
            summary: 'Résumé de test',
            category: 'Test',
            type: 'article',
            status: 'published',
            tags: ['test', 'crud'],
            author: 'Test User',
            views: 0,
            rating: 0
        };

        const { data: articleData, error: articleError } = await supabase
            .from('knowledge_articles')
            .insert([testArticle])
            .select()
            .single();

        if (articleError) throw articleError;

        // Mettre à jour l'article
        const { data: updatedArticle, error: updateError } = await supabase
            .from('knowledge_articles')
            .update({ views: 10, updated_at: new Date().toISOString() })
            .eq('id', articleData.id)
            .select()
            .single();

        if (updateError) throw updateError;

        // Supprimer l'article
        const { error: deleteError } = await supabase
            .from('knowledge_articles')
            .delete()
            .eq('id', articleData.id);

        if (deleteError) throw deleteError;

        console.log("✅ Knowledge Base: CRUD complet fonctionnel");
        passedTests++;
        testResults.push({ module: 'Knowledge Base', status: 'PASS', details: 'CRUD complet' });
    } catch (error) {
        console.log(`❌ Knowledge Base: ${error.message}`);
        failedTests++;
        testResults.push({ module: 'Knowledge Base', status: 'FAIL', details: error.message });
    }

    // Test 3: Jobs
    console.log("\n💼 Test 3: Module Jobs");
    try {
        totalTests++;
        
        // Créer une offre d'emploi de test
        const testJob = {
            title: 'Test Job CRUD',
            description: 'Description de test pour vérifier la persistance',
            company: 'Test Company',
            location: 'Test Location',
            department: 'Test',
            type: 'CDI',
            level: 'senior',
            salary_min: 1000000,
            salary_max: 1500000,
            requirements: ['Test requirement'],
            benefits: ['Test benefit'],
            status: 'open',
            applications_count: 0
        };

        const { data: jobData, error: jobError } = await supabase
            .from('jobs')
            .insert([testJob])
            .select()
            .single();

        if (jobError) throw jobError;

        // Mettre à jour l'offre
        const { data: updatedJob, error: updateError } = await supabase
            .from('jobs')
            .update({ applications_count: 5, updated_at: new Date().toISOString() })
            .eq('id', jobData.id)
            .select()
            .single();

        if (updateError) throw updateError;

        // Supprimer l'offre
        const { error: deleteError } = await supabase
            .from('jobs')
            .delete()
            .eq('id', jobData.id);

        if (deleteError) throw deleteError;

        console.log("✅ Jobs: CRUD complet fonctionnel");
        passedTests++;
        testResults.push({ module: 'Jobs', status: 'PASS', details: 'CRUD complet' });
    } catch (error) {
        console.log(`❌ Jobs: ${error.message}`);
        failedTests++;
        testResults.push({ module: 'Jobs', status: 'FAIL', details: error.message });
    }

    // Test 4: Courses
    console.log("\n🎓 Test 4: Module Courses");
    try {
        totalTests++;
        
        // Créer un cours de test
        const testCourse = {
            title: 'Test Course CRUD',
            description: 'Description de test pour vérifier la persistance',
            instructor: 'Test Instructor',
            duration: 60,
            level: 'beginner',
            category: 'Test',
            price: 10000,
            status: 'draft',
            rating: 0,
            students_count: 0,
            lessons_count: 0
        };

        const { data: courseData, error: courseError } = await supabase
            .from('courses')
            .insert([testCourse])
            .select()
            .single();

        if (courseError) throw courseError;

        // Mettre à jour le cours
        const { data: updatedCourse, error: updateError } = await supabase
            .from('courses')
            .update({ students_count: 10, updated_at: new Date().toISOString() })
            .eq('id', courseData.id)
            .select()
            .single();

        if (updateError) throw updateError;

        // Supprimer le cours
        const { error: deleteError } = await supabase
            .from('courses')
            .delete()
            .eq('id', courseData.id);

        if (deleteError) throw deleteError;

        console.log("✅ Courses: CRUD complet fonctionnel");
        passedTests++;
        testResults.push({ module: 'Courses', status: 'PASS', details: 'CRUD complet' });
    } catch (error) {
        console.log(`❌ Courses: ${error.message}`);
        failedTests++;
        testResults.push({ module: 'Courses', status: 'FAIL', details: error.message });
    }

    // Test 5: Finance
    console.log("\n💰 Test 5: Module Finance");
    try {
        totalTests++;
        
        // Créer une facture de test
        const testInvoice = {
            invoice_number: 'TEST-001',
            client_name: 'Test Client',
            amount: 100000,
            status: 'pending',
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            issued_date: new Date().toISOString().split('T')[0]
        };

        const { data: invoiceData, error: invoiceError } = await supabase
            .from('invoices')
            .insert([testInvoice])
            .select()
            .single();

        if (invoiceError) throw invoiceError;

        // Mettre à jour la facture
        const { data: updatedInvoice, error: updateError } = await supabase
            .from('invoices')
            .update({ status: 'paid', updated_at: new Date().toISOString() })
            .eq('id', invoiceData.id)
            .select()
            .single();

        if (updateError) throw updateError;

        // Supprimer la facture
        const { error: deleteError } = await supabase
            .from('invoices')
            .delete()
            .eq('id', invoiceData.id);

        if (deleteError) throw deleteError;

        console.log("✅ Finance: CRUD complet fonctionnel");
        passedTests++;
        testResults.push({ module: 'Finance', status: 'PASS', details: 'CRUD complet' });
    } catch (error) {
        console.log(`❌ Finance: ${error.message}`);
        failedTests++;
        testResults.push({ module: 'Finance', status: 'FAIL', details: error.message });
    }

    // Test 6: Time Tracking
    console.log("\n⏰ Test 6: Module Time Tracking");
    try {
        totalTests++;
        
        // Récupérer un utilisateur et un projet pour le test
        const { data: users } = await supabase.from('users').select('id').limit(1);
        const { data: projects } = await supabase.from('projects').select('id').limit(1);
        
        if (!users || users.length === 0 || !projects || projects.length === 0) {
            throw new Error('Utilisateur ou projet manquant pour le test');
        }
        
        // Créer un time log de test
        const testTimeLog = {
            user_id: users[0].id,
            project_id: projects[0].id,
            description: 'Test time log',
            hours: 1.0,
            date: new Date().toISOString().split('T')[0]
        };

        const { data: timeLogData, error: timeLogError } = await supabase
            .from('time_logs')
            .insert([testTimeLog])
            .select()
            .single();

        if (timeLogError) throw timeLogError;

        // Mettre à jour le time log
        const { data: updatedTimeLog, error: updateError } = await supabase
            .from('time_logs')
            .update({ hours: 1.5, updated_at: new Date().toISOString() })
            .eq('id', timeLogData.id)
            .select()
            .single();

        if (updateError) throw updateError;

        // Supprimer le time log
        const { error: deleteError } = await supabase
            .from('time_logs')
            .delete()
            .eq('id', timeLogData.id);

        if (deleteError) throw deleteError;

        console.log("✅ Time Tracking: CRUD complet fonctionnel");
        passedTests++;
        testResults.push({ module: 'Time Tracking', status: 'PASS', details: 'CRUD complet' });
    } catch (error) {
        console.log(`❌ Time Tracking: ${error.message}`);
        failedTests++;
        testResults.push({ module: 'Time Tracking', status: 'FAIL', details: error.message });
    }

    // Résultats finaux
    console.log("\n🎉 RÉSULTATS FINAUX");
    console.log("===================");
    console.log(`✅ Tests réussis: ${passedTests}/${totalTests}`);
    console.log(`❌ Tests échoués: ${failedTests}/${totalTests}`);
    console.log(`📊 Taux de réussite: ${Math.round((passedTests / totalTests) * 100)}%`);

    console.log("\n📋 DÉTAIL DES RÉSULTATS");
    console.log("=======================");
    testResults.forEach(result => {
        const icon = result.status === 'PASS' ? '✅' : '❌';
        console.log(`${icon} ${result.module}: ${result.details}`);
    });

    if (failedTests === 0) {
        console.log("\n🎊 TOUS LES MODULES SONT PERSISTANTS !");
        console.log("L'application est maintenant 100% fonctionnelle avec Supabase.");
    } else {
        console.log(`\n⚠️ ${failedTests} module(s) nécessitent encore des corrections.`);
    }
}

testAllModulesPersistence();
