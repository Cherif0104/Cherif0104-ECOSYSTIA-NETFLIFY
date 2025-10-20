const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

async function populateAllModules() {
    console.log("🚀 PEUPLEMENT DE TOUS LES MODULES");
    console.log("=================================\n");

    try {
        // 1. Goals (OKRs)
        console.log("1️⃣ Création d'objectifs...");
        const objectives = [
            {
                title: "Augmenter les ventes de 25%",
                description: "Objectif trimestriel pour améliorer les performances commerciales",
                status: "In Progress",
                priority: "High",
                start_date: "2024-01-01",
                end_date: "2024-03-31",
                progress: 65,
                owner_id: "00000000-0000-0000-0000-000000000000",
                category: "Commercial",
                owner_name: "Jean Dupont",
                team_members: ["user1", "user2"],
                quarter: "Q1",
                year: 2024
            },
            {
                title: "Améliorer la satisfaction client",
                description: "Atteindre 90% de satisfaction client",
                status: "Not Started",
                priority: "Medium",
                start_date: "2024-02-01",
                end_date: "2024-06-30",
                progress: 0,
                owner_id: "00000000-0000-0000-0000-000000000000",
                category: "Service Client",
                owner_name: "Marie Martin",
                team_members: ["user3", "user4"],
                quarter: "Q2",
                year: 2024
            }
        ];

        for (const obj of objectives) {
            const { error } = await supabase.from('objectives').insert([obj]);
            if (error) console.log(`❌ Erreur objectif: ${error.message}`);
        }
        console.log("✅ Objectifs créés");

        // 2. Time Tracking
        console.log("\n2️⃣ Création d'entrées de temps...");
        const timeLogs = [
            {
                user_id: "00000000-0000-0000-0000-000000000000",
                project_id: "00000000-0000-0000-0000-000000000000",
                task_name: "Développement fonctionnalité",
                date: "2024-01-15",
                hours: 8,
                description: "Travail sur la nouvelle fonctionnalité de reporting"
            },
            {
                user_id: "00000000-0000-0000-0000-000000000000",
                project_id: "00000000-0000-0000-0000-000000000000",
                task_name: "Réunion équipe",
                date: "2024-01-16",
                hours: 2,
                description: "Réunion hebdomadaire avec l'équipe"
            }
        ];

        for (const log of timeLogs) {
            const { error } = await supabase.from('time_logs').insert([log]);
            if (error) console.log(`❌ Erreur time log: ${error.message}`);
        }
        console.log("✅ Entrées de temps créées");

        // 3. Finance - Invoices
        console.log("\n3️⃣ Création de factures...");
        const invoices = [
            {
                invoice_number: "INV-2024-001",
                client_name: "Client ABC",
                amount: 1500.00,
                status: "paid",
                due_date: "2024-02-15",
                created_at: "2024-01-15"
            },
            {
                invoice_number: "INV-2024-002",
                client_name: "Client XYZ",
                amount: 2300.50,
                status: "pending",
                due_date: "2024-02-28",
                created_at: "2024-01-20"
            }
        ];

        for (const inv of invoices) {
            const { error } = await supabase.from('invoices').insert([inv]);
            if (error) console.log(`❌ Erreur facture: ${error.message}`);
        }
        console.log("✅ Factures créées");

        // 4. Finance - Expenses
        console.log("\n4️⃣ Création de dépenses...");
        const expenses = [
            {
                description: "Matériel de bureau",
                amount: 150.00,
                category: "Office Supplies",
                date: "2024-01-10",
                status: "approved"
            },
            {
                description: "Formation équipe",
                amount: 500.00,
                category: "Training",
                date: "2024-01-12",
                status: "pending"
            }
        ];

        for (const exp of expenses) {
            const { error } = await supabase.from('expenses').insert([exp]);
            if (error) console.log(`❌ Erreur dépense: ${error.message}`);
        }
        console.log("✅ Dépenses créées");

        // 5. Knowledge Base
        console.log("\n5️⃣ Création d'articles...");
        const articles = [
            {
                title: "Guide d'utilisation du système",
                content: "Ce guide explique comment utiliser efficacement notre système...",
                category: "Documentation",
                status: "published",
                author: "Admin"
            },
            {
                title: "Procédures de sécurité",
                content: "Les procédures de sécurité à suivre dans l'entreprise...",
                category: "Sécurité",
                status: "published",
                author: "Admin"
            }
        ];

        for (const art of articles) {
            const { error } = await supabase.from('knowledge_articles').insert([art]);
            if (error) console.log(`❌ Erreur article: ${error.message}`);
        }
        console.log("✅ Articles créés");

        // 6. Jobs
        console.log("\n6️⃣ Création d'offres d'emploi...");
        const jobs = [
            {
                title: "Développeur Full Stack",
                company: "ECOSYSTIA",
                location: "Dakar, Sénégal",
                type: "Full-time",
                salary: "1,500,000 - 2,500,000 XOF",
                description: "Nous recherchons un développeur full stack expérimenté...",
                status: "active"
            },
            {
                title: "Chef de Projet",
                company: "ECOSYSTIA",
                location: "Dakar, Sénégal",
                type: "Full-time",
                salary: "2,000,000 - 3,000,000 XOF",
                description: "Poste de chef de projet pour gérer nos projets clients...",
                status: "active"
            }
        ];

        for (const job of jobs) {
            const { error } = await supabase.from('jobs').insert([job]);
            if (error) console.log(`❌ Erreur job: ${error.message}`);
        }
        console.log("✅ Offres d'emploi créées");

        // 7. Courses
        console.log("\n7️⃣ Création de cours...");
        const courses = [
            {
                title: "Introduction à React",
                description: "Cours complet pour apprendre React de A à Z",
                instructor: "Jean Dupont",
                duration: 40,
                level: "Beginner",
                price: 50000,
                status: "active"
            },
            {
                title: "Gestion de Projet Agile",
                description: "Maîtrisez les méthodologies agiles",
                instructor: "Marie Martin",
                duration: 30,
                level: "Intermediate",
                price: 75000,
                status: "active"
            }
        ];

        for (const course of courses) {
            const { error } = await supabase.from('courses').insert([course]);
            if (error) console.log(`❌ Erreur cours: ${error.message}`);
        }
        console.log("✅ Cours créés");

        console.log("\n🎉 PEUPLEMENT TERMINÉ !");
        console.log("Tous les modules ont maintenant des données de test.");

    } catch (error) {
        console.error(`❌ Erreur générale: ${error.message}`);
    }
}

populateAllModules();
