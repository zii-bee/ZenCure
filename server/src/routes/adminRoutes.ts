// src/routes/adminRoutes.ts
import express, { Request, Response, NextFunction } from 'express';
import { 
  getAllUsers, 
  createRemedy, 
  createSource, 
  getUniqueSymptoms,
  updateUserRole,
  getAllSources,
  getAllReviews,
  updateReviewStatus,
  getAllComments,
  updateCommentStatus
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
const typedGetAllReviews = getAllReviews as RequestHandler;
const typedUpdateReviewStatus = updateReviewStatus as RequestHandler;
const typedGetAllComments = getAllComments as RequestHandler;
const typedUpdateCommentStatus = updateCommentStatus as RequestHandler;
const typedAuthorize = authorize as any;

router.use(typedAuth);

// Routes related to comments
router.get('/comments', typedAuthorize('admin', 'moderator'), typedGetAllComments);
router.put('/comments/status', typedAuthorize('admin', 'moderator'), typedUpdateCommentStatus);

// Routes for reviews, users, remedies, sources, etc.
router.get('/reviews', typedAuthorize('admin', 'moderator'), typedGetAllReviews);
router.put('/reviews/status', typedAuthorize('admin', 'moderator'), typedUpdateReviewStatus);

// all below routes require admin role
router.use(typedAuthorize('admin'));

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
