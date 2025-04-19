// server/src/routes/index.ts
import express from 'express';
import authRoutes from './authRoutes';
import remedyRoutes from './remedyRoutes';
import reviewRoutes from './reviewRoutes';
import commentRoutes from './commentRoutes';
import adminRoutes from './adminRoutes';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/remedies', remedyRoutes);
router.use('/reviews', reviewRoutes);
router.use('/comments', commentRoutes);
router.use('/admin', adminRoutes);

export default router;