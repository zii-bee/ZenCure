import express, { Request, Response, NextFunction } from 'express';
import { register, login, getCurrentUser, updateProfile } from '../controllers/authController';
import { auth } from '../middleware/auth';

const router = express.Router();

// type for Express request handler
type RequestHandler = (req: Request, res: Response, next: NextFunction) => any;

// cast functions to RequestHandler type
const typedRegister = register as RequestHandler;
const typedLogin = login as RequestHandler;
const typedGetCurrentUser = getCurrentUser as RequestHandler;
const typedUpdateProfile = updateProfile as RequestHandler;
const typedAuth = auth as RequestHandler;

// public routes
router.post('/register', typedRegister);
router.post('/login', typedLogin);

// protected routes
router.get('/me', typedAuth, typedGetCurrentUser);
router.put('/me', typedAuth, typedUpdateProfile);

export default router;