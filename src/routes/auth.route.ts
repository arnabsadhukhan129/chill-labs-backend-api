import express from 'express';
import { hrManagerLogin } from '../controllers/hrLogin.controller';
import { schoolAdminLogin } from '../controllers/schoolAdminLogin.controller';
import { login, selectRole, signup, verifyOtp } from '../controllers/auth.controller';
import { verifyToken } from '../middleware/authMiddleware';
import { allowRoles } from '../middleware/roleMiddleware';

const router = express.Router();

router.post('/login/hr', hrManagerLogin);
router.post('/login/school-admin',schoolAdminLogin);
router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);
router.post('/select-role', selectRole);
router.post('/login', login);

export default router;
