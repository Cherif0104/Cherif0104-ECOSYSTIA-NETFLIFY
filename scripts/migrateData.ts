/**
 * 🔄 SCRIPT DE MIGRATION DES DONNÉES - ECOSYSTIA
 * Migre les données mockées vers Appwrite
 */

import { Client, Databases, ID } from 'appwrite';
import { mockAllUsers, mockProjects, mockCourses, mockJobs, mockInvoices, mockExpenses, mockTimeLogs, mockLeaveRequests, mockContacts, mockDocuments } from '../constants/data';

const client = new Client()
    .setEndpoint('https://sfo.cloud.appwrite.io/v1')
    .setProject('68e54e9c002cb568cfec')
    .setKey('standard_aa282abbf94b3f6d2e95d8333422ee03b00f9c6bb1ad6e50ac9173660b6bcad4be93a1dca6871bab81b04621fed21342d89a4a3ca94bee46f38aebd21b362436ab41953054935b626dc4f4e01862d74fc8fbc28864938f0ab6dd815f76aaade45eabe04906e3db1a6bbfca09e923b89fc2afd6393695cf09cc53fa405d66c72c');

const databases = new Databases(client);
const databaseId = '68e56de100267007af6a';

let successCount = 0;
let errorCount = 0;
const errors: string[] = [];

async function migrateUsers(): Promise<void> {
  console.log('\n👥 Migration des utilisateurs...');
  
  for (const user of mockAllUsers) {
    try {
      await databases.createDocument(
        databaseId,
        'users',
        ID.unique(),
        {
          firstName: user.name.split(' ')[0] || '',
          lastName: user.name.split(' ').slice(1).join(' ') || '',
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          skills: user.skills.join(', '),
          phone: user.phone || '',
        }
      );
      successCount++;
      console.log(`  ✅ ${user.name}`);
    } catch (error: any) {
      errorCount++;
      const errorMsg = `Utilisateur ${user.name}: ${error.message}`;
      errors.push(errorMsg);
      console.error(`  ❌ ${errorMsg}`);
    }
  }
}

async function migrateProjects(): Promise<void> {
  console.log('\n📋 Migration des projets...');
  
  for (const project of mockProjects) {
    try {
      await databases.createDocument(
        databaseId,
        'projects',
        ID.unique(),
        {
          name: project.title,
          description: project.description,
          status: project.status,
          priority: 'Medium',
          startDate: new Date().toISOString().split('T')[0],
          endDate: project.dueDate,
          budget: 0,
          ownerId: project.team[0]?.id?.toString() || '1',
          teamMembers: project.team.map(m => m.id.toString()),
          progress: 0,
          tags: [],
          category: 'General',
        }
      );
      successCount++;
      console.log(`  ✅ ${project.title}`);
    } catch (error: any) {
      errorCount++;
      const errorMsg = `Projet ${project.title}: ${error.message}`;
      errors.push(errorMsg);
      console.error(`  ❌ ${errorMsg}`);
    }
  }
}

async function migrateCourses(): Promise<void> {
  console.log('\n🎓 Migration des cours...');
  
  for (const course of mockCourses) {
    try {
      await databases.createDocument(
        databaseId,
        'courses',
        ID.unique(),
        {
          title: course.title,
          description: course.description || '',
          instructor: course.instructor,
          duration: course.duration,
          level: 'Débutant',
          status: 'actif',
          enrolled: 0,
          roleId: 'student',
        }
      );
      successCount++;
      console.log(`  ✅ ${course.title}`);
    } catch (error: any) {
      errorCount++;
      const errorMsg = `Cours ${course.title}: ${error.message}`;
      errors.push(errorMsg);
      console.error(`  ❌ ${errorMsg}`);
    }
  }
}

async function migrateJobs(): Promise<void> {
  console.log('\n💼 Migration des emplois...');
  
  for (const job of mockJobs) {
    try {
      await databases.createDocument(
        databaseId,
        'jobs',
        ID.unique(),
        {
          title: job.title,
          description: job.description,
          company: job.company,
          location: job.location,
          salary: job.salary,
          type: job.type,
          status: 'Open',
          requirements: '',
        }
      );
      successCount++;
      console.log(`  ✅ ${job.title}`);
    } catch (error: any) {
      errorCount++;
      const errorMsg = `Job ${job.title}: ${error.message}`;
      errors.push(errorMsg);
      console.error(`  ❌ ${errorMsg}`);
    }
  }
}

