FROM node:20

WORKDIR /usr/src/app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code source
COPY . .

# Créer les répertoires nécessaires
RUN mkdir -p src/config

EXPOSE 3000

CMD ["npm", "start"]