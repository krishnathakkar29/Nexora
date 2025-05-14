import { AsyncHandler } from '@/middlewares/error.js';
import ErrorHandler from '@/utils/errorHandler.js';
import { sendEmailSchema } from '@workspace/common/zod/schema/mail';

export const sendMail = AsyncHandler(async (req, res, next) => {
	const body = req.body;

	const result = sendEmailSchema.safeParse(body);

	if (!result.success) {
		return next(new ErrorHandler(400, 'Please provide all fields'));
	}

	const { recipients, subject, platform, companyName, body: emailBody } = result.data;
	const files = req.files as Express.Multer.File[];	
});
