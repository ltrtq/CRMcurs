import { Request, Response } from 'express';
import { prisma } from '../index';

// --- ЗАЯВКИ (Requests) ---

export const createRequest = async (req: Request, res: Response) => {
  try {
    const { client_id, title, description } = req.body;
    const newRequest = await prisma.request.create({
      data: {
        client_id: Number(client_id),
        title,
        description,
        status: 'NEW' // По ТЗ статус при создании всегда NEW
      }
    });
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create request. Make sure client_id exists.' });
  }
};

export const getRequests = async (req: Request, res: Response) => {
  const { status } = req.query;
  // Фильтрация по статусу согласно пункту 5.2 ТЗ
  const requests = await prisma.request.findMany({
    where: status ? { status: status as any } : {},
    include: { client: true } // Подгружаем данные клиента для удобства
  });
  res.json(requests);
};

export const updateRequest = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, status } = req.body;
  try {
    const updated = await prisma.request.update({
      where: { id: Number(id) },
      data: { title, description, status }
    });
    res.json(updated);
  } catch (error) {
    res.status(404).json({ error: 'Request not found' });
  }
};

// --- КОММЕНТАРИИ (Comments) ---

export const addComment = async (req: Request, res: Response) => {
  const { request_id, text } = req.body;
  try {
    const comment = await prisma.comment.create({
      data: {
        request_id: Number(request_id),
        text
      }
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: 'Failed to add comment' });
  }
};

export const getComments = async (req: Request, res: Response) => {
  const { requestId } = req.params;
  const comments = await prisma.comment.findMany({
    where: { request_id: Number(requestId) },
    orderBy: { created_at: 'desc' }
  });
  res.json(comments);
};