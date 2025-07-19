# ===================
# Étape 1 : Build frontend
# ===================
FROM node:18 AS frontend-build

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build


# ===================
# Étape 2 : Backend + build frontend
# ===================
FROM node:18

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend/ .

COPY --from=frontend-build /frontend/dist ./frontend-build

EXPOSE 5000

CMD ["npm", "start"]
