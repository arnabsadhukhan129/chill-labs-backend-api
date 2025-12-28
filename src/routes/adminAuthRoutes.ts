import express from 'express';
import { createAdmin } from '../controllers/adminAuthController';
import { verifyToken } from '../middleware/authMiddleware';
import { allowRoles } from '../middleware/roleMiddleware';
import { adminLogin } from '../controllers/adminLogin.controller';

const router = express.Router();

// Only Super Admin can create new admins
router.post(
  '/create',
  verifyToken,
  allowRoles('SUPER_ADMIN'),
  createAdmin
);

//login for super-admin
router.post(
  '/login',
  adminLogin
);

// //login for HR-manager
// router.post(
//   '/hr-login',
//   verifyToken,
//   allowRoles('HR_MANAGER'),
//   adminLogin
// );

// //login for School Admin
// router.post(
//   '/school-admin-login',
//   verifyToken,
//   allowRoles('SCHOOL_ADMIN'),
//   adminLogin
// );

export default router;
