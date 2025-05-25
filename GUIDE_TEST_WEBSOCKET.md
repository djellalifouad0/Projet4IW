# Guide de Test WebSocket - Conversations en Temps Réel

## Étapes pour tester les WebSockets

### 1. Vérifier que les serveurs sont lancés
- Backend : http://localhost:5000
- Frontend : http://localhost:5173

### 2. Test des conversations en temps réel

#### Ouvrir deux navigateurs/onglets
1. Navigateur A : http://localhost:5173
2. Navigateur B : http://localhost:5173

#### Se connecter avec deux utilisateurs différents
- User A : Se connecter avec un compte
- User B : Se connecter avec un autre compte

#### Tester les fonctionnalités WebSocket

1. **Messages en temps réel** :
   - User A envoie un message à User B
   - Le message doit apparaître instantanément chez User B
   - La liste des conversations se met à jour automatiquement

2. **Indicateur de frappe** :
   - User A commence à taper dans le champ message
   - User B doit voir "En train d'écrire..." apparaître
   - Quand User A arrête de taper, l'indicateur disparaît

3. **Synchronisation des conversations** :
   - Les nouveaux messages mettent à jour l'ordre des conversations
   - Le dernier message s'affiche dans la liste des conversations

### 3. Console de développement

Ouvrir la console (F12) pour voir les logs WebSocket :
- ✅ Connecté au serveur WebSocket
- 👥 Rejoint la conversation X
- 💬 Message envoyé/reçu
- ⌨️ Indicateur de frappe

### 4. Test de déconnexion/reconnexion

1. Fermer un onglet et le rouvrir
2. La connexion WebSocket doit se rétablir automatiquement
3. Les messages continuent à fonctionner

## Troubleshooting

### Si les WebSockets ne fonctionnent pas :

1. **Vérifier la console backend** :
   ```
   🚀 Serveur démarré sur http://localhost:5000
   🔌 WebSocket activé
   ```

2. **Vérifier la console frontend** :
   ```
   ✅ Connecté au serveur WebSocket
   WebSocket initialisé
   ```

3. **Erreurs communes** :
   - Token invalide : Vérifier l'authentification
   - CORS : Vérifier la configuration dans server.js
   - Port occupé : Changer le port ou arrêter les autres processus

### Commandes utiles

```powershell
# Tuer les processus Node.js
Get-Process node | Stop-Process -Force

# Vérifier les ports occupés
netstat -ano | findstr :5000
netstat -ano | findstr :5173
```

## Features WebSocket implémentées

✅ Connexion authentifiée avec JWT
✅ Salles de conversation (join/leave)
✅ Messages en temps réel
✅ Indicateur de frappe
✅ Gestion des déconnexions
✅ Synchronisation des conversations
✅ Reconnexion automatique
