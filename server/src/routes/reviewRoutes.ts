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
import { 
  validateObjectId, 
  validateRequestBody, 
  validateNumericFields,
  validateEnumFields,
  validateStringLength
} from '../middleware/validation';

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

// Cast validation middleware
const typedValidateObjectId = (param: string) => validateObjectId(param) as RequestHandler;
const typedValidateRequestBody = (fields: string[]) => validateRequestBody(fields) as RequestHandler;
const typedValidateNumericFields = (fields: any) => validateNumericFields(fields) as RequestHandler;
const typedValidateEnumFields = (fields: any) => validateEnumFields(fields) as RequestHandler;
const typedValidateStringLength = (fields: any) => validateStringLength(fields) as RequestHandler;

// public routes
router.get('/remedy/:remedyId', typedValidateObjectId('remedyId'), typedGetReviewsByRemedyId);
router.get('/:id', typedValidateObjectId('id'), typedGetReviewById);

// protected routes
router.post(
  '/remedy/:remedyId', 
  typedAuth, 
  typedValidateObjectId('remedyId'),
  typedValidateRequestBody(['rating', 'title', 'content', 'effectiveness', 'sideEffects', 'ease']),
  typedValidateNumericFields({
    rating: { min: 1, max: 5 },
    effectiveness: { min: 1, max: 5 },
    sideEffects: { min: 1, max: 5 },
    ease: { min: 1, max: 5 }
  }),
  typedValidateStringLength({
    title: { min: 3, max: 100 },
    content: { min: 10, max: 2000 }
  }),
  typedCreateReview
);

router.put(
  '/:id', 
  typedAuth, 
  typedValidateObjectId('id'),
  typedValidateNumericFields({
    rating: { min: 1, max: 5 },
    effectiveness: { min: 1, max: 5 },
    sideEffects: { min: 1, max: 5 },
    ease: { min: 1, max: 5 }
  }),
  typedValidateStringLength({
    title: { min: 3, max: 100 },
    content: { min: 10, max: 2000 }
  }),
  typedUpdateReview
);

router.delete('/:id', typedAuth, typedValidateObjectId('id'), typedDeleteReview);
router.post('/:id/helpful', typedAuth, typedValidateObjectId('id'), typedMarkReviewHelpful);

// admin/moderator only routes
router.get('/moderation/pending', typedAuth, typedAuthorize('admin', 'moderator'), typedGetPendingReviews);

router.put(
  '/:id/status', 
  typedAuth, 
  typedAuthorize('admin', 'moderator'), 
  typedValidateObjectId('id'),
  typedValidateRequestBody(['status']),
  typedValidateEnumFields({ status: ['pending', 'approved', 'flagged'] }),
  typedUpdateReviewStatus
);

export default router;