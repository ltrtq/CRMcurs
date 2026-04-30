import { Router } from 'express';
import { createClient, getClients, updateClient, deleteClient } from '../controllers/clientController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Защищаем все роуты клиентов авторизацией
router.use(authenticateToken);

router.post('/', createClient);
router.get('/', getClients);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;