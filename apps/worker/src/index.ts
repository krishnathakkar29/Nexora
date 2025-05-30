import { mailQueueName, REDIS_HOST, REDIS_PORT } from '@workspace/common/mail-queue';
import { Job, Worker } from 'bullmq';
import { default as Redis } from 'ioredis';
import { prisma } from '@workspace/db';
interface JobData {
	userId: string;
	emailId: string;
	recipients: string;
	subject: string;
	body: string;
	attachmentIds: string[];
}

const redisInstance = new Redis.default({
	host: REDIS_HOST,
	port: Number(REDIS_PORT),
});

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
	await new Promise((resolve) => {
		setTimeout(() => {
			console.log(`Job ${job.id} processed successfully.`);
			resolve(true);
		}, 1000);
	});

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

	await redisInstance.publish(
		'worker:email:update',
		JSON.stringify({
			userId: jobData.userId,
			emailId: jobData.emailId,
			status: 'DONE',
			sentAt: updatedEmail.sentAt,
			contactId: updatedEmail.contactId,
		}),
	);
});
emailWorker.on('failed', (job: Job | undefined, err: Error) => {
	if (job) {
		console.log(`Job ${job.id} failed with error: ${err.message}`);
	} else {
		console.log(`Job failed with error: ${err.message}`);
	}
});
