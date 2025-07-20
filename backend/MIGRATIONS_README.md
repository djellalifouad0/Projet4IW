# Migrations Base de Données

## Pour exécuter les migrations

```bash
# Installer sequelize-cli si pas encore fait
npm install -g sequelize-cli

# Exécuter toutes les migrations
npx sequelize-cli db:migrate

# Voir le statut des migrations
npx sequelize-cli db:migrate:status

# Annuler la dernière migration (si nécessaire)
npx sequelize-cli db:migrate:undo

# Annuler toutes les migrations (attention !)
npx sequelize-cli db:migrate:undo:all
```

## Migrations disponibles

### 20250720-add-profile-fields-to-user.js
Cette migration ajoute les champs nécessaires pour les photos de profil :
- `bio` (TEXT) : Biographie de l'utilisateur
- `address` (VARCHAR(500)) : Adresse de l'utilisateur  
- Modifie `avatar` et `cover` en TEXT pour supporter les données base64

## Configuration

Le fichier `config/config.json` contient la configuration de la base de données pour les migrations.
Assurez-vous que les paramètres correspondent à votre environnement.

## Synchronisation alternative

Si vous préférez utiliser la synchronisation Sequelize sans migrations :

```bash
node sync-db.js
```
