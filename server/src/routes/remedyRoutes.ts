import express from 'express';
import { getRemedies, getRemedyById, searchRemedies, queryRemedies } from '../controllers/remedyController';
import { auth, authorize } from '../middleware/auth';

const router = express.Router();

// type for Express request handler
type RequestHandler = (req: any, res: any, next?: any) => any;

// cast functions to RequestHandler type
const typedGetRemedies = getRemedies as RequestHandler;
const typedGetRemedyById = getRemedyById as RequestHandler;
const typedSearchRemedies = searchRemedies as RequestHandler;
const typedQueryRemedies = queryRemedies as RequestHandler;

// public routes
router.get('/', typedGetRemedies);
router.get('/:id', typedGetRemedyById);
router.post('/search', typedSearchRemedies);
router.post('/query', typedQueryRemedies);

export default router;