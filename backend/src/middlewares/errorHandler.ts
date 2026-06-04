import type { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
  code?: number;
}

export function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction): void {
  console.error(err);

  // Mongoose duplicate key
  if (err.code === 11000) {
    res.status(400).json({ success: false, message: 'Ya existe un registro con ese valor único' });
    return;
  }

  // Mongoose validation
  if (err.name === 'ValidationError') {
    res.status(400).json({ success: false, message: err.message });
    return;
  }

  const status = err.statusCode ?? 500;
  res.status(status).json({ success: false, message: err.message ?? 'Error interno del servidor' });
}
