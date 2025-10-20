/**
 * 🧪 SCRIPT DE TEST AUTOMATISÉ - MODULE PROJETS
 * Validation des fonctionnalités principales
 */

import { databases, DATABASE_ID, COLLECTION_IDS } from '../services/appwriteService';
import { ID, Query } from 'appwrite';
import { projectService } from '../services/projectService';
import { projectConnectionsService } from '../services/projectConnectionsService';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration: number;
}

class ProjectsModuleTester {
  private results: TestResult[] = [];
  private testProjectId: string | null = null;

  /**
   * Exécuter tous les tests
   */
  async runAllTests(): Promise<void> {
    console.log('🧪 DÉMARRAGE DES TESTS - MODULE PROJETS');
    console.log('==========================================');

    try {
      await this.testDatabaseConnection();
      await this.testProjectCreation();
      await this.testProjectRetrieval();
      await this.testProjectUpdate();
      await this.testProjectConnections();
      await this.testProjectDeletion();
      await this.testErrorHandling();
      
      this.printResults();
    } catch (error) {
      console.error('❌ Erreur lors de l\'exécution des tests:', error);
    }
  }

  /**
   * Test de connexion à la base de données
   */
  private async testDatabaseConnection(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.PROJECTS,
        [Query.limit(1)]
      );
      
