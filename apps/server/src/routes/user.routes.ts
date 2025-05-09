import { getMyProfile, login, logout, register } from '@/controllers/user.controller.js';
import { isAuthenticated } from '@/middlewares/auth.js';
import express, { type Router } from 'express';

const app: Router = express.Router();

app.post('/register', register);
app.post('/login', login);

app.use(isAuthenticated);

app.post('/logout', logout);
app.get('/me', getMyProfile);

export default app;
