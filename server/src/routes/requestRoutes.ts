import { Router } from 'express';
import {
  createRequest,
  getRequests,
  updateRequest,
  deleteRequest,
  getRequestById,
  getRequestComments,
  createComment,
} from '../controllers/requestController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Защита всех маршрутов
router.use(authenticateToken);

router.post('/', createRequest);
router.get('/', getRequests);
router.put('/:id', updateRequest);
router.delete('/:id', deleteRequest);
router.get('/:id', getRequestById);
router.get('/:id/comments', getRequestComments);
router.post('/comments', createComment);

export default router;