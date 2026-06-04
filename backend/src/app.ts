import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fincasRouter from './routes/fincas';
import reservasRouter from './routes/reservas';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// Security & logging
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/fincas',   fincasRouter);
app.use('/api/reservas', reservasRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
