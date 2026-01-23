import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import cron from 'node-cron';

// Carregar variáveis de ambiente
dotenv.config();

// Importar rotas
import authRoutes from './routes/auth';
import categoryRoutes from './routes/categories';
import itemRoutes from './routes/items';
import entryRoutes from './routes/entries';
import exitRoutes from './routes/exits';
import returnRoutes from './routes/returns';
import userRoutes from './routes/users';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/exits', exitRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/users', userRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CMOC Inventory System API',
    timestamp: new Date().toISOString(),
  });
});

// Tratamento de erro 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Tratamento de erros global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);

  // Auto-ping para manter o servidor ativo no Render (a cada 10 minutos)
  if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
    cron.schedule('*/10 * * * *', async () => {
      try {
        const url = `${process.env.RENDER_EXTERNAL_URL}/api/health`;
        const response = await fetch(url);
        console.log(`🏓 Auto-ping: ${response.status} - ${new Date().toISOString()}`);
      } catch (error) {
        console.log('🏓 Auto-ping falhou:', error);
      }
    });
    console.log('🏓 Auto-ping ativado (a cada 10 minutos)');
  }
});

export default app;
