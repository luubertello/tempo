FROM node:24-alpine AS base
WORKDIR /app
COPY package*.json ./

# Desarrollo: hot reload
FROM base AS dev
RUN npm ci
COPY . .
CMD ["npm", "run", "start:dev"]

# Build de producción
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --omit=dev

# Imagen final, liviana
FROM node:24-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./
CMD ["node", "dist/main"]