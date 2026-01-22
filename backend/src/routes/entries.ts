import { Router } from 'express';
import {
  getEntries,
  getEntryById,
  createEntry,
  updateEntry,
  deleteEntry,
} from '../controllers/entryController';
import { authenticateToken, checkPermission } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getEntries);
router.get('/:id', authenticateToken, getEntryById);
router.post('/', authenticateToken, checkPermission(['admin', 'gestor', 'operador']), createEntry);
router.put('/:id', authenticateToken, checkPermission(['admin', 'gestor', 'operador']), updateEntry);
router.delete('/:id', authenticateToken, checkPermission(['admin', 'gestor']), deleteEntry);

export default router;
