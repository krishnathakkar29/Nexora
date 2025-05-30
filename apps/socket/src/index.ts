import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { default as Redis } from 'ioredis';
import 'dotenv/config';
import { socketAuth } from './auth';
import { errorMiddleware } from './error';

const app = express();

const server = createServer(app);

const io = new Server(server, {
	cors: {
		origin: ['http://localhost:3000', 'https://localhost:8000'],
		methods: ['GET', 'POST'],
		credentials: true,
	},
});

const redisInstance = new Redis();

redisInstance.subscribe('worker:email:update');

redisInstance.on('message', (channel, message) => {
	if (channel === 'worker:email:update') {
		try {
			console.log('i am here lesss go with this message', message);
			const data = JSON.parse(message);

			io.to(`user:${data.userId}`).emit('worker:email:update', {
				email: data.emailId,
				status: data.status,
				contactId: data.contactId,
				sentAt: data.sentAt,
			});
		} catch (error) {
			console.error('Error parsing Redis message:', error);
		}
	}
});

app.set('io', io);

io.use((socket: any, next) => {
	cookieParser()(socket.request, socket.request.response, async (err) => {
		await socketAuth(err, socket, next);
	});
});
const userSocketIDs = new Map();

io.on('connection', (socket: Socket) => {
	const user = socket.user;

	userSocketIDs.set(user?.id, socket.id);

	socket.join(`user:${user?.id}`);

	socket.on('disconnect', () => {
		userSocketIDs.delete(user?.id.toString());
	});
});

app.use(
	cors({
		origin: ['http://localhost:3000', 'https://localhost:8000'],
		methods: ['GET', 'POST'],
		credentials: true,
	}),
);
app.use(cookieParser());

app.use(errorMiddleware);

server.listen(8001, () => {
	console.log(`server is listening on 8001 ${8001} `);
});
