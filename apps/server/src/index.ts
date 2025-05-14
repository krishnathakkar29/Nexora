import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import { errorMiddleware } from './middlewares/error.js';
import userRouter from './routes/user.routes.js';

const app = express();

export const envMode = process.env.NODE_ENV?.trim() || 'DEVELOPMENT';
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
	cors({
		origin: ' * ',
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
	}),
);
app.use(morgan('dev'));

app.use('/api/v1/user', userRouter);
app.use('/api/v1/mail', userRouter);
app.use(errorMiddleware);
app.listen(PORT, () => {
	console.log(`server is running on port ${PORT}`);
});
