import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// load environment variables
dotenv.config();

// initialize express app
const app: Application = express();
const PORT = process.env.PORT || 5000;

// security middleware
app.use(helmet());

// rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// middleware
app.use(cors());
app.use(express.json());

// basic route for testing
app.get('/', (req: Request, res: Response) => {
  res.send('ZenCure API is running!');
});

// api routes
app.use('/api', routes);

// error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// mongodb connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zencure');
    console.log('mongodb connected successfully');
  } catch (error) {
    console.error('mongodb connection error:', error);
    process.exit(1);
  }
};

// start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
  });
};

startServer();