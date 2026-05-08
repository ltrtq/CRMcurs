import { Router } from 'express';
import {
  createRequest,
  getRequests,
  updateRequest,
  deleteRequest,
  getRequestById,
  getRequestComments,
  createComment,
  updateComment,
  deleteComment
} from '../controllers/requestController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/', createRequest);
router.get('/', getRequests);
router.put('/:id', updateRequest);
router.delete('/:id', deleteRequest);
router.get('/:id', getRequestById);
router.get('/:id/comments', getRequestComments);
router.post('/comments', createComment);
router.put('/comments/:id', updateComment);    // <-- новый маршрут
router.delete('/comments/:id', deleteComment); // <-- новый маршрут

export default router;