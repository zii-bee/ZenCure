import express from 'express';
import authRoutes from './authRoutes';
import remedyRoutes from './remedyRoutes';
import reviewRoutes from './reviewRoutes';
import commentRoutes from './commentRoutes';

const router = express.Router();

// Register all route modules
router.use('/auth', authRoutes);
router.use('/remedies', remedyRoutes);
router.use('/reviews', reviewRoutes);
router.use('/comments', commentRoutes);

export default router;