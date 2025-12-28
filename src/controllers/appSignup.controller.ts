import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import SignupOtp from '../../models/SignupOtp';
import Employee from '../../models/Employee';
import Teacher from '../../models/Teacher';
import Student from '../../models/Student';
import { sendOtpEmail } from '../utils/sendOtpEmail';

// ================= SEND OTP AFTER SIGNUP =================
export const appSignup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // ✅ Prevent duplicate user
    const existing =
      (await Employee.findOne({ email })) ||
      (await Teacher.findOne({ email })) ||
      (await Student.findOne({ email }));

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    const otp = '1234'; // STATIC FOR NOW
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Save OTP TEMP DATA
    await SignupOtp.findOneAndUpdate(
      { email },
      {
        name,
        email,
        password: hashedPassword,
        role,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      },
      { upsert: true }
    );

    // ✅ Send OTP
    await sendOtpEmail(email, otp);

    return res.json({
      success: true,
      message: 'OTP sent to email. Please verify.'
    });

  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({
      success: false,
      message: 'Signup failed'
    });
  }
};

// ================= VERIFY OTP & CREATE USER =================
export const verifySignupOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const otpData = await SignupOtp.findOne({ email });

    if (!otpData) {
      return res.status(400).json({ success: false, message: 'OTP not found' });
    }

    if (otpData.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    if (otpData.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    const { name, password, role } = otpData;
    let user;

    if (role === 'EMPLOYEE' || role === 'TEAM_LEAD') {
      user = await Employee.create({
        name,
        email,
        password,
        position: role === 'TEAM_LEAD' ? 'teamlead' : 'employee'
      });
    }

    if (role === 'TEACHER') {
      user = await Teacher.create({ name, email, password });
    }

    if (role === 'STUDENT') {
      user = await Student.create({ name, email, password });
    }

    // ✅ REMOVE OTP RECORD AFTER SUCCESS
    await SignupOtp.deleteOne({ email });

    return res.json({
      success: true,
      message: 'Account verified and created',
      user: {
        id: user?._id,
        name,
        email,
        role
      }
    });

  } catch (error) {
    console.error('OTP Verify Error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP Verification Failed'
    });
  }
};
