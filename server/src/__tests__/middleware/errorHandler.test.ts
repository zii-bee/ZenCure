import { errorHandler, notFoundHandler, AppError } from '../../middleware/errorHandler';
import { mockRequest, mockResponse } from '../helpers/mockReqRes';

describe('Error Handler Middleware', () => {
  describe('AppError class', () => {
    it('should create an AppError with custom message and status code', () => {
      const error = new AppError('Custom error message', 422);
      
      expect(error.message).toBe('Custom error message');
      expect(error.statusCode).toBe(422);
      expect(error.isOperational).toBe(true);
      expect(error.stack).toBeDefined();
    });
  });

  describe('errorHandler middleware', () => {
    let req: any;
    let res: any;
    let next: jest.Mock;

    beforeEach(() => {
      req = mockRequest();
      res = mockResponse();
      next = jest.fn();
      
      // Save original NODE_ENV
      process.env.NODE_ENV_ORIGINAL = process.env.NODE_ENV;
    });

    afterEach(() => {
      // Restore original NODE_ENV
      process.env.NODE_ENV = process.env.NODE_ENV_ORIGINAL;
      delete process.env.NODE_ENV_ORIGINAL;
    });

    it('should handle AppError instances', () => {
      const error = new AppError('Custom error message', 422);
      
      errorHandler(error, req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        status: 422,
        message: 'Custom error message'
      }));
    });

    it('should include stack trace in development mode', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Generic error');
      
      errorHandler(error, req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        status: 500,
        message: 'Generic error',
        stack: expect.any(String)
      }));
    });

    it('should not include stack trace in production mode', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Generic error');
      
      errorHandler(error, req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        status: 500,
        message: 'Something went wrong'
      }));
      expect(res.json).not.toHaveBeenCalledWith(expect.objectContaining({
        stack: expect.any(String)
      }));
    });

    it('should handle Mongoose ValidationError', () => {
      const error: any = new Error('Validation Error');
      error.name = 'ValidationError';
      
      errorHandler(error, req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        status: 400,
        message: 'Validation Error',
        errors: error
      }));
    });

    it('should handle Mongoose CastError', () => {
      const error: any = new Error('Cast Error');
      error.name = 'CastError';
      
      errorHandler(error, req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        status: 400,
        message: 'Invalid input data'
      }));
    });

    it('should handle JWT errors', () => {
      const jwtError: any = new Error('invalid signature');
      jwtError.name = 'JsonWebTokenError';
      
      errorHandler(jwtError, req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        status: 401,
        message: 'Invalid token. Please log in again.'
      }));
      
      const expiredError: any = new Error('jwt expired');
      expiredError.name = 'TokenExpiredError';
      
      errorHandler(expiredError, req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        status: 401,
        message: 'Your token has expired. Please log in again.'
      }));
    });
  });

  describe('notFoundHandler middleware', () => {
    it('should return 404 with route information', () => {
      const req = mockRequest({
        originalUrl: '/api/non-existent-route'
      });
      const res = mockResponse();
      
      notFoundHandler(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        status: 404,
        message: 'Route not found: /api/non-existent-route'
      }));
    });
  });
});