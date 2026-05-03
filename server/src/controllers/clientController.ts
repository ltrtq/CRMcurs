import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Получение списка всех клиентов
export const getClients = async (req: Request, res: Response) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { id: 'asc' }
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении списка клиентов' });
  }
};

// Создание нового клиента
export const createClient = async (req: Request, res: Response) => {
  try {
    const { name, phone, email } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Имя и телефон обязательны' });
    }

    const newClient = await prisma.client.create({
      data: { name, phone, email },
    });

    res.status(201).json(newClient);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при создании клиента' });
  }
};

// Обновление данных клиента (НУЖНО ДЛЯ РОУТОВ)
export const updateClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, email } = req.body;

    const updatedClient = await prisma.client.update({
      where: { id: Number(id) },
      data: { name, phone, email },
    });

    res.json(updatedClient);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении клиента' });
  }
};

// Удаление клиента (НУЖНО ДЛЯ РОУТОВ)
export const deleteClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.client.delete({
      where: { id: Number(id) },
    });

    res.json({ message: 'Клиент успешно удален' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении клиента' });
  }
};