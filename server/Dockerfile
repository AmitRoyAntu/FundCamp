# Dockerfile for CampFund Backend API
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production || npm install

COPY . .

EXPOSE 5001

ENV PORT=5001
ENV NODE_ENV=production

CMD ["node", "server.js"]
