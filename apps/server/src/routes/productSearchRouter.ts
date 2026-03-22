import { Router } from 'express';
import { productSearchController } from '../controllers/productSearchController.js';

const router = Router();

router.get('/search', productSearchController);

export default router;
