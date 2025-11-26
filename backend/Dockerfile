FROM node:20-alpine AS builder
WORKDIR /app

COPY backend/package.json backend/tsconfig.json ./
COPY backend/src ./src

RUN npm install
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY backend/package.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 4000
CMD ["node", "dist/index.js"]
