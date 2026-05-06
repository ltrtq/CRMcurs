import { Router } from 'express';
import { 
  createRequest, 
  getRequests, 
  updateRequest, 
  addComment, 
  getComments,
  getRequestById 
} from '../controllers/requestController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', getRequests);
router.post('/', createRequest);
router.get('/:id', getRequestById); // ПРОВЕРЬ НАЛИЧИЕ ЭТОЙ СТРОКИ
router.put('/:id', updateRequest);
router.get('/:id/comments', getComments);
router.post('/comments', addComment);

export default router;