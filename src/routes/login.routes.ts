import { resendOtp } from './../controllers/auth.controller';
import express from 'express';
import { forgotPasswordSendOtp, login, verifyForgotOtp,resetPassword, googleLogin, facebookLogin} from '../controllers/auth.controller';
// import { joinRole } from '@src/controllers/joinRole.controller';
import { verifyCode } from '../middleware/codeVerifyMiddleware';
import { signup } from '../controllers/auth.controller';
import { verifyOtp } from '../controllers/auth.controller';
import { selectRole } from '../controllers/auth.controller';
// import { resetPassword, sendForgotPasswordOtp, verifyForgotPasswordOtp } from '@src/controllers/forgotPassword.controller';

const router = express.Router();

// Normal Login
// router.post('/emp-login', login);

// Social Login (Google / Facebook)
// router.post('/social-login', appSocialLogin);

//code verifiction
// router.post('/join-role', verifyCode, joinRole);

//app signup
router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);
router.post('/select-role',selectRole);
router.post('/login',login)
router.post('/forgot-password', forgotPasswordSendOtp);
router.post('/verify-forgot-otp', verifyForgotOtp);
router.post('/reset-password', resetPassword);
router.post('/google',googleLogin);
router.post('/facebook', facebookLogin);
router.post('/resend-otp', resendOtp);



export default router;
