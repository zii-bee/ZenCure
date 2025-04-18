import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

// validate MongoDB ObjectID
export const validateObjectId = (idName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[idName];
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: `Invalid ${idName} format` });
    }
    
    next();
  };
};

// validate request body fields
export const validateRequestBody = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        fields: missingFields 
      });
    }
    
    next();
  };
};

// validate numeric fields
export const validateNumericFields = (fields: { [key: string]: { min?: number, max?: number } }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: { [key: string]: string } = {};
    
    Object.entries(fields).forEach(([field, constraints]) => {
      if (req.body[field] !== undefined) {
        const value = Number(req.body[field]);
        
        if (isNaN(value)) {
          errors[field] = `${field} must be a number`;
        } else {
          if (constraints.min !== undefined && value < constraints.min) {
            errors[field] = `${field} must be at least ${constraints.min}`;
          }
          if (constraints.max !== undefined && value > constraints.max) {
            errors[field] = `${field} must be at most ${constraints.max}`;
          }
        }
      }
    });
    
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors 
      });
    }
    
    next();
  };
};

// validate enum fields
export const validateEnumFields = (fields: { [key: string]: string[] }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: { [key: string]: string } = {};
    
    Object.entries(fields).forEach(([field, allowedValues]) => {
      if (req.body[field] !== undefined && !allowedValues.includes(req.body[field])) {
        errors[field] = `${field} must be one of: ${allowedValues.join(', ')}`;
      }
    });
    
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors 
      });
    }
    
    next();
  };
};

// validate string length
export const validateStringLength = (fields: { [key: string]: { min?: number, max?: number } }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: { [key: string]: string } = {};
    
    Object.entries(fields).forEach(([field, constraints]) => {
      if (req.body[field] !== undefined) {
        const value = String(req.body[field]);
        
        if (constraints.min !== undefined && value.length < constraints.min) {
          errors[field] = `${field} must be at least ${constraints.min} characters`;
        }
        if (constraints.max !== undefined && value.length > constraints.max) {
          errors[field] = `${field} must be at most ${constraints.max} characters`;
        }
      }
    });
    
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors 
      });
    }
    
    next();
  };
};