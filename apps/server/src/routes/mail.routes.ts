import { sendMail } from '@/controllers/mail.controller.js';
import { multerUpload } from '@/utils/multer.js';
import express, { Router } from 'express';

const router: Router = express.Router();

router.post('/send', multerUpload.array('files', 15), sendMail);

export default router;
