FROM node:20-slim AS builder

WORKDIR /app

# Install openssl for prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .

EXPOSE 2567

CMD ["npm", "run", "dev"]
