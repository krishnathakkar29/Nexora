import { AsyncHandler } from '@/middlewares/error.js';
import ErrorHandler from '@/utils/errorHandler.js';
import { s3Upload } from '@/utils/s3.js';
import { BulkMailArr } from '@/utils/types.js';
import { emailQueue, mailQueueName } from '@workspace/common/mail-queue';
import { prisma } from '@workspace/db';

export const sendMail = AsyncHandler(async (req, res) => {
	const { recipients, subject, platform, companyName, body: emailBody, appUsername, appPassword } = req.body;
	const recipientsArr: string[] = Array.isArray(recipients) ? recipients : [recipients];
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
				userId: req.user,
				emailId: emailSent.id,
				recipient: recipient,
				subject,
				body: emailBody,
				attachmentIds,
				appUsername,
				appPassword,
			});

			return emailSent;
		}),
	);

	return res.status(200).json({
		status: true,
		message: 'Emails queued for sending.',
		data: {
			emailSentRecords,
		},
	});
});

export const getMailHistory = AsyncHandler(async (req, res) => {
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

export const bulkMailSender = AsyncHandler(async (req, res) => {
	const { emails, appUsername, appPassword } = req.body;
	const parsedMails = JSON.parse(emails);
	const emailsArr: BulkMailArr[] = Array.isArray(parsedMails) ? parsedMails : [parsedMails];

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

	if (emailsArr.length === 0) {
		return res.status(400).json({
			status: false,
			message: 'No emails provided for bulk sending.',
		});
	}

	const emailSentRecords = await Promise.all(
		emailsArr.map(async (email) => {
			let contact = await prisma.contact.findFirst({
				where: { email: email.email },
			});
			if (!contact) {
				contact = await prisma.contact.create({
					data: {
						email: email.email,
						companyName: email.companyname,
						userId: req.user,
					},
				});
			}

			const emailSent = await prisma.emailSent.create({
				data: {
					subject: email.subject,
					body: email.body,
					status: 'PENDING',
					contactId: contact.id,
					platform: email.platform ?? '',
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
			console.log(appUsername, appPassword);
			await emailQueue.add(mailQueueName, {
				userId: req.user,
				emailId: emailSent.id,
				recipient: email.email,
				subject: email.subject,
				body: email.subject,
				attachmentIds,
				appUsername,
				appPassword,
			});

			return emailSent;
		}),
	);

	return res.status(200).json({
		status: true,
		message: 'Emails queued for sending.',
		data: {
			emailSentRecords,
		},
	});
});
