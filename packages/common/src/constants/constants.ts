import dotenv from 'dotenv';

dotenv.config({
	path: '../../packages/common/.env',
});

export const COOKIE_NAME = process.env.COOKIE_NAME as string;
export const JWT_SECRET = process.env.JWT_SECRET as string;
