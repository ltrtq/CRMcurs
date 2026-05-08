import { Request, Response } from 'express';
import { prisma } from '../index';

export const createClient = async (req: Request, res: Response) => {
  const { name, phone, email } = req.body;

  // Валидация на стороне сервера
  const phoneRegex = /^\+375\d{9}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name || name.length < 2) {
    return res.status(400).json({ error: 'Имя слишком короткое' });
  }

  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ error: 'Неверный формат телефона. Ожидается +375XXXXXXXXX' });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Неверный формат Email' });
  }

  try {
    const newClient = await prisma.client.create({
      data: { name, phone, email }
    });
    res.json(newClient);
  } catch (error: any) {
    // Проверка на уникальность (если email уже существует в БД)
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Клиент с таким Email уже существует' });
    }
    res.status(500).json({ error: 'Ошибка сервера при создании клиента' });
  }
};

export const getClients = async (req: Request, res: Response) => {
  const { search } = req.query;
  const clients = await prisma.client.findMany({
    where: search ? {
      name: { contains: String(search), mode: 'insensitive' }
    } : {}
  });
  res.json(clients);
};

export const updateClient = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, phone, email } = req.body;
  try {
    const updated = await prisma.client.update({
      where: { id: Number(id) },
      data: { name, phone, email }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении клиента' });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Простая проверка: если есть заявки, Prisma сама выдаст ошибку
    await prisma.client.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Клиент удален' });
  } catch (error) {
    res.status(500).json({ error: 'Нельзя удалить клиента, у которого есть активные заявки' });
  }
};

