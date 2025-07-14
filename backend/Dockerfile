FROM node:18
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Copie du build front dans le backend
COPY --from=frontend-build /app/dist ./frontend-build

EXPOSE 5000
CMD ["npm", "start"]
