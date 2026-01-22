import { Router } from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { authenticateToken, checkPermission } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getCategories);
router.get('/:id', authenticateToken, getCategoryById);
router.post('/', authenticateToken, checkPermission(['admin', 'gestor']), createCategory);
router.put('/:id', authenticateToken, checkPermission(['admin', 'gestor']), updateCategory);
router.delete('/:id', authenticateToken, checkPermission(['admin']), deleteCategory);

export default router;
