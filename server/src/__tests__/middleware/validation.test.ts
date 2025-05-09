import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import {
  validateObjectId,
  validateRequestBody,
  validateNumericFields,
  validateEnumFields,
  validateStringLength
} from '../../middleware/validation';

describe('Validation Middleware', () => {
  describe('validateObjectId', () => {
    it('should call next() for valid ObjectId', () => {
      const validId = new mongoose.Types.ObjectId().toString();
      const req = {
        params: { id: validId }
      } as unknown as Request;
      
      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      const middleware = validateObjectId('id');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 400 for invalid ObjectId', () => {
      const req = {
        params: { id: 'invalid-id' }
      } as unknown as Request;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as unknown as Response;
      
      const next = jest.fn() as NextFunction;

      const middleware = validateObjectId('id');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid id format' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateRequestBody', () => {
    it('should call next() if all required fields are present', () => {
      const req = {
        body: {
          name: 'Test',
          email: 'test@example.com',
          password: 'password123'
        }
      } as Request;
      
      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      const middleware = validateRequestBody(['name', 'email', 'password']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 400 if required fields are missing', () => {
      const req = {
        body: {
          name: 'Test',
          // email is missing
          password: 'password123'
        }
      } as Request;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as unknown as Response;
      
      const next = jest.fn() as NextFunction;

      const middleware = validateRequestBody(['name', 'email', 'password']);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Missing required fields',
        fields: ['email']
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateNumericFields', () => {
    it('should call next() if numeric fields are valid', () => {
      const req = {
        body: {
          rating: 4,
          price: 10.99
        }
      } as Request;
      
      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      const middleware = validateNumericFields({
        rating: { min: 1, max: 5 },
        price: { min: 0 }
      });
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 400 if numeric fields are invalid', () => {
      const req = {
        body: {
          rating: 6, // Above max of 5
          price: -10 // Below min of 0
        }
      } as Request;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as unknown as Response;
      
      const next = jest.fn() as NextFunction;

      const middleware = validateNumericFields({
        rating: { min: 1, max: 5 },
        price: { min: 0 }
      });
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: {
          rating: 'rating must be at most 5',
          price: 'price must be at least 0'
        }
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 if field is not a number', () => {
      const req = {
        body: {
          rating: 'not-a-number'
        }
      } as Request;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as unknown as Response;
      
      const next = jest.fn() as NextFunction;

      const middleware = validateNumericFields({
        rating: { min: 1, max: 5 }
      });
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: {
          rating: 'rating must be a number'
        }
      });
    });
  });
});