import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  getReturns,
  getReturnById,
  createReturn,
  updateReturn,
  deleteReturn,
} from '../controllers/returnController';
import { authenticateToken, checkPermission } from '../middleware/auth';

const router = Router();

// Configurar multer para upload de múltiplas fotos de defeitos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'defect-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB por arquivo
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  },
});

router.get('/', authenticateToken, getReturns);
router.get('/:id', authenticateToken, getReturnById);
router.post('/', authenticateToken, checkPermission(['admin', 'gestor', 'operador']), upload.array('fotos', 10), createReturn);
router.put('/:id', authenticateToken, checkPermission(['admin', 'gestor', 'operador']), updateReturn);
router.delete('/:id', authenticateToken, checkPermission(['admin', 'gestor']), deleteReturn);

export default router;
