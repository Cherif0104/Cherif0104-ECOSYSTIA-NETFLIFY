const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

async function getAllSenegelUsers() {
    console.log("👥 LISTE COMPLÈTE DES UTILISATEURS SENEGEL");
    console.log("==========================================\n");

    try {
        // Récupérer tous les utilisateurs de la table users
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error("❌ Erreur récupération utilisateurs:", error.message);
            return;
        }

        if (!users || users.length === 0) {
            console.log("❌ Aucun utilisateur trouvé dans la table users");
            return;
        }

        console.log(`✅ ${users.length} utilisateur(s) trouvé(s)\n`);

        // Afficher chaque utilisateur avec ses détails
        users.forEach((user, index) => {
            console.log(`${index + 1}. 👤 ${user.first_name} ${user.last_name}`);
            console.log(`   📧 Email: ${user.email}`);
            console.log(`   🏢 Rôle: ${user.role || 'Non défini'}`);
            console.log(`   🏢 Département: ${user.department || 'Non défini'}`);
            console.log(`   📅 Créé le: ${new Date(user.created_at).toLocaleDateString('fr-FR')}`);
            console.log(`   🔑 ID: ${user.id}`);
            console.log(`   ✅ Actif: ${user.is_active ? 'Oui' : 'Non'}`);
            console.log(`   📱 Téléphone: ${user.phone || 'Non défini'}`);
            console.log(`   📍 Adresse: ${user.address || 'Non définie'}`);
            console.log("   " + "─".repeat(50));
        });

        // Résumé par rôle
        console.log("\n📊 RÉSUMÉ PAR RÔLE");
        console.log("==================");
        
        const rolesCount = {};
        users.forEach(user => {
            const role = user.role || 'Non défini';
            rolesCount[role] = (rolesCount[role] || 0) + 1;
        });

        Object.entries(rolesCount).forEach(([role, count]) => {
            console.log(`   ${role}: ${count} utilisateur(s)`);
        });

        // Résumé par département
        console.log("\n🏢 RÉSUMÉ PAR DÉPARTEMENT");
        console.log("=========================");
        
        const departmentsCount = {};
        users.forEach(user => {
            const dept = user.department || 'Non défini';
            departmentsCount[dept] = (departmentsCount[dept] || 0) + 1;
        });

        Object.entries(departmentsCount).forEach(([dept, count]) => {
            console.log(`   ${dept}: ${count} utilisateur(s)`);
        });

        console.log("\n🎯 INFORMATIONS DE CONNEXION");
        console.log("============================");
        console.log("Pour tester la connexion de chaque utilisateur :");
        console.log("1. Allez sur http://localhost:5175/");
        console.log("2. Utilisez l'email et le mot de passe de l'utilisateur");
        console.log("3. Tous les utilisateurs ont le mot de passe : 'password123'");

    } catch (error) {
        console.error("❌ Erreur générale:", error.message);
    }
}

getAllSenegelUsers();
