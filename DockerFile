# Étape 1 : Build du frontend
FROM node:18 AS frontend-build

WORKDIR /frontend

# Installer les dépendances frontend
COPY frontend/package*.json ./
RUN npm install

# Copier le code frontend et builder
COPY frontend/ .
RUN npm run build

# Étape 2 : Backend
FROM node:18

WORKDIR /app

# Installer les dépendances backend
COPY backend/package*.json ./
RUN npm install

# Copier le code backend
COPY backend/ .

# Copier le build frontend dans le backend
COPY --from=frontend-build /frontend/dist ./frontend-build

EXPOSE 5000

CMD ["npm", "start"]
