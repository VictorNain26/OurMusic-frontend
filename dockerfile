# -------------------------------
# 1) Étape de build avec Node.js + Bun
# -------------------------------
FROM node:18-alpine as builder

# Définir le répertoire de travail
WORKDIR /app

# Installer Bun manuellement
RUN apk add --no-cache curl bash \
    && curl -fsSL https://bun.sh/install | bash \
    && mv /root/.bun/bin/bun /usr/local/bin/bun \
    && ln -s /usr/local/bin/bun /usr/bin/bun

# Vérifier que Bun est bien installé
RUN /usr/local/bin/bun --version

# Ajouter Bun au PATH
ENV PATH="/root/.bun/bin:/usr/local/bin:$PATH"

# Copier uniquement les fichiers indispensables pour l'installation
COPY package.json ./
COPY bun.lock ./

# Installer les dépendances via Bun
RUN /usr/local/bin/bun install

# Copier le reste du code source
COPY . .

# Construire le projet en mode production
RUN /usr/local/bin/bun run build

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

# Ouvrir le port 80 (Nginx par défaut)
EXPOSE 80

# Lancer Nginx en premier plan
CMD ["nginx", "-g", "daemon off;"]
