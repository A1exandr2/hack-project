# Этап 1: сборка
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем зависимости
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем приложение → создаётся папка dist
RUN npm run build

# Этап 2: финальный образ
FROM node:20-alpine

# Устанавливаем serve для раздачи статики
RUN npm install -g serve

WORKDIR /app

# Копируем СОБРАННУЮ папку dist → в public (или сразу в корень)
COPY --from=builder /app/dist ./public

EXPOSE 3000

# Запускаем serve в SPA-режиме на порту 3000
CMD ["serve", "-s", "public", "-l", "3000"]