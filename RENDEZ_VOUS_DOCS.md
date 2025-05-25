# Fonctionnalité de Rendez-vous

## Vue d'ensemble

Cette fonctionnalité permet aux utilisateurs de programmer des rendez-vous directement depuis leurs conversations. Elle comprend :

1. **Création de rendez-vous** depuis les discussions
2. **Gestion des rendez-vous** dans le profil utilisateur
3. **Statuts de rendez-vous** (en attente, accepté, refusé, annulé)

## Utilisation

### 1. Créer un rendez-vous

1. Ouvrez une conversation avec un utilisateur
2. Cliquez sur le bouton calendrier 📅 à côté du bouton "Envoyer"
3. Remplissez le formulaire :
   - **Titre** : Objet du rendez-vous (obligatoire)
   - **Date** : Date du rendez-vous (obligatoire)
   - **Heure** : Heure du rendez-vous (obligatoire)
   - **Lieu** : Lieu de rencontre (optionnel)
   - **Description** : Détails supplémentaires (optionnel)
4. Cliquez sur "Proposer"

### 2. Gérer les rendez-vous

Les rendez-vous apparaissent dans votre profil avec :
- **Statut actuel** : Badge coloré indiquant l'état
- **Détails** : Date, heure, lieu, description
- **Actions** : Accepter/Refuser (si vous êtes le destinataire) ou Annuler (si vous êtes l'initiateur)

### 3. Statuts des rendez-vous

- 🟡 **En attente** : Rendez-vous proposé, en attente de réponse
- 🟢 **Accepté** : Rendez-vous confirmé par les deux parties
- 🔴 **Refusé** : Rendez-vous décliné par le destinataire
- ⚫ **Annulé** : Rendez-vous annulé par l'initiateur

## Fonctionnalités techniques

### API Endpoints

- `POST /api/appointments` - Créer un rendez-vous
- `GET /api/appointments` - Récupérer les rendez-vous de l'utilisateur
- `PATCH /api/appointments/:id/status` - Mettre à jour le statut
- `DELETE /api/appointments/:id` - Supprimer un rendez-vous

### Base de données

Table `Appointments` avec les champs :
- `id` : Identifiant unique
- `requesterId` : ID de l'utilisateur qui propose
- `receiverId` : ID de l'utilisateur qui reçoit
- `conversationId` : ID de la conversation associée
- `title` : Titre du rendez-vous
- `description` : Description optionnelle
- `appointmentDate` : Date et heure du rendez-vous
- `status` : Statut (pending, accepted, declined, cancelled)
- `location` : Lieu optionnel

### Sécurité

- Authentification requise pour toutes les opérations
- Validation des permissions (seuls les participants peuvent modifier)
- Validation des dates (rendez-vous dans le futur uniquement)

## Interface utilisateur

### Dans les discussions
- Bouton calendrier 📅 dans la barre de saisie
- Modal de création avec formulaire complet
- Message système confirmant la création

### Dans le profil
- Section dédiée aux rendez-vous (visible uniquement sur son propre profil)
- Cartes de rendez-vous avec toutes les informations
- Boutons d'action contextuel selon le statut et le rôle

## Améliorations futures possibles

1. **Notifications** : Alertes pour nouveaux rendez-vous et changements de statut
2. **Calendrier** : Vue calendrier pour visualiser tous les rendez-vous
3. **Rappels** : Notifications avant les rendez-vous confirmés
4. **Récurrence** : Rendez-vous récurrents
5. **Intégration** : Export vers calendriers externes (Google Calendar, etc.)
6. **Géolocalisation** : Suggestions de lieux basées sur la position
7. **Vidéoconférence** : Liens automatiques pour rendez-vous en ligne
