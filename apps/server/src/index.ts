import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import { errorMiddleware } from './middlewares/error.js';
import userRouter from './routes/user.routes.js';
import mailRouter from './routes/mail.routes.js';
import chatRouter from './routes/chat.routes.js';
import formRouter from './routes/form.routes.js';

const app = express();

export const envMode = process.env.NODE_ENV?.trim() || 'DEVELOPMENT';
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
	cors({
		origin: 'http://localhost:3000',
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
	}),
);
app.use(morgan('dev'));

app.use('/api/v1/user', userRouter);
app.use('/api/v1/mail', mailRouter);
app.use('/api/v1/chat', chatRouter);
app.use('/api/v1/form', formRouter);

app.use(errorMiddleware);
app.listen(PORT, () => {
	console.log(`server is running on port ${PORT}`);
});
