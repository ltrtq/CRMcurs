import { Router } from 'express';
import { 
  createRequest, 
  getRequests, 
  updateRequest, 
  addComment, 
  getComments 
} from '../controllers/requestController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Все роуты защищены (ТЗ требует авторизации для менеджера)
router.use(authenticateToken);

router.post('/', createRequest);           // Создать заявку
router.get('/', getRequests);             // Список с фильтром
router.put('/:id', updateRequest);        // Изменить (статус/описание)

// Комментарии (Пункт 5.3 ТЗ)
router.post('/comments', addComment);      
router.get('/:requestId/comments', getComments);

export default router;