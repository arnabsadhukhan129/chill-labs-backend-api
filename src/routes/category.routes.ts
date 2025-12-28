import express from 'express';
import {
    createCategory,
    listCategories,
    updateCategory,
    deleteCategory,
    getCategoryById
} from '../controllers/category.controller';

import { verifyToken } from '../middleware/authMiddleware';
import { allowRoles } from '../middleware/roleMiddleware';

const router = express.Router();

// CREATE CATEGORY
router.post('/create', verifyToken, allowRoles('SUPER_ADMIN'), createCategory);

// LIST CATEGORIES
router.get('/',verifyToken,  listCategories);

// UPDATE CATEGORY
router.put('/:id', verifyToken, allowRoles('SUPER_ADMIN'), updateCategory);

// SOFT DELETE CATEGORY
router.delete('/:id', verifyToken, allowRoles('SUPER_ADMIN'), deleteCategory);

// GET CATEGORY BY ID
router.get('/:id', verifyToken, getCategoryById);

export default router;
