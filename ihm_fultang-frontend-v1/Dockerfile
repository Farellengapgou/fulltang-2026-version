# Utiliser une image node stable
FROM node:18-alpine

WORKDIR /app

# Copier uniquement les fichiers de dépendances pour profiter du cache Docker
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tout le reste du code (en ignorant node_modules grâce au .dockerignore)
COPY . .

EXPOSE 9000

# Utiliser le mode développement pour éviter les erreurs de build Rollup
# et permettre de voir vos modifications immédiatement.
CMD [ "npm", "run", "dev", "--", "--host" ]