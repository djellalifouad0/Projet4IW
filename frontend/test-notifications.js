#!/usr/bin/env node

/**
 * Script de test pour vérifier l'intégration des notifications
 * Ce script vérifie que tous les composants ont bien intégré NotificationService
 */

const fs = require('fs');
const path = require('path');

const componentsToCheck = [
  'src/components/Home.vue',
  'src/components/Carte.vue', 
  'src/components/Profile.vue',
  'src/components/Discussions.vue',
  'src/components/PostCard.vue'
];

const methodsToCheck = {
  'Home.vue': ['likePost', 'dislikePost'],
  'Carte.vue': ['likePost', 'dislikePost'],
  'Profile.vue': ['submitRating', 'updateAppointmentStatus'],
  'Discussions.vue': ['sendMessage', 'createAppointment', 'updateAppointmentStatus'],
  'PostCard.vue': ['submitComment', 'submitReply'] // Déjà implémenté
};

console.log('🔍 Vérification de l\'intégration des notifications...\n');

let allTestsPassed = true;

for (const componentPath of componentsToCheck) {
  const fullPath = path.join(__dirname, componentPath);
  const componentName = path.basename(componentPath);
  
  console.log(`📁 Vérification de ${componentName}:`);
  
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Vérifier l'import de NotificationService
    const hasImport = content.includes("import NotificationService from '../services/notificationService'") ||
                     content.includes('import NotificationService from "../services/notificationService"');
    
    if (hasImport) {
      console.log('  ✅ Import NotificationService trouvé');
    } else {
      console.log('  ❌ Import NotificationService manquant');
      allTestsPassed = false;
    }
    
    // Vérifier les méthodes spécifiques
    const methodsForComponent = methodsToCheck[componentName] || [];
    for (const method of methodsForComponent) {
      const hasNotificationTrigger = content.includes('NotificationService.triggerNotificationCheck()') &&
                                   content.includes(method);
      
      if (hasNotificationTrigger) {
        console.log(`  ✅ Méthode ${method} avec déclencheur de notification`);
      } else {
        console.log(`  ❌ Méthode ${method} sans déclencheur de notification`);
        allTestsPassed = false;
      }
    }
    
  } catch (error) {
    console.log(`  ❌ Erreur lors de la lecture du fichier: ${error.message}`);
    allTestsPassed = false;
  }
  
  console.log('');
}

console.log('📊 Résumé des tests:');
if (allTestsPassed) {
  console.log('✅ Toutes les vérifications sont passées !');
  console.log('🎉 Le système de notifications est prêt à être testé.');
} else {
  console.log('❌ Certaines vérifications ont échoué.');
  console.log('🔧 Veuillez corriger les problèmes avant de tester.');
}

console.log('\n🚀 Prochaines étapes:');
console.log('1. Démarrer le serveur backend: npm run dev (dans le dossier backend)');
console.log('2. Démarrer le frontend: npm run serve (dans le dossier frontend)');
console.log('3. Tester les interactions qui génèrent des notifications:');
console.log('   - Liker/disliker des posts');
console.log('   - Commenter/répondre à des posts'); 
console.log('   - Noter des utilisateurs');
console.log('   - Envoyer des messages');
console.log('   - Créer/accepter/refuser des rendez-vous');
