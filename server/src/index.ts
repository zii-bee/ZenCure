import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';

// load environment variables
dotenv.config();

// initialize express app
const app: Application = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// basic route for testing
app.get('/', (req: Request, res: Response) => {
  res.send('ZenCure API is running!');
});

// api routes
app.use('/api', routes);

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