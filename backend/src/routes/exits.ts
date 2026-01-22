import { Router } from 'express';
import {
  getExits,
  getExitById,
  createExit,
  updateExit,
  deleteExit,
} from '../controllers/exitController';
import { authenticateToken, checkPermission } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getExits);
router.get('/:id', authenticateToken, getExitById);
router.post('/', authenticateToken, checkPermission(['admin', 'gestor', 'operador']), createExit);
router.put('/:id', authenticateToken, checkPermission(['admin', 'gestor', 'operador']), updateExit);
router.delete('/:id', authenticateToken, checkPermission(['admin', 'gestor']), deleteExit);

export default router;
