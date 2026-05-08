import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. Получение списка всех заявок (с инфо о клиенте)
export const getRequests = async (req: Request, res: Response) => {
  try {
    const requests = await prisma.request.findMany({
      include: { 
        client: true // Это позволит фронтенду писать req.client.name
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения заявок' });
  }
};

// 2. ПОЛУЧЕНИЕ ОДНОЙ ЗАЯВКИ (то, чего не хватало)
export const getRequestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const request = await prisma.request.findUnique({
      where: { id: Number(id) },
      include: { client: true }
    });
    
    if (!request) {
      return res.status(404).json({ error: 'Заявка не найдена' });
    }
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера при поиске заявки' });
  }
};

// 3. Создание заявки
export const createRequest = async (req: Request, res: Response) => {
  const { title, description, client_id } = req.body; // Проверь, что description тут есть
  try {
    const newRequest = await prisma.request.create({
      data: {
        title,
        description, // Передаем в Prisma
        client_id: Number(client_id),
        status: 'NEW'
      }
    });
    res.json(newRequest);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка создания заявки' });
  }
};

// 4. Обновление (статус, заголовок, описание)
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

// 5. Удаление заявки и её комментариев
export const deleteRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const rid = Number(id);

    // Сначала удаляем комментарии, связанные с заявкой
    await prisma.comment.deleteMany({ where: { request_id: rid } });
    // Потом саму заявку
    await prisma.request.delete({ where: { id: rid } });

    res.json({ message: 'Заявка удалена' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении заявки' });
  }
};

// 6. Комментарии
export const getComments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const comments = await prisma.comment.findMany({
      where: { request_id: Number(id) },
      orderBy: { created_at: 'asc' }
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка загрузки комментариев' });
  }
};

export const addComment = async (req: Request, res: Response) => {
  try {
    const { request_id, content } = req.body; // Из фронтенда все еще может приходить content
    const comment = await prisma.comment.create({
      data: {
        request_id: Number(request_id),
        content: String(content)
      }
    });
    res.json(comment);
  } catch (error) {
    console.error(error); // Добавь лог, чтобы видеть реальную причину, если упадет
    res.status(500).json({ error: 'Ошибка добавления комментария' });
  }
};

// Удаление комментария
export const deleteComment = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.comment.delete({ where: { id: Number(id) } });
    res.json({ message: 'Комментарий удален' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления комментария' });
  }
};

// Редактирование комментария
export const updateComment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;
  try {
    const updated = await (prisma.comment as any).update({
      where: { id: Number(id) },
      data: { content } 
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка обновления комментария' });
  }
};