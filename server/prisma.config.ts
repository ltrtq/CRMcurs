import { PrismaClient } from '@prisma/client';

// Добавляем типизацию для глобальной переменной prisma в стиле Node.js
const globalAny: any = global;

const prisma: PrismaClient =
  globalAny.prisma ||
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalAny.prisma = prisma;
}

export default prisma;