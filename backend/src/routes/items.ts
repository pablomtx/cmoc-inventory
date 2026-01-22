import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  getItems,
  getItemById,
  getItemByQRCode,
  createItem,
  updateItem,
  deleteItem,
} from '../controllers/itemController';
import { authenticateToken, checkPermission } from '../middleware/auth';

const router = Router();

// Configurar multer para upload de fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'item-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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

router.get('/', authenticateToken, getItems);
router.get('/:id', authenticateToken, getItemById);
router.get('/qrcode/:qrCode', authenticateToken, getItemByQRCode);
router.post('/', authenticateToken, checkPermission(['admin', 'gestor', 'operador']), upload.single('foto'), createItem);
router.put('/:id', authenticateToken, checkPermission(['admin', 'gestor', 'operador']), upload.single('foto'), updateItem);
router.delete('/:id', authenticateToken, checkPermission(['admin']), deleteItem);

export default router;
