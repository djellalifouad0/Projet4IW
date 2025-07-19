# Test du Système de Paiement Stripe

## Fonctionnalités ajoutées ✅

### 1. Formulaire de création de rendez-vous
- [x] Champ prix ajouté dans `/frontend/src/components/Discussions.vue`
- [x] Validation du prix (obligatoire, > 0)
- [x] Note explicative sur la commission de 11%

### 2. Backend Stripe
- [x] Endpoint POST `/api/appointments/:id/create-payment-session`
- [x] Endpoint POST `/api/appointments/payment-webhook` 
- [x] Endpoint GET `/api/appointments/payment-success`
- [x] Webhook handler pour confirmations de paiement

### 3. Frontend Stripe
- [x] Service `stripeService.js` pour appels API
- [x] Composant `PaymentModal.vue` pour confirmation paiement
- [x] Composant `PaymentSuccess.vue` pour succès paiement
- [x] Affichage prix dans liste rendez-vous

### 4. Flux complet
- [x] Création RDV avec prix → Status 'pending'
- [x] Acceptation → Modal de paiement au lieu d'acceptation directe
- [x] Redirection Stripe → Paiement sécurisé
- [x] Webhook confirmation → Status 'accepted' + 'paid'
- [x] Notifications aux deux utilisateurs

## Tests à effectuer

### 1. Création de rendez-vous
1. Aller dans Discussions
2. Sélectionner une conversation
3. Cliquer "Proposer un rendez-vous"
4. Vérifier que le champ Prix est présent et obligatoire
5. Créer un RDV avec un prix (ex: 25€)

### 2. Acceptation et paiement
1. Se connecter avec l'autre utilisateur
2. Voir le RDV en attente
3. Cliquer "Accepter"
4. Vérifier que la modal de paiement s'affiche
5. Voir le détail: Prix 25€ + Commission 2.75€ = Total 27.75€

### 3. Test paiement (Mode test Stripe)
1. Cliquer "Payer avec Stripe"
2. Utiliser carte test: 4242 4242 4242 4242
3. Compléter le paiement
4. Vérifier redirection vers page de succès
5. Vérifier que le RDV est marqué "payé"

## Configuration Stripe nécessaire

### Backend (.env)
```
STRIPE_SECRET_KEY=sk_test_...  # À remplacer par votre clé
STRIPE_WEBHOOK_SECRET=whsec_...  # À configurer après création webhook
FRONTEND_URL=http://localhost:3000
```

### Dashboard Stripe
1. Créer webhook endpoint: `https://votre-backend.com/api/appointments/payment-webhook`
2. Événements: `checkout.session.completed`
3. Copier le secret du webhook dans STRIPE_WEBHOOK_SECRET

## Remarques techniques

- Commission fixée à 11% dans `appointmentController.js`
- Montants en centimes pour Stripe (multiplication par 100)
- Gestion des erreurs avec messages d'erreur explicites
- Notifications en temps réel via WebSocket
- Interface responsive pour mobile

## Améliorations futures possibles

- [ ] Remboursements automatiques
- [ ] Gestion de plusieurs devises
- [ ] Cartes sauvegardées
- [ ] Abonnements/paiements récurrents
- [ ] Split payments (répartition automatique)
