import { redisConnection } from '@/utils/redis.js';
import { Job, Queue, Worker } from 'bullmq';

export const mailQueueName = 'emailQueue';

export const emailQueue = new Queue(mailQueueName, {
	connection: redisConnection,
	defaultJobOptions: {
		delay: 0,
		attempts: 3,
		backoff: {
			type: 'exponential',
			delay: 1000,
		},
	},
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
		connection: redisConnection,
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
