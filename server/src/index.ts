import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/authRoutes';
import clientRoutes from './routes/clientRoutes';
import requestRoutes from './routes/requestRoutes';

const app = express();
export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/requests', requestRoutes);

// Базовый роут для проверки
app.get('/', (req, res) => {
  res.send('ClientFlow CRM API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});