import express from 'express';
import {
  createCompany,
  listCompanies,
  updateCompany,
  deleteCompany,
  getCompanyById,
  getCompanyAdmins,
  createCompanyAdmin
} from '../controllers/company.controller';

import { verifyToken } from '../middleware/authMiddleware';
import { allowRoles } from '../middleware/roleMiddleware';

const router = express.Router();

router.post('/create', verifyToken, allowRoles('SUPER_ADMIN'), createCompany);

router.get('/',listCompanies);

router.delete("/delete/:id", verifyToken, allowRoles('SUPER_ADMIN'), deleteCompany);

router.put('/:id', verifyToken, allowRoles('SUPER_ADMIN'), updateCompany);

router.delete('/:id', verifyToken, allowRoles('SUPER_ADMIN'), deleteCompany);

router.get('/by-id/:id', verifyToken, allowRoles('SUPER_ADMIN'), getCompanyById);

router.get('/list-admin-hr/:companyCode', verifyToken, allowRoles('SUPER_ADMIN'), getCompanyAdmins);

// router.post('/create-admin-hr', verifyToken, allowRoles('SUPER_ADMIN'), createCompanyAdmin);

export default router;
