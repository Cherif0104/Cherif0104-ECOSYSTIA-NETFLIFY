const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey);

async function checkFinanceTables() {
    console.log("🔍 VÉRIFICATION TABLES FINANCE");
    console.log("==============================\n");

    try {
        // Vérifier les tables existantes
        const { data: tables, error: tablesError } = await supabase
            .rpc('get_tables_in_schema', { schema_name: 'public' });

        if (tablesError) {
            console.error("❌ Erreur récupération tables:", tablesError.message);
            return;
        }

        console.log("📋 Tables existantes dans le schéma public:");
        tables.forEach(table => {
            if (table.includes('invoice') || table.includes('expense') || table.includes('budget')) {
                console.log(`   - ${table}`);
            }
        });

        // Vérifier la structure de la table invoices si elle existe
        if (tables.includes('invoices')) {
            console.log("\n🔍 Structure de la table invoices:");
            const { data: invoiceColumns, error: invoiceError } = await supabase
                .from('invoices')
                .select('*')
                .limit(1);

            if (invoiceError) {
                console.error("❌ Erreur récupération colonnes invoices:", invoiceError.message);
            } else if (invoiceColumns && invoiceColumns.length > 0) {
                console.log("Colonnes trouvées:", Object.keys(invoiceColumns[0]));
            } else {
                console.log("Table invoices vide, création d'un enregistrement de test...");
                // Créer un enregistrement de test pour voir la structure
                const { data: testInvoice, error: createError } = await supabase
                    .from('invoices')
                    .insert([{
                        client_name: 'Test Client',
                        amount: 100000,
                        status: 'pending',
                        due_date: '2024-02-15',
                        issue_date: '2024-01-15',
                        description: 'Test structure'
                    }])
                    .select('*')
                    .single();

                if (createError) {
                    console.error("❌ Erreur création test invoice:", createError.message);
                } else {
                    console.log("✅ Structure invoices:", Object.keys(testInvoice));
                    // Nettoyer
                    await supabase.from('invoices').delete().eq('id', testInvoice.id);
                }
            }
        }

        // Vérifier la structure de la table expenses si elle existe
        if (tables.includes('expenses')) {
            console.log("\n🔍 Structure de la table expenses:");
            const { data: expenseColumns, error: expenseError } = await supabase
                .from('expenses')
                .select('*')
                .limit(1);

            if (expenseError) {
                console.error("❌ Erreur récupération colonnes expenses:", expenseError.message);
            } else if (expenseColumns && expenseColumns.length > 0) {
                console.log("Colonnes trouvées:", Object.keys(expenseColumns[0]));
            } else {
                console.log("Table expenses vide, création d'un enregistrement de test...");
                const { data: testExpense, error: createError } = await supabase
                    .from('expenses')
                    .insert([{
                        title: 'Test Expense',
                        amount: 50000,
                        category: 'office',
                        description: 'Test structure',
                        date: '2024-01-15'
                    }])
                    .select('*')
                    .single();

                if (createError) {
                    console.error("❌ Erreur création test expense:", createError.message);
                } else {
                    console.log("✅ Structure expenses:", Object.keys(testExpense));
                    // Nettoyer
                    await supabase.from('expenses').delete().eq('id', testExpense.id);
                }
            }
        }

        // Vérifier la structure de la table budgets si elle existe
        if (tables.includes('budgets')) {
            console.log("\n🔍 Structure de la table budgets:");
            const { data: budgetColumns, error: budgetError } = await supabase
                .from('budgets')
                .select('*')
                .limit(1);

            if (budgetError) {
                console.error("❌ Erreur récupération colonnes budgets:", budgetError.message);
            } else if (budgetColumns && budgetColumns.length > 0) {
                console.log("Colonnes trouvées:", Object.keys(budgetColumns[0]));
            } else {
                console.log("Table budgets vide, création d'un enregistrement de test...");
                const { data: testBudget, error: createError } = await supabase
                    .from('budgets')
                    .insert([{
                        name: 'Test Budget',
                        category: 'development',
                        amount: 500000,
                        period: 'quarterly',
                        start_date: '2024-01-01',
                        end_date: '2024-03-31',
                        description: 'Test structure'
                    }])
                    .select('*')
                    .single();

                if (createError) {
                    console.error("❌ Erreur création test budget:", createError.message);
                } else {
                    console.log("✅ Structure budgets:", Object.keys(testBudget));
                    // Nettoyer
                    await supabase.from('budgets').delete().eq('id', testBudget.id);
                }
            }
        }

    } catch (error) {
        console.error("❌ Erreur inattendue:", error.message || error);
    }
}

checkFinanceTables();
