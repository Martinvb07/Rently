import { Router } from 'express';
import {
  getAllReservas,
  getReservaById,
  createReserva,
  updateReservaStatus,
} from '../controllers/reservasController';

const router = Router();

router.get('/',               getAllReservas);
router.get('/:id',            getReservaById);
router.post('/',              createReserva);
router.patch('/:id/status',   updateReservaStatus);

export default router;
