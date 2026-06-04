import type { Request, Response, NextFunction } from 'express';
import Reserva from '../models/Reserva';
import Finca from '../models/Finca';

export async function getAllReservas(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, finca } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (finca)  filter.finca  = finca;

    const reservas = await Reserva.find(filter).populate('finca', 'name city slug').sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: reservas, total: reservas.length });
  } catch (err) {
    next(err);
  }
}

export async function getReservaById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const reserva = await Reserva.findById(req.params.id).populate('finca').lean();
    if (!reserva) { res.status(404).json({ success: false, message: 'Reserva no encontrada' }); return; }
    res.json({ success: true, data: reserva });
  } catch (err) {
    next(err);
  }
}

export async function createReserva(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { fincaId, checkIn, checkOut, people, guestName, guestEmail } = req.body;

    const finca = await Finca.findById(fincaId);
    if (!finca) { res.status(404).json({ success: false, message: 'Finca no encontrada' }); return; }
    if (finca.status === 'ocupado') { res.status(400).json({ success: false, message: 'Finca no disponible' }); return; }

    const msPerDay = 86400000;
    const nights   = Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / msPerDay);
    if (nights < 1) { res.status(400).json({ success: false, message: 'Las fechas no son válidas' }); return; }

    const subtotal    = nights * finca.pricePerNight;
    const cleaningFee = 90000;
    const serviceFee  = Math.round(subtotal * 0.08);
    const total       = subtotal + cleaningFee + serviceFee;

    const reserva = await Reserva.create({
      finca: finca._id, guestName, guestEmail,
      checkIn: new Date(checkIn), checkOut: new Date(checkOut),
      nights, people, subtotal, cleaningFee, serviceFee, total,
    });

    res.status(201).json({ success: true, data: reserva });
  } catch (err) {
    next(err);
  }
}

export async function updateReservaStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status } = req.body;
    const reserva = await Reserva.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!reserva) { res.status(404).json({ success: false, message: 'Reserva no encontrada' }); return; }
    res.json({ success: true, data: reserva });
  } catch (err) {
    next(err);
  }
}
