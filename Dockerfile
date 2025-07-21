# ===================
# Étape 1 : Build frontend
# ===================
FROM node:20 AS frontend-build

# Dossier de travail pour le frontend
WORKDIR /frontend

# Copier TOUT le frontend d'un coup pour éviter les pièges de cache
COPY frontend/ ./

# Installer les dépendances et builder
RUN npm install
RUN npm run build


# ===================
# Étape 2 : Backend + build frontend
# ===================
FROM node:20

# Dossier de travail pour le backend
WORKDIR /app

# Copier TOUT le backend d'un coup
COPY backend/ ./

# Installer les dépendances backend
RUN npm install

# Copier le build du frontend
COPY --from=frontend-build /frontend/dist ./frontend-build

# Exposer le port du serveur backend
EXPOSE 5000

# Commande pour démarrer l'app
CMD ["npm", "start"]
