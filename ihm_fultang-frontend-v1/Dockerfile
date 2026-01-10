# Utiliser une image node stable
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances pour profiter du cache Docker
COPY package.json package-lock.json ./

# Installer les dépendances
RUN npm install

# Copier tout le reste du code (en ignorant node_modules grâce au .dockerignore)
COPY . .

# Port exposé
# On choisit le port 5173 de mofif_receptionist pour Vite
EXPOSE 5173

# Commande de démarrage en mode développement
CMD ["npm", "run", "dev", "--", "--host"]
