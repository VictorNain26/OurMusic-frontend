# Utiliser l'image Node 18 Alpine (minimale)
FROM node:18-alpine

# Installer les paquets nécessaires (on ajoute firefox)
RUN apk add --no-cache curl unzip bash

# Installer Bun via le script officiel
RUN curl -fsSL https://bun.sh/install | bash

# Ajouter Bun au PATH
ENV BUN_INSTALL="/root/.bun"
ENV PATH="${BUN_INSTALL}/bin:${PATH}"

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
