import { NextFunction, Request, Response } from 'express';
import { AsyncHandler } from './error.js';
import ErrorHandler from '@/utils/errorHandler.js';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { COOKIE_NAME } from '@workspace/common/config';

export const isAuthenticated = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
	const token = req.cookies[COOKIE_NAME];
	if (!token) return next(new ErrorHandler(401, 'Please login to access this route'));

	const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);

	req.user = (decodedToken as JwtPayload).id;
	next();
});
