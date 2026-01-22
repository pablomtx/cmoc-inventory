import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import { authenticateToken, checkPermission } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getUsers);
router.get('/:id', authenticateToken, getUserById);
router.post('/', authenticateToken, checkPermission(['admin']), createUser);
router.put('/:id', authenticateToken, checkPermission(['admin']), updateUser);
router.delete('/:id', authenticateToken, checkPermission(['admin']), deleteUser);

export default router;
