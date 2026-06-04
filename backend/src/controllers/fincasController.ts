import type { Request, Response, NextFunction } from 'express';
import Finca from '../models/Finca';

export async function getAllFincas(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { ciudad, status, minCapacity, sort } = req.query;

    const filter: Record<string, unknown> = {};
    if (ciudad) filter.city = ciudad;
    if (status) filter.status = status;
    if (minCapacity) filter.capacity = { $gte: Number(minCapacity) };

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      'precio-asc':  { pricePerNight: 1 },
      'precio-desc': { pricePerNight: -1 },
      rating:        { rating: -1 },
    };
    const sortQuery = sortMap[sort as string] ?? { createdAt: -1 };

    const fincas = await Finca.find(filter).sort(sortQuery).lean();
    res.json({ success: true, data: fincas, total: fincas.length });
  } catch (err) {
    next(err);
  }
}

export async function getFincaBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const finca = await Finca.findOne({ slug: req.params.slug }).lean();
    if (!finca) { res.status(404).json({ success: false, message: 'Finca no encontrada' }); return; }
    res.json({ success: true, data: finca });
  } catch (err) {
    next(err);
  }
}

export async function createFinca(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const finca = await Finca.create(req.body);
    res.status(201).json({ success: true, data: finca });
  } catch (err) {
    next(err);
  }
}

export async function updateFinca(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const finca = await Finca.findOneAndUpdate({ slug: req.params.slug }, req.body, { new: true, runValidators: true });
    if (!finca) { res.status(404).json({ success: false, message: 'Finca no encontrada' }); return; }
    res.json({ success: true, data: finca });
  } catch (err) {
    next(err);
  }
}

export async function deleteFinca(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const finca = await Finca.findOneAndDelete({ slug: req.params.slug });
    if (!finca) { res.status(404).json({ success: false, message: 'Finca no encontrada' }); return; }
    res.json({ success: true, message: 'Finca eliminada' });
  } catch (err) {
    next(err);
  }
}
