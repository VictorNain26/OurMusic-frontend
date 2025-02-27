# -------------------------------
# 1) Étape de build avec Bun
# -------------------------------
FROM oven/bun:latest as builder

# Définir le répertoire de travail
WORKDIR /app

# Copier uniquement les fichiers indispensables pour l'installation
COPY package.json ./
# Copier le fichier de lock Bun (si vous l'avez déjà)
COPY bun.lock ./

# Installer les dépendances via Bun
RUN bun install

# Copier le reste du code source
COPY . .

# Construire le projet en mode production
RUN bun run build

# -------------------------------
# 2) Étape finale : servir les fichiers avec Nginx
# -------------------------------
FROM nginx:alpine

# Copier les fichiers buildés depuis l'étape "builder" vers le dossier
# par défaut de Nginx : /usr/share/nginx/html
COPY --from=builder /app/dist /usr/share/nginx/html

# Ouvrir le port 80 (Nginx par défaut)
EXPOSE 80

# Lancer Nginx
CMD ["nginx", "-g", "daemon off;"]
