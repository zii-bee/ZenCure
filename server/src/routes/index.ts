import express from 'express';
import authRoutes from './authRoutes';
import remedyRoutes from './remedyRoutes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/remedies', remedyRoutes);

export default router;