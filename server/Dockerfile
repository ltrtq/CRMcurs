FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# Устанавливаем зависимости
RUN npm install
# Копируем схему Prisma
COPY prisma ./prisma/
# Генерируем клиент Prisma (ВАЖНО!)
RUN npx prisma generate
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]