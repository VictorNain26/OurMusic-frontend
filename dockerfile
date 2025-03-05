# Étape 1 : Build de l'application avec npm
FROM node:18-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json (si présent)
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier l'intégralité du code source
COPY . .

# Construire l'application (pour Vite, le dossier de sortie par défaut est "dist")
RUN npm run build

# Étape 2 : Serve les fichiers buildés avec Nginx
FROM nginx:alpine

# Copier le fichier de configuration Nginx personnalisé
COPY default.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés depuis l'étape "builder" vers le dossier racine de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Lancer Nginx
CMD ["nginx", "-g", "daemon off;"]
