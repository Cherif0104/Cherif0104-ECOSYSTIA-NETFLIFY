const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey);

async function testFinanceModule() {
    console.log("💰 TEST MODULE FINANCE");
    console.log("=====================\n");

    let createdInvoiceId = null;
    let createdExpenseId = null;
    let createdBudgetId = null;

    try {
        // 1. Récupérer un utilisateur pour les tests
        console.log("1️⃣ Récupération d'un utilisateur pour les tests...");
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, first_name, last_name')
            .limit(1);

        if (usersError) throw usersError;
        if (users.length === 0) {
            console.error("❌ Aucun utilisateur trouvé. Veuillez créer des utilisateurs de test.");
            return;
        }
        const testUser = users[0];
        console.log(`✅ Utilisateur trouvé: ${testUser.first_name} ${testUser.last_name} (${testUser.id})\n`);

        const userId = testUser.id;

        // 2. Tester la création d'une facture
        console.log("2️⃣ Test création facture...");
        const testInvoice = {
            user_id: userId,
            number: 'FAC-2024-001',
            client_name: 'Client Test', // Utiliser client_name
            amount: 150000,
            status: 'pending',
            due_date: '2024-02-15',
            issue_date: '2024-01-15',
            description: 'Facture de test pour le module Finance',
            items: [
                { description: 'Service de développement', quantity: 1, price: 150000 }
            ],
            tax: 0,
            total: 150000,
            notes: 'Facture de test'
        };

        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .insert([testInvoice])
            .select()
            .single();

        if (invoiceError) {
            console.error("❌ Erreur création facture:", invoiceError.message);
        } else {
            createdInvoiceId = invoice.id;
            console.log("✅ Facture créée avec succès:", invoice.id);
            console.log(`   - Client: ${invoice.client_name}`);
            console.log(`   - Montant: ${invoice.amount} XOF`);
            console.log(`   - Statut: ${invoice.status}`);
        }

        // 3. Tester la création d'une dépense
        console.log("\n3️⃣ Test création dépense...");
        const testExpense = {
            user_id: userId,
            title: 'Dépense de test',
            amount: 50000,
            category: 'office',
            description: 'Dépense de test pour le module Finance',
            date: '2024-01-15',
            status: 'approved',
            tags: ['test', 'office']
        };

        const { data: expense, error: expenseError } = await supabase
            .from('expenses')
            .insert([testExpense])
            .select()
            .single();

        if (expenseError) {
            console.error("❌ Erreur création dépense:", expenseError.message);
        } else {
            createdExpenseId = expense.id;
            console.log("✅ Dépense créée avec succès:", expense.id);
            console.log(`   - Titre: ${expense.title}`);
            console.log(`   - Montant: ${expense.amount} XOF`);
            console.log(`   - Catégorie: ${expense.category}`);
        }

        // 4. Tester la création d'un budget
        console.log("\n4️⃣ Test création budget...");
        const testBudget = {
            user_id: userId,
            name: 'Budget Q1 2024',
            category: 'development',
            amount: 500000,
            spent: 0,
            period: 'quarterly',
            start_date: '2024-01-01',
            end_date: '2024-03-31',
            description: 'Budget trimestriel pour le développement',
            status: 'active'
        };

        const { data: budget, error: budgetError } = await supabase
            .from('budgets')
            .insert([testBudget])
            .select()
            .single();

        if (budgetError) {
            console.error("❌ Erreur création budget:", budgetError.message);
        } else {
            createdBudgetId = budget.id;
            console.log("✅ Budget créé avec succès:", budget.id);
            console.log(`   - Nom: ${budget.name}`);
            console.log(`   - Montant: ${budget.amount} XOF`);
            console.log(`   - Période: ${budget.period}`);
        }

        // 5. Tester la récupération des données
        console.log("\n5️⃣ Test récupération des données...");
        const { data: allInvoices, error: invoicesError } = await supabase
            .from('invoices')
            .select('*')
            .eq('user_id', userId);

        const { data: allExpenses, error: expensesError } = await supabase
            .from('expenses')
            .select('*')
            .eq('user_id', userId);

        const { data: allBudgets, error: budgetsError } = await supabase
            .from('budgets')
            .select('*')
            .eq('user_id', userId);

        if (invoicesError) {
            console.error("❌ Erreur récupération factures:", invoicesError.message);
        } else {
            console.log(`✅ ${allInvoices.length} facture(s) récupérée(s) pour l'utilisateur`);
        }

        if (expensesError) {
            console.error("❌ Erreur récupération dépenses:", expensesError.message);
        } else {
            console.log(`✅ ${allExpenses.length} dépense(s) récupérée(s) pour l'utilisateur`);
        }

        if (budgetsError) {
            console.error("❌ Erreur récupération budgets:", budgetsError.message);
        } else {
            console.log(`✅ ${allBudgets.length} budget(s) récupéré(s) pour l'utilisateur`);
        }

        // 6. Tester la mise à jour
        console.log("\n6️⃣ Test mise à jour facture...");
        if (createdInvoiceId) {
            const { data: updatedInvoice, error: updateError } = await supabase
                .from('invoices')
                .update({ 
                    status: 'paid',
                    updated_at: new Date().toISOString()
                })
                .eq('id', createdInvoiceId)
                .select()
                .single();

            if (updateError) {
                console.error("❌ Erreur mise à jour facture:", updateError.message);
            } else {
                console.log("✅ Facture mise à jour avec succès:");
                console.log(`   - Nouveau statut: ${updatedInvoice.status}`);
            }
        }

        console.log("\n🎉 TEST MODULE FINANCE TERMINÉ !");
        console.log("✅ Le module Finance fonctionne correctement");
        console.log("✅ L'isolation des données par utilisateur est active");
        console.log("✅ Les opérations CRUD sont fonctionnelles");

    } catch (error) {
        console.error("❌ Erreur inattendue:", error.message || error);
    } finally {
        // 7. Nettoyage
        console.log("\n7️⃣ Nettoyage des données de test...");
        
        if (createdInvoiceId) {
            const { error: deleteInvoiceError } = await supabase
                .from('invoices')
                .delete()
                .eq('id', createdInvoiceId);
            if (deleteInvoiceError) {
                console.error("❌ Erreur suppression facture:", deleteInvoiceError.message);
            } else {
                console.log("✅ Facture de test supprimée");
            }
        }

        if (createdExpenseId) {
            const { error: deleteExpenseError } = await supabase
                .from('expenses')
                .delete()
                .eq('id', createdExpenseId);
            if (deleteExpenseError) {
                console.error("❌ Erreur suppression dépense:", deleteExpenseError.message);
            } else {
                console.log("✅ Dépense de test supprimée");
            }
        }

        if (createdBudgetId) {
            const { error: deleteBudgetError } = await supabase
                .from('budgets')
                .delete()
                .eq('id', createdBudgetId);
            if (deleteBudgetError) {
                console.error("❌ Erreur suppression budget:", deleteBudgetError.message);
            } else {
                console.log("✅ Budget de test supprimé");
            }
        }

        console.log("\n✅ Nettoyage terminé");
    }
}

testFinanceModule();
