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

# Exposer le port de Bun (3000, par défaut)
EXPOSE 3000

# Démarrer l'application Bun (index.js)
CMD ["bun", "/app/dist/index.html"]
