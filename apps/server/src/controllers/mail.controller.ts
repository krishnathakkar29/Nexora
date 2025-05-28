import { AsyncHandler } from '@/middlewares/error.js';
import ErrorHandler from '@/utils/errorHandler.js';
import { s3Upload } from '@/utils/s3.js';
import { emailQueue, mailQueueName } from '@workspace/common/mail-queue';
import { prisma } from '@workspace/db';

export const sendMail = AsyncHandler(async (req, res, next) => {
	const { recipients, subject, platform, companyName, body: emailBody } = req.body;
	let recipientsArr: string[] = Array.isArray(recipients) ? recipients : [recipients];
	const files = req.files;

	let uploadedFiles: {
		fileKey: string;
		fileName: string;
		url: string;
	}[] = [];
	if (Array.isArray(files) && files.length > 0) {
		uploadedFiles = await Promise.all(
			files.map(async (file: Express.Multer.File) => {
				try {
					return await s3Upload(file);
				} catch (error) {
					console.error('Error uploading file:', error);
					throw new ErrorHandler(500, `Failed to upload file ${file.originalname}: ${'failed to upload files'}`);
				}
			}),
		);
	}

	const emailSentRecords = await Promise.all(
		recipientsArr.map(async (recipient: string) => {
			let contact = await prisma.contact.findFirst({
				where: { email: recipient },
			});
			if (!contact) {
				contact = await prisma.contact.create({
					data: {
						email: recipient,
						companyName,
						userId: req.user,
					},
				});
			}

			const emailSent = await prisma.emailSent.create({
				data: {
					subject,
					body: emailBody,
					status: 'PENDING',
					contactId: contact.id,
					platform: platform ?? '',
					userId: req.user,
				},
			});
			let attachmentIds: string[] = [];
			if (uploadedFiles.length > 0) {
				const attachments = await Promise.all(
					uploadedFiles.map(
						async (file) =>
							await prisma.attachment.create({
								data: {
									fileKey: file.fileKey,
									fileName: file.fileName,
									fileUrl: file.url,
									emailSentId: emailSent.id,
								},
							}),
					),
				);

				attachmentIds = attachments.map((attachment) => attachment.fileUrl);
			}

			await emailQueue.add(mailQueueName, {
				emailId: emailSent.id,
				recipient: recipient,
				subject,
				body: emailBody,
				attachmentIds,
			});

			return emailSent;
		}),
	);

	return res.status(200).json({
		status: true,
		message: 'Emails queued for sending.',
		emailSentRecords,
	});
});

export const getMailHistory = AsyncHandler(async (req, res, next) => {
	const userId = req.user;

	const getContacts = await prisma.contact.findMany({
		where: {
			userId: req.user,
		},
		include: {
			emailsSent: {
				select: {
					platform: true,
					status: true,
					sentAt: true,
				},
			},
		},
		orderBy: {
			email: 'asc',
		},
	});

	return res.status(200).json({
		staus: true,
		message: 'mails fetched successfully',
		data: {
			contacts: getContacts,
		},
	});

});
