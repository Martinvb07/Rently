import { Router } from 'express';
import {
  getAllFincas,
  getFincaBySlug,
  createFinca,
  updateFinca,
  deleteFinca,
} from '../controllers/fincasController';

const router = Router();

router.get('/',          getAllFincas);
router.get('/:slug',     getFincaBySlug);
router.post('/',         createFinca);
router.put('/:slug',     updateFinca);
router.delete('/:slug',  deleteFinca);

export default router;
