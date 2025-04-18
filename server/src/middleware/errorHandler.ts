import { Request, Response, NextFunction } from 'express';

// Custom error class with status code
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  // Default error values
  let statusCode = 500;
  let message = 'Something went wrong';
  let stack: string | undefined = undefined;
  let errors: any = undefined;

  // Handle custom AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    
    // Only include stack in development
    if (process.env.NODE_ENV === 'development') {
      stack = err.stack;
    }
  } else if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    message = 'Validation Error';
    errors = err;
  } else if (err.name === 'CastError') {
    // Mongoose cast error
    statusCode = 400;
    message = 'Invalid input data';
  } else if (err.name === 'JsonWebTokenError') {
    // JWT error
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  } else if (err.name === 'TokenExpiredError') {
    // JWT expired
    statusCode = 401;
    message = 'Your token has expired. Please log in again.';
  } else {
    // Generic error
    console.error('Unhandled error:', err);
    
    // Only include stack in development
    if (process.env.NODE_ENV === 'development') {
      stack = err.stack;
      message = err.message || message;
    }
  }

  // Send response
  const response: any = {
    success: false,
    status: statusCode,
    message
  };

  // Add stack trace in development
  if (stack) {
    response.stack = stack;
  }

  // Add validation errors if present
  if (errors) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    status: 404,
    message: `Route not found: ${req.originalUrl}`
  });
};