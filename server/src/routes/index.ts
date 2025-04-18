import express, { Request, Response, NextFunction } from 'express';
import { 
  getReviewsByRemedyId, 
  getReviewById, 
  createReview, 
  updateReview, 
  deleteReview, 
  markReviewHelpful,
  getPendingReviews,
  updateReviewStatus
} from '../controllers/reviewController';
import { auth, authorize } from '../middleware/auth';

const router = express.Router();

// type for Express request handler
type RequestHandler = (req: Request, res: Response, next: NextFunction) => any;

// cast functions to RequestHandler type
const typedGetReviewsByRemedyId = getReviewsByRemedyId as RequestHandler;
const typedGetReviewById = getReviewById as RequestHandler;
const typedCreateReview = createReview as RequestHandler;
const typedUpdateReview = updateReview as RequestHandler;
const typedDeleteReview = deleteReview as RequestHandler;
const typedMarkReviewHelpful = markReviewHelpful as RequestHandler;
const typedGetPendingReviews = getPendingReviews as RequestHandler;
const typedUpdateReviewStatus = updateReviewStatus as RequestHandler;
const typedAuth = auth as RequestHandler;
const typedAuthorize = authorize as any;

// public routes
router.get('/remedy/:remedyId', typedGetReviewsByRemedyId);
router.get('/:id', typedGetReviewById);

// protected routes
router.post('/remedy/:remedyId', typedAuth, typedCreateReview);
router.put('/:id', typedAuth, typedUpdateReview);
router.delete('/:id', typedAuth, typedDeleteReview);
router.post('/:id/helpful', typedAuth, typedMarkReviewHelpful);

// admin/moderator only routes
router.get('/moderation/pending', typedAuth, typedAuthorize('admin', 'moderator'), typedGetPendingReviews);
router.put('/:id/status', typedAuth, typedAuthorize('admin', 'moderator'), typedUpdateReviewStatus);

export default router;