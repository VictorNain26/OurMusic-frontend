# -------------------------------
# 1) Étape de build avec Bun
# -------------------------------
FROM oven/bun:latest as builder

# Définir le répertoire de travail
WORKDIR /app

# Copier uniquement les fichiers indispensables pour l'installation
COPY package.json ./
COPY bun.lock ./

# Installer les dépendances via Bun
RUN bun install

# Copier le reste du code source
COPY . .

# Construire le projet en mode production
RUN bun run build

# Vérifier que le build a bien généré des fichiers
RUN ls -l /app/dist

# -------------------------------
# 2) Étape finale : servir les fichiers avec Nginx
# -------------------------------
FROM nginx:alpine

# Vérifier que le dossier dist existe bien avant de le copier
RUN mkdir -p /usr/share/nginx/html

# Copier les fichiers buildés vers le dossier de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier la configuration Nginx
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Ouvrir le port 80 (Nginx par défaut)
EXPOSE 80

# Lancer Nginx en premier plan
CMD ["nginx", "-g", "daemon off;"]
