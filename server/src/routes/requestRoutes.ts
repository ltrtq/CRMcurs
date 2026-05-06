import { Router } from 'express';
import { 
  getRequests, 
  createRequest, 
  updateRequest, 
  getRequestById, // Убедись, что он тут есть
  deleteRequest, 
  getComments, 
  addComment 
} from '../controllers/requestController';

const router = Router();

router.get('/', getRequests);
router.post('/', createRequest);
router.get('/:id', getRequestById);           // Получить одну
router.put('/:id', updateRequest);            // Обновить
router.delete('/:id', deleteRequest);         // Удалить
router.get('/:id/comments', getComments);     // Комменты
router.post('/comments', addComment);         // Добавить коммент

export default router;