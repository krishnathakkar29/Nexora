import { mailQueueName, REDIS_HOST, REDIS_PORT } from '@workspace/common/mail-queue';
import { prisma } from '@workspace/db';
import { Job, Worker } from 'bullmq';
interface JobData {
	userId: string;
	emailId: string;
	recipients: string;
	subject: string;
	body: string;
	attachmentIds: string[];
}

export const emailWorker = new Worker(
	mailQueueName,
	async (job: Job) => {
		console.log('Processing job:', job.id);
		const data = job.data;
		console.log('Job data:', data);
		// … your email-sending logic here …
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

	new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate email sending delay

	const jobData = job.data as JobData;

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
emailWorker.on('failed', (job: Job | undefined, err: Error) => {
	if (job) {
		console.log(`Job ${job.id} failed with error: ${err.message}`);
	} else {
		console.log(`Job failed with error: ${err.message}`);
	}
});
