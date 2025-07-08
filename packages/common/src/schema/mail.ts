import { z } from 'zod';
export const sendEmailSchema = z.object({
	recipients: z
		.array(
			z.object({
				email: z.string().email('Invalid email address'),
			}),
		)
		.min(1, 'At least one recipient is required'),
	subject: z.string().min(1, 'Subject is required'),
	platform: z.string().min(1, 'Subject is required'),
	companyName: z.string().min(1, 'Company name is required'),
	body: z.string().min(1, 'Email content is required'),
	appusername: z.string().min(1, 'App username is required'),
	apppassword: z.string().min(1, 'App password is required'),
});
