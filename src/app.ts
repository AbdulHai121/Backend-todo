
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './modules/auth/auth.routes';
import todoRoutes from './modules/todos/todo.routes';
import { loggerStream } from './config/logger';
import chatbotRoutes from "./modules/chatbot/chatbot.routes";
const app = express();

app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: process.env.FRONTEND_URL || true, credentials: true }));
app.use(morgan('combined', { stream: loggerStream }));
// ... existing middleware and routes
app.use("/chat", chatbotRoutes);
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

app.use((req, res, next) => {
  res.status(404).json({ error: 'Invalid address: Endpoint not found' });
});

app.use(errorHandler);

export default app;
