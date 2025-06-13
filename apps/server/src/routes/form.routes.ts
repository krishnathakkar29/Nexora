import {
	createForm,
	getAllUserForms,
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

router.get('/get-stats', getFormStats);
router.post('/create', createForm);
router.get('/get/:id', getFormByID);
router.post('/update', updateForm);
router.post('/publish', publishForm);
router.get('/form-submissions/:id', getFormSubmissions);
router.get('/url/:formUrl', getContentByUrl);
router.post('/submit', submitForm);
router.get('/get-all', getAllUserForms);
export default router;
