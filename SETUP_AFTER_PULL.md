# Setup du projet après pull

## Backend

Après avoir pull les dernières modifications qui incluent les nouvelles fonctionnalités de photos de profil, vous devez synchroniser votre base de données :

### Option 1: Avec le script npm (recommandé)
```bash
cd backend
npm run db:sync
```

### Option 2: Avec Sequelize CLI (si vous l'utilisez)
```bash
cd backend
npx sequelize-cli db:migrate
```

### Option 3: Synchronisation manuelle
```bash
cd backend
node -e "const sequelize = require('./config/db'); const User = require('./models/user'); sequelize.sync({ alter: true }).then(() => console.log('Done')).catch(console.error)"
```

## Nouveaux champs ajoutés à la table User :
- `avatar` (TEXT) - Pour stocker les images d'avatar en base64 ou URL
- `cover` (TEXT) - Pour stocker les images de couverture en base64 ou URL  
- `bio` (TEXT) - Pour la biographie de l'utilisateur
- `address` (VARCHAR(500)) - Pour l'adresse de l'utilisateur

## Test

Après la synchronisation, vous pouvez tester la mise à jour des photos de profil dans l'interface utilisateur.
