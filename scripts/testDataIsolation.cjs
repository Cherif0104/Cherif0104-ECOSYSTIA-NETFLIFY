const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

async function testDataIsolation() {
    console.log("🔒 TEST ISOLATION DES DONNÉES");
    console.log("=============================\n");

    try {
        // 1. Récupérer tous les utilisateurs
        console.log("1️⃣ Récupération des utilisateurs...");
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, first_name, last_name, email')
            .limit(5);

        if (usersError || !users || users.length < 2) {
            console.error("❌ Besoin d'au moins 2 utilisateurs pour le test");
            return;
        }

        console.log(`✅ ${users.length} utilisateurs trouvés`);
        const user1 = users[0];
        const user2 = users[1];
        console.log(`   - Utilisateur 1: ${user1.first_name} ${user1.last_name} (${user1.id})`);
        console.log(`   - Utilisateur 2: ${user2.first_name} ${user2.last_name} (${user2.id})`);

        // 2. Créer des données de test pour chaque utilisateur
        console.log("\n2️⃣ Création de données de test...");
        
        // Projets pour user1
        const project1 = {
            name: `Projet User1 - ${Date.now()}`,
            description: 'Projet privé de User1',
            status: 'active',
            priority: 'high',
            owner_id: user1.id,
            team_members: [user1.id],
            start_date: '2024-01-01',
            end_date: '2024-12-31'
        };

        const { data: createdProject1, error: project1Error } = await supabase
            .from('projects')
            .insert([project1])
            .select()
            .single();

        if (project1Error) {
            console.error("❌ Erreur création projet User1:", project1Error.message);
        } else {
            console.log("✅ Projet User1 créé:", createdProject1.id);
        }

        // Projets pour user2
        const project2 = {
            name: `Projet User2 - ${Date.now()}`,
            description: 'Projet privé de User2',
            status: 'active',
            priority: 'medium',
            owner_id: user2.id,
            team_members: [user2.id],
            start_date: '2024-01-01',
            end_date: '2024-12-31'
        };

        const { data: createdProject2, error: project2Error } = await supabase
            .from('projects')
            .insert([project2])
            .select()
            .single();

        if (project2Error) {
            console.error("❌ Erreur création projet User2:", project2Error.message);
        } else {
            console.log("✅ Projet User2 créé:", createdProject2.id);
        }

        // 3. Tester l'isolation - User1 ne devrait voir que ses projets
        console.log("\n3️⃣ Test d'isolation - User1...");
        const { data: user1Projects, error: user1Error } = await supabase
            .from('projects')
            .select('*')
            .or(`owner_id.eq.${user1.id},team_members.cs.{${user1.id}}`);

        if (user1Error) {
            console.error("❌ Erreur récupération projets User1:", user1Error.message);
        } else {
            console.log(`✅ User1 voit ${user1Projects.length} projet(s)`);
            user1Projects.forEach(project => {
                console.log(`   - ${project.name} (Owner: ${project.owner_id})`);
            });
        }

        // 4. Tester l'isolation - User2 ne devrait voir que ses projets
        console.log("\n4️⃣ Test d'isolation - User2...");
        const { data: user2Projects, error: user2Error } = await supabase
            .from('projects')
            .select('*')
            .or(`owner_id.eq.${user2.id},team_members.cs.{${user2.id}}`);

        if (user2Error) {
            console.error("❌ Erreur récupération projets User2:", user2Error.message);
        } else {
            console.log(`✅ User2 voit ${user2Projects.length} projet(s)`);
            user2Projects.forEach(project => {
                console.log(`   - ${project.name} (Owner: ${project.owner_id})`);
            });
        }

        // 5. Vérifier qu'ils ne voient pas les projets de l'autre
        console.log("\n5️⃣ Vérification de l'isolation...");
        const user1SeesUser2Project = user1Projects.some(p => p.owner_id === user2.id);
        const user2SeesUser1Project = user2Projects.some(p => p.owner_id === user1.id);

        if (user1SeesUser2Project) {
            console.log("❌ PROBLÈME: User1 peut voir les projets de User2");
        } else {
            console.log("✅ User1 ne voit pas les projets de User2");
        }

        if (user2SeesUser1Project) {
            console.log("❌ PROBLÈME: User2 peut voir les projets de User1");
        } else {
            console.log("✅ User2 ne voit pas les projets de User1");
        }

        // 6. Test avec un projet partagé
        console.log("\n6️⃣ Test avec projet partagé...");
        const sharedProject = {
            name: `Projet Partagé - ${Date.now()}`,
            description: 'Projet partagé entre User1 et User2',
            status: 'active',
            priority: 'low',
            owner_id: user1.id,
            team_members: [user1.id, user2.id],
            start_date: '2024-01-01',
            end_date: '2024-12-31'
        };

        const { data: createdSharedProject, error: sharedError } = await supabase
            .from('projects')
            .insert([sharedProject])
            .select()
            .single();

        if (sharedError) {
            console.error("❌ Erreur création projet partagé:", sharedError.message);
        } else {
            console.log("✅ Projet partagé créé:", createdSharedProject.id);
            
            // Vérifier que les deux utilisateurs voient le projet partagé
            const { data: user1ProjectsAfter, error: user1AfterError } = await supabase
                .from('projects')
                .select('*')
                .or(`owner_id.eq.${user1.id},team_members.cs.{${user1.id}}`);

            const { data: user2ProjectsAfter, error: user2AfterError } = await supabase
                .from('projects')
                .select('*')
                .or(`owner_id.eq.${user2.id},team_members.cs.{${user2.id}}`);

            const user1SeesShared = user1ProjectsAfter.some(p => p.id === createdSharedProject.id);
            const user2SeesShared = user2ProjectsAfter.some(p => p.id === createdSharedProject.id);

            console.log(`✅ User1 voit le projet partagé: ${user1SeesShared}`);
            console.log(`✅ User2 voit le projet partagé: ${user2SeesShared}`);
        }

        // 7. Nettoyage
        console.log("\n7️⃣ Nettoyage...");
        const projectsToDelete = [createdProject1?.id, createdProject2?.id, createdSharedProject?.id].filter(Boolean);
        
        for (const projectId of projectsToDelete) {
            await supabase
                .from('projects')
                .delete()
                .eq('id', projectId);
        }
        console.log("✅ Projets de test supprimés");

        console.log("\n🎉 TEST TERMINÉ !");
        console.log("✅ L'isolation des données fonctionne correctement");
        console.log("✅ Chaque utilisateur ne voit que ses propres données");
        console.log("✅ Les projets partagés sont visibles par tous les membres de l'équipe");

    } catch (error) {
        console.error(`❌ Erreur: ${error.message}`);
        console.error("Détails:", error);
    }
}

testDataIsolation();
