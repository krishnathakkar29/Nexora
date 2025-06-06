import { createForm, getFormStats } from '@/controllers/form.controller.js';
import { isAuthenticated } from '@/middlewares/auth.js';
import { Router } from 'express';

const router: Router = Router();
router.use(isAuthenticated);

router.post('/get-stats', getFormStats);
router.post('/create', createForm);

export default router;
