import { mailQueueName, REDIS_HOST, REDIS_PORT } from '@workspace/common/mail-queue';
import { prisma } from '@workspace/db';
import { Job, Worker } from 'bullmq';
import nodemailer from 'nodemailer';
import axios from 'axios';
import 'dotenv/config';
interface JobData {
	userId: string;
	emailId: string;
	recipients: string;
	subject: string;
	body: string;
	attachmentIds: string[];
	appUsername: string;
	appPassword: string;
}

interface EmailAttachment {
	filename: string;
	content: Buffer;
}

// Function to download attachment from URL
async function downloadAttachment(url: string): Promise<Buffer> {
	try {
		const response = await axios.get(url, { responseType: 'arraybuffer' });
		return Buffer.from(response.data);
	} catch (error) {
		console.error(`Failed to download attachment from ${url}:`, error);
		throw new Error(`Failed to download attachment: ${error}`);
	}
}

// Function to extract filename from URL
function getFilenameFromUrl(url: string): string {
	try {
		const urlObj = new URL(url);
		const pathname = urlObj.pathname;
		const filename = pathname.split('/').pop() || 'attachment';
		return filename;
	} catch (error) {
		console.log(`Failed to extract filename from URL ${url}:`, error);
		return 'attachment';
	}
}

// Delay function
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const emailWorker = new Worker(
	mailQueueName,
	async (job: Job) => {
		const data = job.data;

		try {
			const transporter = nodemailer.createTransport({
				host: process.env.SMTP_HOST,
				port: Number(process.env.SMTP_PORT),
				secure: true,
				auth: {
					user: data.appUsername,
					pass: data.appPassword,
				},
			});

			let emailAttachments: EmailAttachment[] = [];

			if (data.attachmentIds && data.attachmentIds.length > 0) {
				const attachmentPromises = data.attachmentIds.map(async (attachmentUrl: string) => {
					try {
						const attachmentBuffer = await downloadAttachment(attachmentUrl);
						const filename = getFilenameFromUrl(attachmentUrl);

						return {
							filename: filename,
							content: attachmentBuffer,
						};
					} catch (attachmentError) {
						console.error(`Failed to process attachment ${attachmentUrl}:`, attachmentError);
						return null; // Return null for failed attachments
					}
				});

				const attachmentResults = await Promise.all(attachmentPromises);
				emailAttachments = attachmentResults.filter((attachment): attachment is EmailAttachment => attachment !== null);
			}

			const mailOptions = {
				from: data.appUsername,
				to: data.recipient,
				subject: data.subject,
				html: data.body, // Use HTML body
				attachments: emailAttachments.map((attachment) => ({
					filename: attachment.filename,
					content: attachment.content,
				})),
			};

			const info = await transporter.sendMail(mailOptions);
			console.log(`Email sent successfully! Message ID: ${info.messageId}`);

			await delay(500);
		} catch (error) {
			console.error(`Failed to send email for job ${job.id}:`, error);

			try {
				await prisma.emailSent.update({
					where: {
						id: data.emailId,
					},
					data: {
						status: 'FAILED',
						sentAt: new Date(),
					},
				});
			} catch (dbError) {
				console.error(`Failed to update database for failed email ${data.emailId}:`, dbError);
			}
			throw error;
		}
	},
	{
		connection: {
			host: REDIS_HOST,
			port: Number(REDIS_PORT),
		},
	},
);

emailWorker.on('completed', async (job: Job) => {
	console.log(`Job ${job.id} completed!`);

	await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate email sending delay

	const jobData = job.data as JobData;

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const updatedEmail = await prisma.emailSent.update({
		where: {
			id: jobData.emailId,
		},
		data: {
			status: 'DONE',
			sentAt: new Date(),
		},
	});
});
emailWorker.on('failed', async (job: Job | undefined, err: Error) => {
	if (job) {
		console.log(`Job ${job.id} failed with error: ${err.message}`);

		const jobData = job.data as JobData;

		try {
			await prisma.emailSent.update({
				where: {
					id: jobData.emailId,
				},
				data: {
					status: 'FAILED',
					sentAt: new Date(),
				},
			});
			console.log(`Database updated for failed email ${jobData.emailId} - Status: FAILED`);
		} catch (dbError) {
			console.error(`Failed to update database for failed email ${jobData.emailId}:`, dbError);
		}
	} else {
		console.log(`Job failed with error: ${err.message}`);
	}
});
