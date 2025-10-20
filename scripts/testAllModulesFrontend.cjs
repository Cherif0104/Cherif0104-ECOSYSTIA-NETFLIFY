const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

async function testAllModulesFrontend() {
    console.log("🔍 TEST TOUS LES MODULES FRONTEND");
    console.log("=================================\n");

    const modules = [
        { name: 'Goals (OKRs)', table: 'objectives' },
        { name: 'Time Tracking', table: 'time_logs' },
        { name: 'Finance - Invoices', table: 'invoices' },
        { name: 'Finance - Expenses', table: 'expenses' },
        { name: 'Knowledge Base', table: 'knowledge_articles' },
        { name: 'Jobs', table: 'jobs' },
        { name: 'Courses', table: 'courses' }
    ];

    for (const module of modules) {
        try {
            console.log(`\n📊 Test ${module.name}...`);
            
            const { data, error } = await supabase
                .from(module.table)
                .select('*')
                .limit(5);

            if (error) {
                console.log(`❌ ${module.name}: ${error.message}`);
            } else {
                console.log(`✅ ${module.name}: ${data.length} enregistrement(s) trouvé(s)`);
                if (data.length > 0) {
                    console.log(`   - Exemple: ${JSON.stringify(data[0], null, 2).substring(0, 100)}...`);
                }
            }
        } catch (err) {
            console.log(`❌ ${module.name}: Erreur - ${err.message}`);
        }
    }

    console.log("\n🎯 DIAGNOSTIC COMPLET TERMINÉ");
    console.log("Vérifiez quels modules ont des données et lesquels n'en ont pas.");
}

testAllModulesFrontend();
