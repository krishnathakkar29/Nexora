import { mailQueueName } from '@workspace/common/mail-queue';
import { Job, Worker } from 'bullmq';
import 'dotenv/config';

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
			host: process.env.REDIS_HOST,
			port: Number(process.env.REDIS_PORT),
		},
	},
);

emailWorker.on('completed', (job: Job) => {
	console.log(`Job ${job.id} completed!`);
});
emailWorker.on('failed', (job: Job | undefined, err: Error) => {
	if (job) {
		console.log(`Job ${job.id} failed with error: ${err.message}`);
	} else {
		console.log(`Job failed with error: ${err.message}`);
	}
});
