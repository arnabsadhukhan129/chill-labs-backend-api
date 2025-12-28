import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import SignupOtp from '../../models/SignupOtp';
import Employee from '../../models/Employee';
import Teacher from '../../models/Teacher';
import Student from '../../models/Student';
import { sendOtpEmail } from '../utils/sendOtpEmail';

// ================= SEND OTP FOR FORGOT PASSWORD =================
export const sendForgotPasswordOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user =
      (await Employee.findOne({ email })) ||
      (await Teacher.findOne({ email })) ||
      (await Student.findOne({ email }));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const otp = '1234'; // ✅ STATIC FOR NOW

    await SignupOtp.findOneAndUpdate(
      { email },
      {
        email,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      },
      { upsert: true }
    );

    await sendOtpEmail(email, otp);

    return res.json({
      success: true,
      message: 'OTP sent to your email for password reset'
    });

  } catch (error) {
    console.error('Forgot OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
};



// ================= VERIFY FORGOT PASSWORD OTP =================
export const verifyForgotPasswordOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const otpData = await SignupOtp.findOne({ email });

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found'
      });
    }

    if (otpData.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired'
      });
    }

    if (otpData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    return res.json({
      success: true,
      message: 'OTP verified successfully'
    });

  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed'
    });
  }
};



// ================= RESET PASSWORD =================
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email and new password are required'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    let updatedUser =
      await Employee.findOneAndUpdate({ email }, { password: hashedPassword }) ||
      await Teacher.findOneAndUpdate({ email }, { password: hashedPassword }) ||
      await Student.findOneAndUpdate({ email }, { password: hashedPassword });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // ✅ Remove OTP record after success
    await SignupOtp.deleteOne({ email });

    return res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed'
    });
  }
};
