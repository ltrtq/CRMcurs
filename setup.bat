@echo off
chcp 65001 >nul
echo ============================================
echo    ClientFlow CRM - Первоначальная настройка
echo ============================================
echo.
echo Шаг 1: Запуск контейнеров (сборка и старт)...
docker-compose up -d --build
echo Ожидание готовности базы данных (15 секунд)...
timeout /t 15 /nobreak >nul

echo.
echo Шаг 2: Применение миграций Prisma...
docker-compose exec -T api npx prisma migrate deploy

echo.
echo Шаг 3: Создание пользователя менеджера...
docker-compose exec -T api npx ts-node --transpile-only -e "const { PrismaClient } = require('@prisma/client'); const bcrypt = require('bcrypt'); const prisma = new PrismaClient(); async function seed() { const password = await bcrypt.hash('manager123', 10); await prisma.user.create({ data: { email: 'manager@example.com', password } }); console.log('Пользователь создан: manager@example.com / manager123'); } seed();"

echo.
echo ============================================
echo   Готово!
echo   Откройте http://localhost:3001
echo   Логин: manager@example.com
echo   Пароль: manager123
echo.
echo   Чтобы наполнить базу тестовыми данными,
echo   запустите seed.bat
echo ============================================
pause