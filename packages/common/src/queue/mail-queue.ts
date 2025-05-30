import { Queue } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config({
	path: '../../packages/common/.env',
});

export const mailQueueName = 'emailQueue';

export const REDIS_HOST = process.env.REDIS_HOST!;
export const REDIS_PORT = process.env.REDIS_PORT!;

export const emailQueue = new Queue(mailQueueName, {
	connection: {
		host: process.env.REDIS_HOST,
		port: Number(process.env.REDIS_PORT),
	},
	defaultJobOptions: {
		delay: 5000,
		attempts: 3,
		backoff: {
			type: 'exponential',
			delay: 1000,
		},
	},
});
