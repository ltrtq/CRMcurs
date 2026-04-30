import { Request, Response } from 'express';
import { prisma } from '../index';

export const createClient = async (req: Request, res: Response) => {
  const { name, phone, email } = req.body;
  const client = await prisma.client.create({
    data: { name, phone, email }
  });
  res.status(201).json(client);
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
  const client = await prisma.client.update({
    where: { id: Number(id) },
    data: { name, phone, email }
  });
  res.json(client);
};

export const deleteClient = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.client.delete({ where: { id: Number(id) } });
  res.status(204).send();
};