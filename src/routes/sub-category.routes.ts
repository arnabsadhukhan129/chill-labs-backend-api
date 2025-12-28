import express from 'express';
import {
    createSubCategory,
    listSubCategories,
    updateSubCategory,
    deleteSubCategory,
    getSubCategoryById,
    toggleDeleteSubCategoryContent,
    toggleFeaturedSubCategoryContent,
    getAllFeaturedContent,
    addSubCategoryContent,
    listSubCategoryContents,
    updateSubCategoryContent,
    getSingleSubCategoryContent,
    reorderSubCategoryContent
} from '../controllers/sub-category.controller';

import { verifyToken } from '../middleware/authMiddleware';
import { allowRoles } from '../middleware/roleMiddleware';

const router = express.Router();

// CREATE SUB-CATEGORY
router.post('/create', verifyToken, allowRoles('SUPER_ADMIN'), createSubCategory);

// LIST SUB-CATEGORIES
router.get('/', verifyToken, listSubCategories);

// UPDATE SUB-CATEGORY
router.put('/:id', verifyToken, allowRoles('SUPER_ADMIN'), updateSubCategory);
router.patch('/content',verifyToken,allowRoles('SUPER_ADMIN'),toggleDeleteSubCategoryContent);


// SOFT DELETE SUB-CATEGORY
router.delete('/:id', verifyToken, allowRoles('SUPER_ADMIN'), deleteSubCategory);

// GET SUB-CATEGORY BY ID
router.get('/:id', verifyToken, getSubCategoryById);


//toggle Content isFeatured
router.put(
    '/content/toggle-featured',
    verifyToken,
    allowRoles('SUPER_ADMIN'),
    toggleFeaturedSubCategoryContent
)

router.get('/content/list',verifyToken,getAllFeaturedContent)

router.post('/:subCategoryId/content',verifyToken,allowRoles('SUPER_ADMIN'), addSubCategoryContent);


router.get('/:subCategoryId/contents',verifyToken, listSubCategoryContents);

router.put('/:subCategoryId/content/:contentId',verifyToken, allowRoles('SUPER_ADMIN'), updateSubCategoryContent);

router.get('/:subCategoryId/content/:contentId',verifyToken, getSingleSubCategoryContent);

router.post(
  '/:subCategoryId/content/reorder',verifyToken,allowRoles('SUPER_ADMIN'),
  reorderSubCategoryContent
);



export default router;
