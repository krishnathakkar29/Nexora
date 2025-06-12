import {
	createForm,
	getContentByUrl,
	getFormByID,
	getFormStats,
	getFormSubmissions,
	publishForm,
	submitForm,
	updateForm,
} from '@/controllers/form.controller.js';
import { isAuthenticated } from '@/middlewares/auth.js';
import { Router } from 'express';

const router: Router = Router();
router.use(isAuthenticated);

router.post('/get-stats', getFormStats);
router.post('/create', createForm);
router.get('/:id', getFormByID);
router.post('/update', updateForm);
router.post('/publish', publishForm);
router.get('/form-submissions/:id', getFormSubmissions);
router.get('/url/:formUrl', getContentByUrl);
router.post('/submit', submitForm);
export default router;
