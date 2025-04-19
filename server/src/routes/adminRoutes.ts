import express, { Request, Response, NextFunction } from 'express';
import { 
  getAllUsers, 
  createRemedy, 
  createSource, 
  getUniqueSymptoms,
  updateUserRole,
  getAllSources
} from '../controllers/adminController';
import { auth, authorize } from '../middleware/auth';

const router = express.Router();

// type for Express request handler
type RequestHandler = (req: Request, res: Response, next: NextFunction) => any;

// cast functions to RequestHandler type
const typedGetAllUsers = getAllUsers as RequestHandler;
const typedCreateRemedy = createRemedy as RequestHandler;
const typedCreateSource = createSource as RequestHandler;
const typedGetUniqueSymptoms = getUniqueSymptoms as RequestHandler;
const typedUpdateUserRole = updateUserRole as RequestHandler;
const typedGetAllSources = getAllSources as RequestHandler;
const typedAuth = auth as RequestHandler;
const typedAuthorize = authorize as any;

// all routes require admin role
router.use(typedAuth, typedAuthorize('admin'));

// users
router.get('/users', typedGetAllUsers);
router.put('/users/role', typedUpdateUserRole);

// remedies
router.post('/remedies', typedCreateRemedy);
router.get('/symptoms', typedGetUniqueSymptoms);

// sources
router.get('/sources', typedGetAllSources);
router.post('/sources', typedCreateSource);

export default router;