import { Queue } from 'bullmq';
import 'dotenv/config';

export const mailQueueName = 'emailQueue';
console.log('Redis host:', process.env.REDIS_HOST);
console.log('Redis port:', process.env.REDIS_PORT);

export const emailQueue = new Queue(mailQueueName, {
	connection: {
		host: process.env.REDIS_HOST,
		port: Number(process.env.REDIS_PORT),
	},
	defaultJobOptions: {
		delay: 0,
		attempts: 3,
		backoff: {
			type: 'exponential',
			delay: 1000,
		},
	},
});
