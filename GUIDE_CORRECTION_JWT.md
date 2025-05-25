# 🔧 Guide de Test - Correction JWT WebSocket

## 📋 Résumé des Corrections Apportées

### 🔑 Problèmes Identifiés et Corrigés

1. **Clé secrète JWT incohérente**
   - `authController.js` utilisait : `'votre_clé_secrète'`
   - `server.js` utilisait : `process.env.JWT_SECRET || 'SECRET_KEY'`
   - ✅ **Corrigé** : Les deux utilisent maintenant `'votre_clé_secrète'`

2. **Propriétés du token JWT manquantes**
   - Ancien token : `{ id: user.id, role: user.role }`
   - WebSocket attendait : `decoded.userId` et `decoded.profileToken`
   - ✅ **Corrigé** : Nouveau token inclut :
     ```javascript
     {
       id: user.id,
       userId: user.id,        // Pour compatibilité WebSocket
       role: user.role,
       profileToken: user.profileToken
     }
     ```

3. **Gestion d'erreurs WebSocket améliorée**
   - ✅ Connexion Promise-based avec timeout
   - ✅ Messages d'erreur plus détaillés
   - ✅ Gestion des sessions expirées

### 📁 Fichiers Modifiés

- `backend/controllers/authController.js` - Correction création token JWT
- `backend/server.js` - Correction clé secrète WebSocket
- `frontend/src/services/socket.js` - Amélioration gestion erreurs
- `frontend/src/components/Discussions.vue` - Meilleure initialisation WebSocket

## 🧪 Tests à Effectuer

### 1. Test Backend (Serveur)

```bash
# Terminal 1 - Démarrer le serveur backend
cd backend
npm start
```

Vérifier que le serveur affiche :
```
🚀 Serveur démarré sur http://localhost:5000
🔌 WebSocket activé
```

### 2. Test Frontend (Client)

```bash
# Terminal 2 - Démarrer le frontend
cd frontend
npm run dev
```

### 3. Test JWT avec Page de Test

1. Ouvrir `test-jwt-correction.html` dans un navigateur
2. Cliquer "Se connecter (simuler)"
3. Vérifier que le token contient les bonnes propriétés
4. Cliquer "Tester Connexion WebSocket"
5. ✅ Succès si "WebSocket connecté avec succès !"

### 4. Test Application Principale

1. Aller sur `http://localhost:3000` (ou port frontend)
2. Se connecter avec un compte existant
3. Aller dans **Discussions**
4. Vérifier dans la console :
   - ✅ "Connecté au serveur WebSocket avec succès"
   - ❌ Plus d'erreur "Token invalide"

## 🔍 Débogage

### Si "Token invalide" persiste :

1. **Vérifier la base de données**
   ```bash
   # S'assurer que les utilisateurs ont un profileToken
   cd backend
   node -e "
   const User = require('./models/user');
   User.findAll().then(users => {
     users.forEach(u => console.log(\`User \${u.id}: profileToken = \${u.profileToken}\`));
     process.exit();
   });
   "
   ```

2. **Vérifier le token dans le navigateur**
   - F12 → Console
   - `localStorage.getItem('token')`
   - Décoder sur jwt.io pour voir le contenu

3. **Logs serveur détaillés**
   - Ajouter dans `server.js` avant `jwt.verify` :
   ```javascript
   console.log('🔍 Token reçu:', token.substring(0, 50) + '...');
   ```

### Si WebSocket ne se connecte pas :

1. **Vérifier les ports**
   - Backend : `http://localhost:5000`
   - Frontend : `http://localhost:3000` ou `5173`
   - CORS configuré pour les deux

2. **Tester connexion simple**
   ```bash
   # Test connexion serveur
   curl http://localhost:5000/api-docs
   ```

## 📊 Statut Attendu

Après ces corrections :

- ✅ WebSocket s'authentifie correctement
- ✅ Messages en temps réel fonctionnent
- ✅ Indicateurs de frappe marchent
- ✅ Statuts en ligne/hors ligne
- ✅ Plus d'erreur "Token invalide"

## 🎯 Prochaines Étapes

Une fois le WebSocket fonctionnel :

1. **Tester toutes les fonctionnalités temps réel**
   - Envoi de messages
   - Réception en temps réel
   - Indicateurs de frappe
   - Statuts de connexion

2. **Optimisations possibles**
   - Reconnexion automatique
   - Gestion hors ligne
   - Notifications push

3. **Tests multi-utilisateurs**
   - Ouvrir plusieurs onglets
   - Tester avec différents comptes
   - Vérifier la synchronisation
