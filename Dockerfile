# Étape 1 : Build Vite
FROM node:20-alpine AS builder

WORKDIR /app
COPY . .

RUN corepack enable && corepack prepare pnpm@latest --activate

# Supprime node_modules si présent, avant install
RUN rm -rf node_modules

# Installation des dépendances
RUN pnpm install --frozen-lockfile

# Build de l'app
RUN pnpm build

# Étape 2 : Serveur Nginx optimisé
FROM nginx:stable-alpine

# Copie des fichiers compilés vers Nginx
COPY --from=builder /app/dist /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf

# Suppression du fichier de config par défaut de Nginx
RUN rm /etc/nginx/conf.d/default.conf.default || true

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
