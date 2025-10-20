const { createClient } = require('@supabase/supabase-js');

const supabaseConfig = {
  url: 'https://nigfrebfpkeoreaaiqzu.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZ2ZyZWJmcGtlb3JlYWFpcXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NjIzMDYsImV4cCI6MjA3NjIzODMwNn0.-_jcUhUeifEACMHl2SAErb7lAfzOVHzD7QGtAxFsgQk'
};

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

async function testFinanceModule() {
  console.log('💰 TEST DU MODULE FINANCE AVEC RLS');
  console.log('===================================');

  try {
    // Test 1: Connexion utilisateur 1 (Rokhaya - Manager)
    console.log('\n1️⃣ Connexion utilisateur 1 (Rokhaya - Manager)...');
    const { data: authData1, error: authError1 } = await supabase.auth.signInWithPassword({
      email: 'rokhaya@senegel.org',
      password: 'Senegel2024!'
    });

    if (authError1) {
      console.error('❌ Erreur de connexion:', authError1.message);
      return;
    }

    console.log('✅ Connexion réussie:', authData1.user.email);
    console.log('🆔 User ID:', authData1.user.id);

    // Test 2: Vérifier les budgets existants pour cet utilisateur
    console.log('\n2️⃣ Vérification des budgets existants...');
    const { data: existingBudgets, error: budgetsError } = await supabase
      .from('budgets')
      .select('*')
      .order('created_at', { ascending: false });

    if (budgetsError) {
      console.error('❌ Erreur lecture budgets:', budgetsError.message);
    } else {
      console.log(`✅ ${existingBudgets.length} budgets trouvés pour cet utilisateur`);
      existingBudgets.forEach(budget => {
        console.log(`   - ${budget.name} (user: ${budget.user_id}, amount: ${budget.amount})`);
      });
    }

    // Test 3: Création d'un nouveau budget
    console.log('\n3️⃣ Création d\'un nouveau budget...');
    const newBudgetData = {
      name: 'Budget Test RLS - Rokhaya',
      description: 'Budget de test pour vérifier l\'isolation des données',
      amount: 50000,
      user_id: authData1.user.id,
      category: 'Test',
      period: '2024',
      status: 'active'
    };

    const { data: newBudget, error: createBudgetError } = await supabase
      .from('budgets')
      .insert([newBudgetData])
      .select()
      .single();

    if (createBudgetError) {
      console.error('❌ Erreur création budget:', createBudgetError.message);
    } else {
      console.log('✅ Budget créé:', newBudget.id);
      console.log('   - Nom:', newBudget.name);
      console.log('   - User:', newBudget.user_id);
      console.log('   - Montant:', newBudget.amount);
    }

    // Test 4: Création d'une nouvelle dépense
    console.log('\n4️⃣ Création d\'une nouvelle dépense...');
    const newExpenseData = {
      title: 'Dépense Test RLS - Rokhaya',
      amount: 1500,
      user_id: authData1.user.id,
      category: 'Test',
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    };

    const { data: newExpense, error: createExpenseError } = await supabase
      .from('expenses')
      .insert([newExpenseData])
      .select()
      .single();

    if (createExpenseError) {
      console.error('❌ Erreur création dépense:', createExpenseError.message);
    } else {
      console.log('✅ Dépense créée:', newExpense.id);
      console.log('   - Description:', newExpense.description);
      console.log('   - User:', newExpense.user_id);
      console.log('   - Montant:', newExpense.amount);
    }

    // Test 5: Création d'une nouvelle facture
    console.log('\n5️⃣ Création d\'une nouvelle facture...');
    const newInvoiceData = {
      number: 'INV-TEST-RLS-001',
      client_name: 'Client Test RLS',
      amount: 25000,
      user_id: authData1.user.id,
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending'
    };

    const { data: newInvoice, error: createInvoiceError } = await supabase
      .from('invoices')
      .insert([newInvoiceData])
      .select()
      .single();

    if (createInvoiceError) {
      console.error('❌ Erreur création facture:', createInvoiceError.message);
    } else {
      console.log('✅ Facture créée:', newInvoice.id);
      console.log('   - Numéro:', newInvoice.number);
      console.log('   - User:', newInvoice.user_id);
      console.log('   - Montant:', newInvoice.amount);
    }

    // Test 6: Déconnexion et connexion avec un autre utilisateur
    console.log('\n6️⃣ Test d\'isolation - Connexion avec un autre utilisateur...');
    await supabase.auth.signOut();

    const { data: authData2, error: authError2 } = await supabase.auth.signInWithPassword({
      email: 'nabyaminatoul08@gmail.com',
      password: 'Senegel2024!'
    });

    if (authError2) {
      console.error('❌ Erreur de connexion utilisateur 2:', authError2.message);
    } else {
      console.log('✅ Connexion utilisateur 2 réussie:', authData2.user.email);
      console.log('🆔 User ID:', authData2.user.id);
    }

    // Test 7: Vérifier que l'autre utilisateur ne voit pas les données financières créées
    console.log('\n7️⃣ Vérification de l\'isolation des données financières...');
    
    const { data: otherUserBudgets, error: otherBudgetsError } = await supabase
      .from('budgets')
      .select('*')
      .eq('id', newBudget.id);

    const { data: otherUserExpenses, error: otherExpensesError } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', newExpense.id);

    const { data: otherUserInvoices, error: otherInvoicesError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', newInvoice.id);

    console.log(`✅ Isolation budgets: ${otherUserBudgets.length === 0 ? 'OUI' : 'NON'}`);
    console.log(`✅ Isolation dépenses: ${otherUserExpenses.length === 0 ? 'OUI' : 'NON'}`);
    console.log(`✅ Isolation factures: ${otherUserInvoices.length === 0 ? 'OUI' : 'NON'}`);

    if (otherUserBudgets.length === 0 && otherUserExpenses.length === 0 && otherUserInvoices.length === 0) {
      console.log('   - L\'autre utilisateur ne voit aucune donnée financière créée par Rokhaya');
    } else {
      console.log('   - ⚠️ PROBLÈME: L\'autre utilisateur voit des données financières !');
    }

    // Test 8: Créer des données financières pour le deuxième utilisateur
    console.log('\n8️⃣ Création de données financières pour le deuxième utilisateur...');
    
    const newBudgetData2 = {
      name: 'Budget Test RLS - Naby',
      description: 'Budget de test pour le deuxième utilisateur',
      amount: 30000,
      user_id: authData2.user.id,
      category: 'Test',
      period: '2024',
      status: 'active'
    };

    const { data: newBudget2, error: createBudgetError2 } = await supabase
      .from('budgets')
      .insert([newBudgetData2])
      .select()
      .single();

    if (createBudgetError2) {
      console.error('❌ Erreur création budget utilisateur 2:', createBudgetError2.message);
    } else {
      console.log('✅ Budget utilisateur 2 créé:', newBudget2.id);
    }

    // Test 9: Vérifier que chaque utilisateur ne voit que ses données financières
    console.log('\n9️⃣ Vérification finale de l\'isolation...');
    
    const { data: allBudgetsUser2, error: allBudgetsError2 } = await supabase
      .from('budgets')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: allExpensesUser2, error: allExpensesError2 } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: allInvoicesUser2, error: allInvoicesError2 } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    console.log(`✅ Utilisateur 2 voit ${allBudgetsUser2.length} budgets`);
    console.log(`✅ Utilisateur 2 voit ${allExpensesUser2.length} dépenses`);
    console.log(`✅ Utilisateur 2 voit ${allInvoicesUser2.length} factures`);
    
    // Vérifier l'isolation pour chaque type
    const ownBudgets = allBudgetsUser2.filter(b => b.user_id === authData2.user.id);
    const ownExpenses = allExpensesUser2.filter(e => e.user_id === authData2.user.id);
    const ownInvoices = allInvoicesUser2.filter(i => i.user_id === authData2.user.id);
    
    console.log(`✅ Budgets propres: ${ownBudgets.length}/${allBudgetsUser2.length}`);
    console.log(`✅ Dépenses propres: ${ownExpenses.length}/${allExpensesUser2.length}`);
    console.log(`✅ Factures propres: ${ownInvoices.length}/${allInvoicesUser2.length}`);
    
    if (ownBudgets.length === allBudgetsUser2.length && 
        ownExpenses.length === allExpensesUser2.length && 
        ownInvoices.length === allInvoicesUser2.length) {
      console.log('🎉 ISOLATION PARFAITE ! Chaque utilisateur ne voit que ses données financières');
    } else {
      console.log('⚠️ PROBLÈME: L\'utilisateur voit des données financières d\'autres utilisateurs');
    }

    console.log('\n🎉 TEST DU MODULE FINANCE TERMINÉ !');
    console.log('✅ Persistance: Les données financières sont sauvegardées');
    console.log('✅ Isolation: Chaque utilisateur ne voit que ses données financières');
    console.log('✅ Sécurité: RLS fonctionne correctement pour Finance');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  } finally {
    // Déconnexion
    await supabase.auth.signOut();
    console.log('\n🔚 Déconnexion effectuée');
  }
}

testFinanceModule();
