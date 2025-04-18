import express, { Request, Response, NextFunction } from 'express';
import { 
  getCommentsByReviewId, 
  createComment, 
  updateComment, 
  deleteComment, 
  markCommentHelpful,
  getPendingComments,
  updateCommentStatus
} from '../controllers/commentController';
import { auth, authorize } from '../middleware/auth';
import { 
  validateObjectId, 
  validateRequestBody, 
  validateEnumFields,
  validateStringLength
} from '../middleware/validation';

const router = express.Router();

// type for Express request handler
type RequestHandler = (req: Request, res: Response, next: NextFunction) => any;

// cast functions to RequestHandler type
const typedGetCommentsByReviewId = getCommentsByReviewId as RequestHandler;
const typedCreateComment = createComment as RequestHandler;
const typedUpdateComment = updateComment as RequestHandler;
const typedDeleteComment = deleteComment as RequestHandler;
const typedMarkCommentHelpful = markCommentHelpful as RequestHandler;
const typedGetPendingComments = getPendingComments as RequestHandler;
const typedUpdateCommentStatus = updateCommentStatus as RequestHandler;
const typedAuth = auth as RequestHandler;
const typedAuthorize = authorize as any;

// Cast validation middleware
const typedValidateObjectId = (param: string) => validateObjectId(param) as RequestHandler;
const typedValidateRequestBody = (fields: string[]) => validateRequestBody(fields) as RequestHandler;
const typedValidateEnumFields = (fields: any) => validateEnumFields(fields) as RequestHandler;
const typedValidateStringLength = (fields: any) => validateStringLength(fields) as RequestHandler;

// public routes
router.get('/review/:reviewId', typedValidateObjectId('reviewId'), typedGetCommentsByReviewId);

// protected routes
router.post(
  '/review/:reviewId', 
  typedAuth, 
  typedValidateObjectId('reviewId'),
  typedValidateRequestBody(['content']),
  typedValidateStringLength({ content: { min: 1, max: 1000 } }),
  typedCreateComment
);

router.put(
  '/:id', 
  typedAuth, 
  typedValidateObjectId('id'),
  typedValidateRequestBody(['content']),
  typedValidateStringLength({ content: { min: 1, max: 1000 } }),
  typedUpdateComment
);

router.delete('/:id', typedAuth, typedValidateObjectId('id'), typedDeleteComment);
router.post('/:id/helpful', typedAuth, typedValidateObjectId('id'), typedMarkCommentHelpful);

// admin/moderator only routes
router.get('/moderation/pending', typedAuth, typedAuthorize('admin', 'moderator'), typedGetPendingComments);

router.put(
  '/:id/status', 
  typedAuth, 
  typedAuthorize('admin', 'moderator'), 
  typedValidateObjectId('id'),
  typedValidateRequestBody(['status']),
  typedValidateEnumFields({ status: ['pending', 'approved', 'flagged'] }),
  typedUpdateCommentStatus
);

export default router;