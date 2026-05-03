import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import prisma from '../../prisma.config';

export const getRequests = async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;
    const where: Prisma.RequestWhereInput = {
      ...(status ? { status: status as any } : {}),
      ...(search ? {
        OR: [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } }
        ]
      } : {}),
    };
    const requests = await prisma.request.findMany({
      where,
      include: { client: true },
      orderBy: { created_at: 'desc' },
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении списка' });
  }
};

export const createRequest = async (req: Request, res: Response) => {
  try {
    const { title, client_id, description } = req.body;
    if (!title || !client_id) return res.status(400).json({ error: 'Заголовок и клиент обязательны' });

    const newRequest = await prisma.request.create({
      data: {
        title,
        client_id: Number(client_id),
        description: description || "", 
        status: 'NEW',
      },
    });
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при создании заявки' });
  }
};

// ЭТА ФУНКЦИЯ ИСПРАВЛЯЕТ ОШИБКУ TS2305
export const updateRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    const updated = await prisma.request.update({
      where: { id: Number(id) },
      data: { 
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status: status as any }),
      },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении заявки' });
  }
};

export const getRequestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const request = await prisma.request.findUnique({
      where: { id: Number(id) },
      include: { client: true }
    });
    if (!request) return res.status(404).json({ error: 'Не найдено' });
    res.json(request);
  } catch (error) {
    console.error("ОШИБКА В getRequestById:", error); // ЭТО ВАЖНО
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const getComments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const comments = await prisma.comment.findMany({
      where: { request_id: Number(id) },
      orderBy: { created_at: 'asc' }
    });
    res.json(comments);
  } catch (error) {
    console.error("ОШИБКА В getComments:", error); // И ЭТО ТОЖЕ
    res.status(500).json({ error: 'Ошибка загрузки комментариев' });
  }
};

export const addComment = async (req: Request, res: Response) => {
  try {
    const { text, request_id } = req.body;
    const comment = await prisma.comment.create({
      data: { text, request_id: Number(request_id) }
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка добавления комментария' });
  }
};