async function migrateInvoices(): Promise<void> {
  console.log('\n💰 Migration des factures...');
  
  for (const invoice of mockInvoices) {
    try {
      await databases.createDocument(
        databaseId,
        'invoices',
        ID.unique(),
        {
          invoiceNumber: invoice.invoiceNumber,
          clientName: invoice.clientName,
          amount: invoice.amount,
          dueDate: invoice.dueDate,
          status: invoice.status,
          recurringSourceId: invoice.recurringSourceId || 0,
        }
      );
      successCount++;
      console.log(`  ✅ ${invoice.invoiceNumber}`);
    } catch (error: any) {
      errorCount++;
      const errorMsg = `Facture ${invoice.invoiceNumber}: ${error.message}`;
      errors.push(errorMsg);
      console.error(`  ❌ ${errorMsg}`);
    }
  }
}

async function migrateExpenses(): Promise<void> {
  console.log('\n💸 Migration des dépenses...');
  
  for (const expense of mockExpenses) {
    try {
      await databases.createDocument(
        databaseId,
        'expenses',
        ID.unique(),
        {
          category: expense.category,
          description: expense.description,
          amount: expense.amount,
          date: expense.date,
          dueDate: expense.dueDate || '',
          status: expense.status,
          budgetItemId: expense.budgetItemId || '',
          recurringSourceId: expense.recurringSourceId || 0,
        }
      );
      successCount++;
      console.log(`  ✅ ${expense.description.substring(0, 50)}...`);
    } catch (error: any) {
      errorCount++;
      const errorMsg = `Dépense ${expense.description.substring(0, 30)}: ${error.message}`;
      errors.push(errorMsg);
      console.error(`  ❌ ${errorMsg}`);
    }
  }
}

async function migrateContacts(): Promise<void> {
  console.log('\n👥 Migration des contacts CRM...');
  
  for (const contact of mockContacts) {
    try {
      await databases.createDocument(
        databaseId,
        'contacts',
        ID.unique(),
        {
          name: contact.name,
          workEmail: contact.workEmail || '',
          personalEmail: contact.personalEmail || '',
          company: contact.company || '',
          status: contact.status,
          avatar: contact.avatar,
          officePhone: contact.officePhone || '',
          mobilePhone: contact.mobilePhone || '',
          whatsappNumber: contact.whatsappNumber || '',
        }
      );
      successCount++;
      console.log(`  ✅ ${contact.name}`);
    } catch (error: any) {
      errorCount++;
      const errorMsg = `Contact ${contact.name}: ${error.message}`;
      errors.push(errorMsg);
      console.error(`  ❌ ${errorMsg}`);
    }
  }
}

async function migrateDocuments(): Promise<void> {
  console.log('\n📚 Migration des documents...');
  
  for (const doc of mockDocuments) {
    try {
      await databases.createDocument(
        databaseId,
        'documents',
        ID.unique(),
        {
          title: doc.title,
          content: doc.content,
          createdAt: doc.createdAt,
          createdBy: doc.createdBy,
        }
      );
      successCount++;
      console.log(`  ✅ ${doc.title}`);
    } catch (error: any) {
      errorCount++;
      const errorMsg = `Document ${doc.title}: ${error.message}`;
      errors.push(errorMsg);
      console.error(`  ❌ ${errorMsg}`);
    }
  }
}

async function migrateAll(): Promise<void> {
  console.log('🚀 DÉMARRAGE MIGRATION DONNÉES ECOSYSTIA');
  console.log('==========================================\n');

  const startTime = Date.now();

  try {
    await migrateUsers();
    await migrateCourses();
    await migrateJobs();
    await migrateProjects();
    await migrateInvoices();
    await migrateExpenses();
    await migrateContacts();
    await migrateDocuments();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n==========================================');
    console.log('📊 RÉSUMÉ DE LA MIGRATION');
    console.log('==========================================\n');
    console.log(`✅ Succès: ${successCount}`);
    console.log(`❌ Erreurs: ${errorCount}`);
    console.log(`⏱️  Durée: ${duration}s\n`);

    if (errors.length > 0) {
      console.log('❌ ERREURS DÉTAILLÉES:');
      errors.forEach(error => console.log(`  • ${error}`));
      console.log('');
    }

    console.log('🎉 MIGRATION TERMINÉE !');

  } catch (error: any) {
    console.error('\n❌ ERREUR FATALE:', error.message);
    throw error;
  }
}

// Exécuter la migration
migrateAll()
  .then(() => {
    console.log('\n✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script échoué:', error);
    process.exit(1);
  });


