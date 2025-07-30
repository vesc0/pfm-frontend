# ── Stage 1: Build the Angular app ───────────────────────────
FROM node:18-alpine AS build

# 1. Set working dir inside the container
WORKDIR /app

# 2. Copy package manifests and install deps
COPY package.json package-lock.json ./
RUN npm ci

# 3. Copy all source files & build for production
COPY . .
RUN npm run build -- --configuration production



# ── Stage 2: Serve with Nginx ────────────────────────────────
FROM nginx:stable-alpine

# 1) remove default server block
RUN rm /etc/nginx/conf.d/default.conf

# 2) wipe out the old html
RUN rm -rf /usr/share/nginx/html/*

# 3) your SPA nginx config
COPY nginx.conf /etc/nginx/conf.d/

# 4) copy *contents* of the browser build into nginx’s html root
COPY --from=build /app/dist/pfm-frontend/browser/. /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

