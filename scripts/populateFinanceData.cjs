const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey);

async function populateFinanceData() {
    console.log("💰 PEUPLEMENT DONNÉES FINANCE");
    console.log("==============================\n");

    let contactUser = null;

    try {
        // 1. Récupérer l'utilisateur CONTACT
        console.log("1️⃣ Récupération utilisateur CONTACT...");
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, first_name, last_name, email')
            .ilike('email', 'contact@senegel.org');

        if (usersError) throw usersError;
        if (users.length === 0) {
            console.error("❌ Utilisateur CONTACT non trouvé. Veuillez vous assurer qu'il existe.");
            return;
        }
        contactUser = users[0];
        console.log(`✅ Utilisateur: ${contactUser.first_name} ${contactUser.last_name} (${contactUser.id})\n`);

        const userId = contactUser.id;

        // 2. Création de factures
        console.log("2️⃣ Création de factures...");
        const invoices = [
            {
                user_id: userId,
                number: 'FAC-2024-001',
                client_name: 'Entreprise ABC',
                amount: 250000,
                status: 'paid',
                due_date: '2024-02-15',
                issue_date: '2024-01-15',
                description: 'Développement application web',
                items: [
                    { description: 'Développement frontend', quantity: 1, price: 150000 },
                    { description: 'Développement backend', quantity: 1, price: 100000 }
                ],
                tax: 0,
                total: 250000,
                notes: 'Facture payée'
            },
            {
                user_id: userId,
                number: 'FAC-2024-002',
                client_name: 'Société XYZ',
                amount: 180000,
                status: 'pending',
                due_date: '2024-03-01',
                issue_date: '2024-02-01',
                description: 'Maintenance système',
                items: [
                    { description: 'Maintenance mensuelle', quantity: 1, price: 180000 }
                ],
                tax: 0,
                total: 180000,
                notes: 'En attente de paiement'
            },
            {
                user_id: userId,
                number: 'FAC-2024-003',
                client_name: 'Client DEF',
                amount: 320000,
                status: 'overdue',
                due_date: '2024-01-30',
                issue_date: '2024-01-01',
                description: 'Consultation technique',
                items: [
                    { description: 'Audit technique', quantity: 1, price: 200000 },
                    { description: 'Rapport détaillé', quantity: 1, price: 120000 }
                ],
                tax: 0,
                total: 320000,
                notes: 'En retard de paiement'
            }
        ];

        for (const invoice of invoices) {
            const { data: createdInvoice, error: invoiceError } = await supabase
                .from('invoices')
                .insert([invoice])
                .select()
                .single();

            if (invoiceError) {
                console.error(`❌ Erreur création facture ${invoice.number}:`, invoiceError.message);
            } else {
                console.log(`✅ Facture créée: ${createdInvoice.number} - ${createdInvoice.client_name}`);
            }
        }

        // 3. Création de dépenses
        console.log("\n3️⃣ Création de dépenses...");
        const expenses = [
            {
                user_id: userId,
                title: 'Achat matériel informatique',
                amount: 75000,
                category: 'office',
                description: 'Achat d\'un nouvel ordinateur portable',
                date: '2024-01-10',
                status: 'approved',
                tags: ['informatique', 'matériel']
            },
            {
                user_id: userId,
                title: 'Formation en ligne',
                amount: 45000,
                category: 'development',
                description: 'Formation React et TypeScript',
                date: '2024-01-15',
                status: 'approved',
                tags: ['formation', 'développement']
            },
            {
                user_id: userId,
                title: 'Déjeuner client',
                amount: 15000,
                category: 'marketing',
                description: 'Repas d\'affaires avec un client potentiel',
                date: '2024-01-20',
                status: 'pending',
                tags: ['marketing', 'client']
            },
            {
                user_id: userId,
                title: 'Abonnement logiciels',
                amount: 25000,
                category: 'office',
                description: 'Abonnement mensuel aux outils de développement',
                date: '2024-01-01',
                status: 'approved',
                tags: ['logiciels', 'abonnement']
            }
        ];

        for (const expense of expenses) {
            const { data: createdExpense, error: expenseError } = await supabase
                .from('expenses')
                .insert([expense])
                .select()
                .single();

            if (expenseError) {
                console.error(`❌ Erreur création dépense ${expense.title}:`, expenseError.message);
            } else {
                console.log(`✅ Dépense créée: ${createdExpense.title} - ${createdExpense.amount} XOF`);
            }
        }

        // 4. Création de budgets
        console.log("\n4️⃣ Création de budgets...");
        const budgets = [
            {
                user_id: userId,
                name: 'Budget Q1 2024',
                category: 'development',
                amount: 500000,
                spent: 120000,
                period: 'quarterly',
                start_date: '2024-01-01',
                end_date: '2024-03-31',
                description: 'Budget trimestriel pour le développement',
                status: 'active'
            },
            {
                user_id: userId,
                name: 'Budget Marketing 2024',
                category: 'marketing',
                amount: 300000,
                spent: 45000,
                period: 'yearly',
                start_date: '2024-01-01',
                end_date: '2024-12-31',
                description: 'Budget annuel pour les activités marketing',
                status: 'active'
            },
            {
                user_id: userId,
                name: 'Budget Bureau Q1',
                category: 'office',
                amount: 200000,
                spent: 100000,
                period: 'quarterly',
                start_date: '2024-01-01',
                end_date: '2024-03-31',
                description: 'Budget pour les dépenses de bureau',
                status: 'active'
            }
        ];

        for (const budget of budgets) {
            const { data: createdBudget, error: budgetError } = await supabase
                .from('budgets')
                .insert([budget])
                .select()
                .single();

            if (budgetError) {
                console.error(`❌ Erreur création budget ${budget.name}:`, budgetError.message);
            } else {
                console.log(`✅ Budget créé: ${createdBudget.name} - ${createdBudget.amount} XOF`);
            }
        }

        console.log("\n🎉 PEUPLEMENT TERMINÉ !");
        console.log("✅ Données financières créées pour l'utilisateur CONTACT");
        console.log(`   - ${invoices.length} facture(s)`);
        console.log(`   - ${expenses.length} dépense(s)`);
        console.log(`   - ${budgets.length} budget(s)`);

        // 5. Vérification des données
        console.log("\n5️⃣ Vérification des données...");
        const { data: invoicesCount } = await supabase.from('invoices').select('id').eq('user_id', userId);
        const { data: expensesCount } = await supabase.from('expenses').select('id').eq('user_id', userId);
        const { data: budgetsCount } = await supabase.from('budgets').select('id').eq('user_id', userId);

        console.log(`📊 Résumé pour CONTACT:`);
        console.log(`   - Factures: ${invoicesCount ? invoicesCount.length : 0}`);
        console.log(`   - Dépenses: ${expensesCount ? expensesCount.length : 0}`);
        console.log(`   - Budgets: ${budgetsCount ? budgetsCount.length : 0}`);

    } catch (error) {
        console.error("❌ Erreur lors du peuplement des données:", error.message || error);
    }
}

populateFinanceData();
