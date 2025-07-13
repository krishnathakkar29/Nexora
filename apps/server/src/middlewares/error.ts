import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { envMode } from '../index.js';
import ErrorHandler from '@/utils/errorHandler.js';

export const errorMiddleware: ErrorRequestHandler = (err, req, res) => {
	err.message ||= 'Internal Server Error';
	err.statusCode = err.statusCode || 500;

	let prismaError = false;

	console.log(err);

	if (err.name.startsWith('Prisma')) {
		prismaError = true;
	}

	const response: {
		success: boolean;
		message: string;
		error?: ErrorHandler;
	} = {
		success: false,
		message: prismaError ? 'Prisma Query Error!' : err.message,
	};

	if (envMode === 'DEVELOPMENT') {
		response.error = err ?? '';
	}

	res.status(err.statusCode).json(response);
};

type ControllerType = (
	req: Request,
	res: Response,
	next: NextFunction,
) => Promise<void | Response<unknown, Record<string, unknown>>>;

export const AsyncHandler = (passedFunc: ControllerType) => async (req: Request, res: Response, next: NextFunction) => {
	try {
		await passedFunc(req, res, next);
	} catch (error) {
		next(error);
	}
};
