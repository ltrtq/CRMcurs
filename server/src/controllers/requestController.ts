import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- Заявки ---

export const createRequest = async (req: Request, res: Response) => {
  try {
    const { title, description, clientId } = req.body;
    if (!title || !clientId) {
      return res.status(400).json({ message: 'Название и ID клиента обязательны' });
    }

    const request = await prisma.request.create({
      data: {
        title,
        description,
        clientId: Number(clientId),
      },
    });
    return res.status(201).json(request);
  } catch (error) {
    console.error('Ошибка создания заявки:', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
};

export const getRequests = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const requests = await prisma.request.findMany({
      where,
      include: { client: true, comments: true },
    });
    return res.json(requests);
  } catch (error) {
    console.error('Ошибка получения заявок:', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
};

export const getRequestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const request = await prisma.request.findUnique({
      where: { id: Number(id) },
      include: { client: true, comments: true },
    });
    if (!request) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }
    return res.json(request);
  } catch (error) {
    console.error('Ошибка получения заявки:', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
};

export const updateRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, status, clientId } = req.body;

    const request = await prisma.request.update({
      where: { id: Number(id) },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(clientId !== undefined && { clientId: Number(clientId) }),
      },
    });
    return res.json(request);
  } catch (error) {
    console.error('Ошибка обновления заявки:', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
};

export const deleteRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.request.delete({ where: { id: Number(id) } });
    return res.json({ message: 'Заявка удалена' });
  } catch (error) {
    console.error('Ошибка удаления заявки:', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
};

// --- Комментарии ---

export const getRequestComments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const comments = await prisma.comment.findMany({
      where: { requestId: Number(id) },   
      orderBy: { createdAt: 'asc' },      
    });
    return res.json(comments);
  } catch (error) {
    console.error('Ошибка получения комментариев:', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
};

export const createComment = async (req: Request, res: Response) => {
  try {
    const { text, requestId } = req.body; 
    if (!text || !requestId) {
      return res.status(400).json({ message: 'text и requestId обязательны' });
    }

    const comment = await prisma.comment.create({
      data: {
        text,
        requestId: Number(requestId),
      },
    });
    return res.status(201).json(comment);
  } catch (error) {
    console.error('Ошибка создания комментария:', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
};

export const updateComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Поле text обязательно' });
    }

    const comment = await prisma.comment.update({
      where: { id: Number(id) },
      data: { text },
    });
    return res.json(comment);
  } catch (error) {
    console.error('Ошибка обновления комментария:', error);
    return res.status(500).json({ message: 'Не удалось обновить комментарий' });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.comment.delete({ where: { id: Number(id) } });
    return res.json({ message: 'Комментарий удалён' });
  } catch (error) {
    console.error('Ошибка удаления комментария:', error);
    return res.status(500).json({ message: 'Не удалось удалить комментарий' });
  }
};