const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey);

async function fixGoalsQuery() {
    console.log("🔧 TEST SYNTAXE REQUÊTE GOALS");
    console.log("=============================\n");

    try {
        // Récupérer un utilisateur
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id')
            .limit(1);

        if (usersError) throw usersError;
        if (users.length === 0) {
            console.error("❌ Aucun utilisateur trouvé");
            return;
        }

        const userId = users[0].id;
        console.log(`✅ Test avec utilisateur: ${userId}`);

        // Test 1: Syntaxe actuelle (qui échoue)
        console.log("\n1️⃣ Test syntaxe actuelle...");
        try {
            const { data, error } = await supabase
                .from('objectives')
                .select('*')
                .or(`owner_id.eq.${userId},team_members.cs.{"${userId}"}`);
            
            if (error) {
                console.log("❌ Syntaxe actuelle échoue:", error.message);
            } else {
                console.log("✅ Syntaxe actuelle fonctionne:", data.length);
            }
        } catch (err) {
            console.log("❌ Erreur:", err.message);
        }

        // Test 2: Syntaxe alternative avec @>
        console.log("\n2️⃣ Test syntaxe alternative (@>)...");
        try {
            const { data, error } = await supabase
                .from('objectives')
                .select('*')
                .or(`owner_id.eq.${userId},team_members.@>.["${userId}"]`);
            
            if (error) {
                console.log("❌ Syntaxe @> échoue:", error.message);
            } else {
                console.log("✅ Syntaxe @> fonctionne:", data.length);
            }
        } catch (err) {
            console.log("❌ Erreur:", err.message);
        }

        // Test 3: Sans filtrage team_members
        console.log("\n3️⃣ Test sans filtrage team_members...");
        try {
            const { data, error } = await supabase
                .from('objectives')
                .select('*')
                .eq('owner_id', userId);
            
            if (error) {
                console.log("❌ Sans team_members échoue:", error.message);
            } else {
                console.log("✅ Sans team_members fonctionne:", data.length);
            }
        } catch (err) {
            console.log("❌ Erreur:", err.message);
        }

        // Test 4: Récupérer tous les objectifs et filtrer côté client
        console.log("\n4️⃣ Test récupération complète...");
        try {
            const { data, error } = await supabase
                .from('objectives')
                .select('*');
            
            if (error) {
                console.log("❌ Récupération complète échoue:", error.message);
            } else {
                console.log("✅ Récupération complète fonctionne:", data.length);
                
                // Filtrer côté client
                const filtered = data.filter(obj => {
                    if (obj.owner_id === userId) return true;
                    if (obj.team_members && Array.isArray(obj.team_members)) {
                        return obj.team_members.includes(userId);
                    }
                    return false;
                });
                console.log(`✅ Après filtrage côté client: ${filtered.length}`);
            }
        } catch (err) {
            console.log("❌ Erreur:", err.message);
        }

    } catch (error) {
        console.error("❌ Erreur inattendue:", error.message || error);
    }
}

fixGoalsQuery();

