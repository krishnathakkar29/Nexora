import { COOKIE_NAME, JWT_SECRET } from '@workspace/common/config';
import { prisma, User } from '@workspace/db';
import { IncomingMessage } from 'http';
import jwt, { JwtPayload } from 'jsonwebtoken';
import type { ExtendedError, Socket } from 'socket.io';
import ErrorHandler from './error';

interface RequestWithCookies extends IncomingMessage {
	cookies: Record<string, string>;
}

declare module 'socket.io' {
	interface Socket {
		user?: User;
	}
}
export const socketAuth = async (
	err: Error | null,
	socket: Socket,
	next: (err?: ExtendedError | undefined) => void,
) => {
	try {
		if (err) return next(err);

		const request = socket.request as RequestWithCookies;
		const authToken = request.cookies[COOKIE_NAME];

		if (!authToken) {
			return next(new ErrorHandler(401, 'Authentication token is missing'));
		}

		const decodedData = jwt.verify(authToken, JWT_SECRET);

		const user = await prisma.user.findUnique({
			where: {
				id: (decodedData as JwtPayload).id,
			},
		});

		if (!user) {
			return next(new ErrorHandler(401, 'User not found'));
		}

		socket.user = user;

		return next();
	} catch (error) {
		console.error('Socket authentication error:', error);
		if (error instanceof jwt.TokenExpiredError) {
			return next(new ErrorHandler(401, 'Authentication token has expired'));
		}
		return next(new ErrorHandler(500, 'Internal server error during authentication'));
	}
};
