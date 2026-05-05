FROM node:18-alpine
WORKDIR /app
# Копируем файлы зависимостей
COPY package*.json ./
RUN npm install
# Копируем всё остальное
COPY . .
# Открываем порт для React
EXPOSE 3000
# Запуск в режиме разработки с Hot Reload
CMD ["npm", "start"]