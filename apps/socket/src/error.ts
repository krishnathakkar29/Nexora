import { ErrorRequestHandler } from 'express';

export default class ErrorHandler extends Error {
	constructor(
		public statusCode: number,
		public message: string,
	) {
		super(message);
		this.statusCode = statusCode;
	}
}

export const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
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

	res.status(err.statusCode).json(response);
};
