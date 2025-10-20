const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (utiliser les valeurs de votre .env)
const supabaseUrl = 'https://your-project.supabase.co'; // Remplacez par votre URL
const supabaseKey = 'your-anon-key'; // Remplacez par votre clé

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugProjects() {
  console.log('🔍 Débogage des projets...');
  
  try {
    // Récupérer tous les projets
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (projectsError) {
      console.error('❌ Erreur récupération projets:', projectsError);
      return;
    }
    
    console.log(`📊 Total projets dans la base: ${projects.length}`);
    
    if (projects.length > 0) {
      console.log('\n📋 Détails des projets:');
      projects.forEach((project, index) => {
        console.log(`\n${index + 1}. ${project.name || project.title}`);
        console.log(`   ID: ${project.id}`);
        console.log(`   Owner ID: ${project.owner_id}`);
        console.log(`   Team Members: ${JSON.stringify(project.team_members)}`);
        console.log(`   Status: ${project.status}`);
        console.log(`   Created: ${project.created_at}`);
      });
    }
    
    // Récupérer l'utilisateur admin
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@senegel.org');
    
    if (usersError) {
      console.error('❌ Erreur récupération utilisateur:', usersError);
      return;
    }
    
    if (users.length > 0) {
      const adminUser = users[0];
      console.log(`\n👤 Utilisateur admin trouvé:`);
      console.log(`   ID: ${adminUser.id}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   First Name: ${adminUser.first_name}`);
      console.log(`   Name: ${adminUser.name}`);
      
      // Vérifier le filtrage
      const filteredProjects = projects.filter(project => 
        project.owner_id === adminUser.id || 
        (project.team_members && Array.isArray(project.team_members) && project.team_members.includes(adminUser.id))
      );
      
      console.log(`\n🔍 Projets filtrés pour admin: ${filteredProjects.length}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

debugProjects();
