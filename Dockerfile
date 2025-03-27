# Étape 1 : Build Vite
FROM node:20-alpine AS builder

WORKDIR /app
COPY . .

# Installer uniquement les deps prod + build
RUN corepack enable && corepack prepare pnpm@latest --activate \
  && pnpm install --frozen-lockfile \
  && pnpm build

# Étape 2 : Serveur Nginx optimisé
FROM nginx:stable-alpine

# Copie des fichiers compilés vers Nginx
COPY --from=builder /app/dist /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf

# Suppression du fichier de config par défaut de Nginx
RUN rm /etc/nginx/conf.d/default.conf.default || true

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