      this.addResult('Database Connection', 'PASS', 'Connexion Appwrite réussie', Date.now() - startTime);
    } catch (error) {
      this.addResult('Database Connection', 'FAIL', `Erreur connexion: ${error}`, Date.now() - startTime);
    }
  }

  /**
   * Test de création de projet
   */
  private async testProjectCreation(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const testProject = {
        title: 'Projet Test Automatisé',
        description: 'Projet créé par les tests automatisés',
        status: 'Not Started' as const,
        priority: 'High' as const,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours
        budget: 50000,
        client: 'Client Test',
        tags: ['test', 'automatisé'],
        team: [],
        tasks: [],
        risks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const createdProject = await projectService.create(testProject, 'test-user-id');
      
      if (createdProject && createdProject.id) {
        this.testProjectId = createdProject.id;
        this.addResult('Project Creation', 'PASS', `Projet créé avec ID: ${createdProject.id}`, Date.now() - startTime);
      } else {
        this.addResult('Project Creation', 'FAIL', 'Échec de création du projet', Date.now() - startTime);
      }
    } catch (error) {
      this.addResult('Project Creation', 'FAIL', `Erreur création: ${error}`, Date.now() - startTime);
    }
  }

  /**
   * Test de récupération de projets
   */
  private async testProjectRetrieval(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test récupération tous les projets
      const allProjects = await projectService.getAll();
      this.addResult('Get All Projects', 'PASS', `${allProjects.length} projets récupérés`, Date.now() - startTime);

      // Test récupération par ID
      if (this.testProjectId) {
        const startTime2 = Date.now();
        const project = await projectService.getById(this.testProjectId);
        if (project) {
          this.addResult('Get Project By ID', 'PASS', `Projet récupéré: ${project.title}`, Date.now() - startTime2);
        } else {
          this.addResult('Get Project By ID', 'FAIL', 'Projet non trouvé', Date.now() - startTime2);
        }
      }
    } catch (error) {
      this.addResult('Project Retrieval', 'FAIL', `Erreur récupération: ${error}`, Date.now() - startTime);
    }
  }

  /**
   * Test de mise à jour de projet
   */
  private async testProjectUpdate(): Promise<void> {
    const startTime = Date.now();
    
    if (!this.testProjectId) {
      this.addResult('Project Update', 'SKIP', 'Pas de projet à mettre à jour', Date.now() - startTime);
      return;
    }

    try {
      const updateData = {
        title: 'Projet Test Modifié',
        status: 'In Progress' as const,
        priority: 'Medium' as const
      };

      const updatedProject = await projectService.update(this.testProjectId, updateData);
      
      if (updatedProject && updatedProject.title === updateData.title) {
        this.addResult('Project Update', 'PASS', 'Projet mis à jour avec succès', Date.now() - startTime);
      } else {
        this.addResult('Project Update', 'FAIL', 'Échec de la mise à jour', Date.now() - startTime);
      }
    } catch (error) {
      this.addResult('Project Update', 'FAIL', `Erreur mise à jour: ${error}`, Date.now() - startTime);
    }
  }

  /**
   * Test des connexions inter-modules
   */
  private async testProjectConnections(): Promise<void> {
    const startTime = Date.now();
    
    if (!this.testProjectId) {
      this.addResult('Project Connections', 'SKIP', 'Pas de projet pour tester les connexions', Date.now() - startTime);
      return;
    }

    try {
      // Test création d'une tâche
      const startTime2 = Date.now();
      const taskData = {
        id: ID.unique(),
        text: 'Tâche test automatisée',
        status: 'To Do' as const,
        priority: 'High' as const,
        assignee: null,
        estimatedTime: 120,
        loggedTime: 0,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      await projectConnectionsService.createProjectTask(this.testProjectId, taskData, 'test-user-id');
      this.addResult('Create Project Task', 'PASS', 'Tâche créée avec succès', Date.now() - startTime2);

      // Test récupération des tâches
      const startTime3 = Date.now();
      const tasks = await projectConnectionsService.getProjectTasks(this.testProjectId);
      this.addResult('Get Project Tasks', 'PASS', `${tasks.length} tâches récupérées`, Date.now() - startTime3);

      // Test création d'un risque
      const startTime4 = Date.now();
      const riskData = {
        id: ID.unique(),
        description: 'Risque test automatisé',
        likelihood: 'Medium' as const,
        impact: 'High' as const,
        mitigationStrategy: 'Stratégie de mitigation test'
      };

      await projectConnectionsService.createProjectRisk(this.testProjectId, riskData, 'test-user-id');
      this.addResult('Create Project Risk', 'PASS', 'Risque créé avec succès', Date.now() - startTime4);

      // Test récupération des risques
      const startTime5 = Date.now();
      const risks = await projectConnectionsService.getProjectRisks(this.testProjectId);
      this.addResult('Get Project Risks', 'PASS', `${risks.length} risques récupérés`, Date.now() - startTime5);

      // Test résumé complet
      const startTime6 = Date.now();
      const summary = await projectConnectionsService.getProjectSummary(this.testProjectId);
      if (summary && summary.project) {
        this.addResult('Project Summary', 'PASS', 'Résumé généré avec succès', Date.now() - startTime6);
      } else {
        this.addResult('Project Summary', 'FAIL', 'Échec génération résumé', Date.now() - startTime6);
      }

      this.addResult('Project Connections', 'PASS', 'Toutes les connexions testées', Date.now() - startTime);
    } catch (error) {
      this.addResult('Project Connections', 'FAIL', `Erreur connexions: ${error}`, Date.now() - startTime);
    }
  }

  /**
   * Test de suppression de projet
   */
  private async testProjectDeletion(): Promise<void> {
    const startTime = Date.now();
    
    if (!this.testProjectId) {
      this.addResult('Project Deletion', 'SKIP', 'Pas de projet à supprimer', Date.now() - startTime);
      return;
    }

    try {
      const deleted = await projectService.delete(this.testProjectId);
      
      if (deleted) {
        this.addResult('Project Deletion', 'PASS', 'Projet supprimé avec succès', Date.now() - startTime);
        this.testProjectId = null; // Marquer comme supprimé
      } else {
        this.addResult('Project Deletion', 'FAIL', 'Échec de la suppression', Date.now() - startTime);
      }
    } catch (error) {
      this.addResult('Project Deletion', 'FAIL', `Erreur suppression: ${error}`, Date.now() - startTime);
    }
  }

  /**
   * Test de gestion d'erreurs
   */
  private async testErrorHandling(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test récupération projet inexistant
      const startTime2 = Date.now();
      const nonExistentProject = await projectService.getById('non-existent-id');
      if (nonExistentProject === null) {
        this.addResult('Error Handling - Non-existent Project', 'PASS', 'Gestion correcte du projet inexistant', Date.now() - startTime2);
      } else {
        this.addResult('Error Handling - Non-existent Project', 'FAIL', 'Devrait retourner null', Date.now() - startTime2);
      }

      // Test suppression projet inexistant
      const startTime3 = Date.now();
      try {
        await projectService.delete('non-existent-id');
        this.addResult('Error Handling - Delete Non-existent', 'FAIL', 'Devrait lever une erreur', Date.now() - startTime3);
      } catch (error) {
        this.addResult('Error Handling - Delete Non-existent', 'PASS', 'Erreur gérée correctement', Date.now() - startTime3);
      }

      this.addResult('Error Handling', 'PASS', 'Gestion d\'erreurs fonctionnelle', Date.now() - startTime);
    } catch (error) {
      this.addResult('Error Handling', 'FAIL', `Erreur gestion d'erreurs: ${error}`, Date.now() - startTime);
    }
  }

  /**
   * Ajouter un résultat de test
   */
  private addResult(test: string, status: 'PASS' | 'FAIL' | 'SKIP', message: string, duration: number): void {
    this.results.push({
      test,
      status,
      message,
      duration
    });

    const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
    console.log(`${statusIcon} ${test}: ${message} (${duration}ms)`);
  }

  /**
   * Afficher les résultats finaux
   */
  private printResults(): void {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    const total = this.results.length;

    console.log('\n📊 RÉSULTATS FINAUX');
    console.log('===================');
    console.log(`✅ Tests réussis : ${passed}/${total}`);
    console.log(`❌ Tests échoués : ${failed}/${total}`);
    console.log(`⏭️ Tests ignorés : ${skipped}/${total}`);

    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    console.log(`⏱️ Durée totale : ${totalDuration}ms`);

    if (failed > 0) {
      console.log('\n❌ TESTS ÉCHOUÉS :');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`  - ${r.test}: ${r.message}`));
    }

    const successRate = ((passed / (total - skipped)) * 100).toFixed(1);
    console.log(`\n🎯 Taux de réussite : ${successRate}%`);

    if (failed === 0) {
      console.log('\n🎉 TOUS LES TESTS SONT PASSÉS !');
      console.log('✅ MODULE PROJETS VALIDÉ POUR LA PRODUCTION');
    } else {
      console.log('\n⚠️ CERTAINS TESTS ONT ÉCHOUÉ');
      console.log('❌ CORRIGER LES PROBLÈMES AVANT LA PRODUCTION');
    }
  }
}

// Exécution des tests si le script est lancé directement
if (require.main === module) {
  const tester = new ProjectsModuleTester();
  tester.runAllTests().catch(console.error);
}

export default ProjectsModuleTester;
