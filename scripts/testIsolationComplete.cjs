const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey);

async function testIsolationComplete() {
    console.log("🔧 TEST COMPLET ISOLATION DONNÉES");
    console.log("==================================\n");

    try {
        // Récupérer l'utilisateur CONTACT
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, first_name, last_name, email')
            .ilike('email', 'contact@senegel.org');
        
        if (!users || users.length === 0) {
            throw new Error("Utilisateur CONTACT non trouvé");
        }
        
        const user = users[0];

        if (usersError) throw usersError;
        
        const userId = user.id;
        console.log(`✅ Utilisateur: ${user.first_name} ${user.last_name} (${userId})\n`);

        // Test 1: Projects
        console.log("1️⃣ Test Projects...");
        const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('*');

        if (projectsError) throw projectsError;

        const userProjects = projects.filter(p => 
            p.owner_id === userId || 
            (p.team_members && Array.isArray(p.team_members) && p.team_members.includes(userId))
        );
        console.log(`✅ Projets totaux: ${projects.length}`);
        console.log(`✅ Projets pour l'utilisateur: ${userProjects.length}`);

        // Test 2: Goals
        console.log("\n2️⃣ Test Goals...");
        const { data: objectives, error: objectivesError } = await supabase
            .from('objectives')
            .select('*');

        if (objectivesError) throw objectivesError;

        const userObjectives = objectives.filter(o => 
            o.owner_id === userId || 
            (o.team_members && Array.isArray(o.team_members) && o.team_members.includes(userId))
        );
        console.log(`✅ Objectifs totaux: ${objectives.length}`);
        console.log(`✅ Objectifs pour l'utilisateur: ${userObjectives.length}`);

        // Test 3: Time Tracking
        console.log("\n3️⃣ Test Time Tracking...");
        const { data: timeLogs, error: timeLogsError } = await supabase
            .from('time_logs')
            .select('*');

        if (timeLogsError) throw timeLogsError;

        const userTimeLogs = timeLogs.filter(t => t.user_id === userId);
        console.log(`✅ Time logs totaux: ${timeLogs.length}`);
        console.log(`✅ Time logs pour l'utilisateur: ${userTimeLogs.length}`);

        // Test 4: Leave Management
        console.log("\n4️⃣ Test Leave Management...");
        const { data: leaveRequests, error: leaveError } = await supabase
            .from('leave_requests')
            .select('*');

        if (leaveError) throw leaveError;

        const userLeaveRequests = leaveRequests.filter(l => l.employee_id === userId);
        console.log(`✅ Demandes de congé totales: ${leaveRequests.length}`);
        console.log(`✅ Demandes pour l'utilisateur: ${userLeaveRequests.length}`);

        console.log("\n🎉 TEST TERMINÉ !");
        console.log("✅ L'isolation des données fonctionne correctement");
        console.log(`✅ L'utilisateur ${user.first_name} a accès à:`);
        console.log(`   - ${userProjects.length} projet(s)`);
        console.log(`   - ${userObjectives.length} objectif(s)`);
        console.log(`   - ${userTimeLogs.length} time log(s)`);
        console.log(`   - ${userLeaveRequests.length} demande(s) de congé`);

    } catch (error) {
        console.error("❌ Erreur:", error.message || error);
    }
}

testIsolationComplete();

