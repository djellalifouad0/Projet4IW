# Intégration Stripe pour les Paiements de Rendez-vous

## Vue d'ensemble

Le système permet aux utilisateurs de proposer des rendez-vous avec un prix, et quand l'autre utilisateur accepte, il est redirigé vers une page de paiement Stripe.

## Fonctionnalités implémentées

### Backend (Node.js/Express)

1. **Modèle Appointment étendu** - Contient déjà les champs:
   - `price` : Prix du service
   - `commission` : Commission de la plateforme (11%)
   - `totalPrice` : Prix total à payer
   - `paymentStatus` : 'unpaid' ou 'paid'

2. **Nouveaux endpoints API:**
   - `POST /api/appointments/:id/create-payment-session` - Crée une session de paiement Stripe
   - `POST /api/appointments/payment-webhook` - Webhook pour confirmer les paiements
   - `GET /api/appointments/payment-success` - Vérifie le succès d'un paiement

3. **Flux de paiement:**
   - Quand un RDV est accepté, au lieu de l'accepter directement, l'API renvoie `requiresPayment: true`
   - Une session Stripe est créée avec redirection vers `/appointments/payment-success`
   - Le webhook confirme le paiement et met à jour le statut à 'accepted' + 'paid'

### Frontend (Vue.js)

1. **Nouveau service StripeService** (`/src/services/stripeService.js`)
   - Gère la création des sessions de paiement
   - Vérifie le succès des paiements

2. **Composant PaymentModal** (`/src/components/PaymentModal.vue`)
   - Modal qui s'affiche quand un RDV nécessite un paiement
   - Affiche le détail des prix et redirige vers Stripe

3. **Composant PaymentSuccess** (`/src/components/PaymentSuccess.vue`)
   - Page de confirmation après paiement réussi
   - Vérifie automatiquement le statut du paiement

4. **Modifications du composant Profile:**
   - Affiche les informations de prix dans les rendez-vous
   - Gère l'ouverture de la modal de paiement
   - Affiche le statut de paiement (payé/non payé)

## Configuration requise

### Variables d'environnement (Backend)

```env
STRIPE_SECRET_KEY=sk_test_...  # Votre clé secrète Stripe
STRIPE_WEBHOOK_SECRET=whsec_...  # Secret du webhook Stripe
FRONTEND_URL=http://localhost:3000  # URL du frontend
```

### Configuration Stripe

1. Créer un compte Stripe (mode test)
2. Récupérer les clés API dans le dashboard Stripe
3. Configurer un webhook pointant vers: `https://votre-backend.com/api/appointments/payment-webhook`
4. Événements à écouter: `checkout.session.completed`

## Flux utilisateur

1. **Création d'un RDV:** L'utilisateur propose un RDV avec un prix
2. **Acceptation:** Le destinataire clique sur "Accepter"
3. **Modal de paiement:** Une popup s'affiche avec le détail des coûts
4. **Redirection Stripe:** L'utilisateur est redirigé vers Stripe pour payer
5. **Confirmation:** Après paiement, retour sur la page de succès
6. **Webhook:** Stripe notifie le backend, qui met à jour le RDV
7. **Notifications:** Les deux utilisateurs reçoivent des notifications

## Sécurité

- Utilisation des webhooks Stripe pour confirmer les paiements
- Vérification des signatures des webhooks
- Validation des montants côté serveur
- Authentification requise pour tous les endpoints

## Commission plateforme

Le système applique automatiquement une commission de 11% sur tous les rendez-vous.
- Prix du service: 50€
- Commission (11%): 5.50€  
- Total à payer: 55.50€

## Tests

Pour tester en mode développement:
1. Utiliser les cartes de test Stripe (4242 4242 4242 4242)
2. Configurer les webhooks avec ngrok ou un tunnel similaire
3. Vérifier les logs dans le dashboard Stripe

## Prochaines améliorations possibles

- Remboursements automatiques en cas d'annulation
- Paiements récurrents pour des services d'abonnement
- Split payments (répartition automatique entre prestataire et plateforme)
- Support de plusieurs devises
- Sauvegarde des méthodes de paiement
