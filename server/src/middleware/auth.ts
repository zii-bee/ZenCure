import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models';



// extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// auth middleware to verify JWT token
// export const auth = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const token = req.header('Authorization')?.replace('Bearer ', '');
    
//     if (!token) {
//       return res.status(401).json({ message: 'authentication required' });
//     }
    
//     const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
//     const user = await User.findById(decoded.id);
    
//     if (!user) {
//       return res.status(401).json({ message: 'user not found' });
//     }
    
//     req.user = user;
//     next();
//   } catch (error) {
//     res.status(401).json({ message: 'invalid token' });
//   }
// };

// 2nd version of auth middleware with more detailed error handling
// export const auth = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     // Extract token from header
//     const authHeader = req.header('Authorization');
//     const token = authHeader?.replace('Bearer ', '');
    
//     if (!token) {
//       console.log('Auth middleware: No token provided');
//       return res.status(401).json({ message: 'authentication required' });
//     }
    
//     // Get JWT secret with debug info
//     const jwtSecret = process.env.JWT_SECRET;
//     if (!jwtSecret) {
//       console.log('Auth middleware: JWT_SECRET not found in environment');
//       return res.status(500).json({ message: 'server configuration error' });
//     }
    
//     try {
//       // Verify token
//       const decoded = jwt.verify(token, jwtSecret) as { id: string };
      
//       if (!decoded || !decoded.id) {
//         console.log('Auth middleware: Invalid token payload');
//         return res.status(401).json({ message: 'invalid token' });
//       }
      
//       // Find user
//       const user = await User.findById(decoded.id);
      
//       if (!user) {
//         console.log(`Auth middleware: User not found for ID: ${decoded.id}`);
//         return res.status(401).json({ message: 'user not found' });
//       }
      
//       // Attach user to request
//       req.user = user;
//       next();
//     } catch (verifyError: unknown) {
//       const error = verifyError as { message: string };
//       console.log(`Auth middleware: Token verification error: ${error.message}`);
//       return res.status(401).json({ message: 'invalid token' });
//     }
//   } catch (error: unknown) {
//     const err = error as { message: string };
//     console.log(`Auth middleware: Unexpected error: ${err.message}`);
//     res.status(401).json({ message: 'invalid token' });
//   }
// };

// // role-based access control middleware
// export const authorize = (...roles: string[]) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     if (!req.user) {
//       return res.status(401).json({ message: 'authentication required' });
//     }
    
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ message: 'access forbidden' });
//     }
    
//     next();
//   };
// };

// version 3

// auth middleware to verify JWT token

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Check if token exists
    if (!token) {
      // For debugging
      console.log('AUTH MIDDLEWARE: No token provided');
      return res.status(401).json({ message: 'authentication required' });
    }
    
    try {
      // Verify token
      const jwtSecret = process.env.JWT_SECRET as string;
      console.log(`AUTH MIDDLEWARE: Using JWT_SECRET: ${jwtSecret.substring(0, 3)}...`);
      
      const decoded = jwt.verify(token, jwtSecret) as { id: string };
      
      if (!decoded || !decoded.id) {
        console.log('AUTH MIDDLEWARE: Token decoded but no ID found');
        return res.status(401).json({ message: 'invalid token' });
      }
      
      console.log(`AUTH MIDDLEWARE: Looking for user with ID: ${decoded.id}`);
      
      // Find user by ID from token
      const user = await User.findById(decoded.id);
      
      // Check if user exists
      if (!user) {
        console.log(`AUTH MIDDLEWARE: User not found for ID: ${decoded.id}`);
        return res.status(401).json({ message: 'user not found' });
      }
      
      // Set user in request
      req.user = user;
      console.log(`AUTH MIDDLEWARE: Authentication successful for ${user.email}`);
      next();
    } catch (jwtError: unknown) {
      // Token verification failed
      const error = jwtError as { message: string };
      console.log(`AUTH MIDDLEWARE: JWT verification error: ${error.message}`);
      return res.status(401).json({ message: 'invalid token' });
    }
  } catch (error: any) {
    // Unexpected error
    console.log(`AUTH MIDDLEWARE: Unexpected error: ${error.message}`);
    return res.status(401).json({ message: 'invalid token' });
  }
};

// role-based access control middleware
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'access forbidden' });
    }
    
    next();
  };
};