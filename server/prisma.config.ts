// @ts-nocheck
import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma configuration file
 * Использование // @ts-nocheck в начале файла отключает проверку типов для этого конфига,
 * что решает проблему с "process is not defined" в IDE, не мешая работе Docker.
 */

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Мы используем приведение к string, чтобы Prisma не ругалась на тип
    url: process.env.DATABASE_URL as string,
  },
});