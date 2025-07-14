FROM node:18

WORKDIR /app

# Étape 1 : Copier uniquement les fichiers nécessaires à l'installation
COPY package*.json ./

# Étape 2 : Installer proprement dans l’environnement Linux du conteneur
RUN npm install

# Étape 3 : Copier le reste du code (sans node_modules)
COPY . .

EXPOSE 5000

CMD ["npm", "start"]
