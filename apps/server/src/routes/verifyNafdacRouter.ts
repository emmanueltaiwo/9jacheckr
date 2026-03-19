import { Router } from 'express';
import { verifyNafdacController } from '../controllers/verifyNafdacController.js';

const router = Router();

router.get('/:nafdac', verifyNafdacController);

export default router;
