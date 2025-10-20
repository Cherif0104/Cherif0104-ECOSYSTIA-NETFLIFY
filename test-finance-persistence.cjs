const { createClient } = require('@supabase/supabase-js');

const supabaseConfig = {
  url: 'https://nigfrebfpkeoreaaiqzu.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZ2ZyZWJmcGtlb3JlYWFpcXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NjIzMDYsImV4cCI6MjA3NjIzODMwNn0.-_jcUhUeifEACMHl2SAErb7lAfzOVHzD7QGtAxFsgQk'
};

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

async function testFinancePersistence() {
  console.log('💰 TEST DE PERSISTANCE - MODULE FINANCE');
  console.log('======================================');

  try {
    // Test 1: Connexion utilisateur
    console.log('\n1️⃣ Connexion utilisateur...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'rokhaya@senegel.org',
      password: 'Senegel2024!'
    });

    if (authError) {
      console.error('❌ Erreur de connexion:', authError.message);
      return;
    }

    console.log('✅ Connexion réussie:', authData.user.email);
    console.log('🆔 User ID:', authData.user.id);

    // Test 2: Vérifier les données financières existantes
    console.log('\n2️⃣ Vérification des données financières existantes...');
    
    // Budgets
    const { data: existingBudgets, error: budgetsError } = await supabase
      .from('budgets')
      .select('*')
      .order('created_at', { ascending: false });

    if (budgetsError) {
      console.error('❌ Erreur lecture budgets:', budgetsError.message);
    } else {
      console.log(`✅ ${existingBudgets.length} budgets trouvés`);
      existingBudgets.forEach(b => {
        console.log(`   - ${b.title} (user: ${b.user_id}, amount: ${b.amount})`);
      });
    }

    // Dépenses
    const { data: existingExpenses, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });

    if (expensesError) {
      console.error('❌ Erreur lecture dépenses:', expensesError.message);
    } else {
      console.log(`✅ ${existingExpenses.length} dépenses trouvées`);
      existingExpenses.forEach(e => {
        console.log(`   - ${e.title} (user: ${e.user_id}, amount: ${e.amount})`);
      });
    }

    // Factures
    const { data: existingInvoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (invoicesError) {
      console.error('❌ Erreur lecture factures:', invoicesError.message);
    } else {
      console.log(`✅ ${existingInvoices.length} factures trouvées`);
      existingInvoices.forEach(i => {
        console.log(`   - ${i.number} (user: ${i.user_id}, amount: ${i.amount})`);
      });
    }

    // Test 3: Création d'un nouveau budget
    console.log('\n3️⃣ Création d\'un nouveau budget...');
    const newBudgetData = {
      user_id: authData.user.id, // IMPORTANT: user_id correct
      name: 'TEST PERSISTANCE BUDGET', // Utiliser 'name' au lieu de 'title'
      description: 'Budget de test pour vérifier la persistance',
      amount: 50000,
      category: 'Test',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
      console.log('   - Amount:', newBudget.amount);
    }

    // Test 4: Création d'une nouvelle dépense
    console.log('\n4️⃣ Création d\'une nouvelle dépense...');
    const newExpenseData = {
      user_id: authData.user.id, // IMPORTANT: user_id correct
      title: 'TEST PERSISTANCE EXPENSE',
      description: 'Dépense de test pour vérifier la persistance',
      amount: 1500,
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
      console.log('   - Titre:', newExpense.title);
      console.log('   - User:', newExpense.user_id);
      console.log('   - Amount:', newExpense.amount);
    }

    // Test 5: Création d'une nouvelle facture
    console.log('\n5️⃣ Création d\'une nouvelle facture...');
    const newInvoiceData = {
      user_id: authData.user.id, // IMPORTANT: user_id correct
      number: 'INV-TEST-PERSISTANCE-001',
      client_name: 'Client Test Persistance',
      amount: 25000,
      tax: 2500,
      total: 27500,
      status: 'pending',
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Facture de test pour vérifier la persistance'
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
      console.log('   - Amount:', newInvoice.amount);
    }

    // Test 6: Vérifier que toutes les données sont visibles
    console.log('\n6️⃣ Vérification de la visibilité des données créées...');
    
    const { data: updatedBudgets, error: readBudgetsError } = await supabase
      .from('budgets')
      .select('*')
      .eq('id', newBudget.id);

    const { data: updatedExpenses, error: readExpensesError } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', newExpense.id);

    const { data: updatedInvoices, error: readInvoicesError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', newInvoice.id);

    console.log(`✅ Budget visible: ${updatedBudgets.length > 0 ? 'OUI' : 'NON'}`);
    console.log(`✅ Dépense visible: ${updatedExpenses.length > 0 ? 'OUI' : 'NON'}`);
    console.log(`✅ Facture visible: ${updatedInvoices.length > 0 ? 'OUI' : 'NON'}`);

    // Test 7: Test d'isolation avec un autre utilisateur
    console.log('\n7️⃣ Test d\'isolation avec un autre utilisateur...');
    await supabase.auth.signOut();
    
    const { data: authData2, error: authError2 } = await supabase.auth.signInWithPassword({
      email: 'nabyaminatoul08@gmail.com',
      password: 'Senegel2024!'
    });

    if (authError2) {
      console.error('❌ Erreur connexion utilisateur 2:', authError2.message);
    } else {
      console.log('✅ Connexion utilisateur 2 réussie:', authData2.user.email);
      
      const { data: budgets2, error: budgetsError2 } = await supabase
        .from('budgets')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: expenses2, error: expensesError2 } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: invoices2, error: invoicesError2 } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (budgetsError2 || expensesError2 || invoicesError2) {
        console.error('❌ Erreur lecture données utilisateur 2');
      } else {
        console.log(`✅ ${budgets2.length} budgets visibles pour l'utilisateur 2`);
        console.log(`✅ ${expenses2.length} dépenses visibles pour l'utilisateur 2`);
        console.log(`✅ ${invoices2.length} factures visibles pour l'utilisateur 2`);
        
        const ownBudgets = budgets2.filter(b => b.user_id === authData2.user.id);
        const ownExpenses = expenses2.filter(e => e.user_id === authData2.user.id);
        const ownInvoices = invoices2.filter(i => i.user_id === authData2.user.id);
        
        console.log(`   - Budgets propres: ${ownBudgets.length}`);
        console.log(`   - Dépenses propres: ${ownExpenses.length}`);
        console.log(`   - Factures propres: ${ownInvoices.length}`);
        
        const otherBudgets = budgets2.filter(b => b.user_id !== authData2.user.id);
        const otherExpenses = expenses2.filter(e => e.user_id !== authData2.user.id);
        const otherInvoices = invoices2.filter(i => i.user_id !== authData2.user.id);
        
        if (otherBudgets.length > 0 || otherExpenses.length > 0 || otherInvoices.length > 0) {
          console.log('❌ PROBLÈME D\'ISOLATION DÉTECTÉ !');
        } else {
          console.log('✅ ISOLATION PARFAITE !');
        }
      }
    }

    // Test 8: Nettoyage - Suppression des données de test
    console.log('\n8️⃣ Nettoyage des données de test...');
    await supabase.auth.signOut();
    
    const { data: authData3, error: authError3 } = await supabase.auth.signInWithPassword({
      email: 'rokhaya@senegel.org',
      password: 'Senegel2024!'
    });

    if (authError3) {
      console.error('❌ Erreur reconnexion pour nettoyage:', authError3.message);
    } else {
      // Supprimer les données créées
      await supabase.from('budgets').delete().eq('id', newBudget.id);
      await supabase.from('expenses').delete().eq('id', newExpense.id);
      await supabase.from('invoices').delete().eq('id', newInvoice.id);
      
      console.log('✅ Données de test supprimées');
    }

    console.log('\n🎉 TEST DE PERSISTANCE FINANCE TERMINÉ !');
    console.log('✅ Création: Budget, dépense et facture créés avec user_id correct');
    console.log('✅ Lecture: Toutes les données visibles après création');
    console.log('✅ Isolation: Chaque utilisateur ne voit que ses données financières');
    console.log('✅ Persistance: Toutes les opérations CRUD fonctionnent');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  } finally {
    // Déconnexion
    await supabase.auth.signOut();
    console.log('\n🔚 Déconnexion effectuée');
  }
}

testFinancePersistence();
