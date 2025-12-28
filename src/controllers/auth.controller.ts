import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/User';
import Team from '../../models/Team';
import ClassRoom from '../../models/ClassRoom';
import Class from '../../models/Class';
import School from '../../models/School';
import Company from '../../models/company';
import { sendOtpEmail } from '../utils/sendOtpEmail';
import { OAuth2Client } from "google-auth-library";
import axios from "axios";

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// helper: generate jwt
const generateToken = (user: any) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      referenceType: user.referenceType,
      referenceId: user.referenceId
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ================= SIGNUP =================
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email & password required"
      });
    }

    // 🔍 Find ACTIVE user only (ignore deleted ones)
    const activeUser = await User.findOne({
      email,
      isDeleted: false
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = "1234"; // replace with random generator later
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    /**
     * ==================================================
     * CASE 1: ACTIVE USER EXISTS
     * ==================================================
     */
    if (activeUser) {

      // 🔁 Active but NOT verified GUEST → resend OTP
      if (activeUser.role === "GUEST" && !activeUser.isVerified) {
        activeUser.name = name;
        activeUser.password = hashedPassword;
        activeUser.otp = otp;
        activeUser.otpExpiresAt = otpExpiresAt;

        await activeUser.save();
        await sendOtpEmail(email, otp);

        return res.json({
          success: true,
          message: "OTP resent. Please verify."
        });
      }

      // ❌ Active & verified user → duplicate
      return res.status(409).json({
        success: false,
        message: "Email already exists"
      });
    }

    /**
     * ==================================================
     * CASE 2: NO ACTIVE USER → CREATE NEW USER
     * (Even if deleted guest exists)
     * ==================================================
     */
    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "GUEST",
      isVerified: false,
      isDeleted: false,            // ✅ important
      otp,
      otpExpiresAt,
      authProvider: "local",
      referenceType: null,
      referenceId: null
    });

    await sendOtpEmail(email, otp);

    return res.json({
      success: true,
      message: "OTP sent to email. Please verify."
    });

  } catch (err: any) {
    console.error("Signup Error:", err);

    // 🛡 Handle duplicate key error safely
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already exists"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Signup failed"
    });
  }
};


// ================= 2. VERIFY OTP (EMAIL ONLY) =================
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    // 🔥 ONLY UNVERIFIED USER
    const user = await User.findOne({
      email,
      isVerified: false,
      isDeleted: false
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No pending OTP verification found for this email"
      });
    }

    if (!user.otp || !user.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "OTP not generated. Please signup again."
      });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    // ✅ VERIFY USER
    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;

    await user.save();

    return res.json({
      success: true,
      message: "OTP verified successfully. Please choose your role now."
    });

  } catch (err) {
    console.error("Verify OTP Error:", err);
    return res.status(500).json({
      success: false,
      message: "OTP verification failed"
    });
  }
};


// ================= SELECT ROLE + CODE VERIFY =================
export const selectRole = async (req: Request, res: Response) => {
  try {
    const { email, role, code } = req.body;

    const user = await User.findOne({ 
      email, 
      isVerified: true,
      isDeleted: false
    });

    if (!user || !user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User not found or OTP not verified",
      });
    }

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    // ================== GUEST LOGIN ==================
    if (role === "GUEST") {
      user.role = "GUEST";
      user.referenceType = null;
      user.referenceId = null;
      await user.save();

      const token = generateToken(user);

      return res.json({
        success: true,
        message: "Guest login successful",
        token,
        user,
      });
    }

    // ============================================================
    // ================== EMPLOYEE / TEAMLEAD =====================
    // ============================================================
    if (role === "EMPLOYEE" || role === "TEAMLEAD") {
      if (!code) {
        return res.status(400).json({
          success: false,
          message: "teamCode is required for EMPLOYEE / TEAMLEAD",
        });
      }

      const team = await Team.findOne({ teamCode: code.toUpperCase() });

      if (!team) {
        return res.status(404).json({
          success: false,
          message: "Invalid team code",
        });
      }

      // TEAMLEAD → Only one allowed per team
      if (
        role === "TEAMLEAD" &&
        team.teamLead &&
        team.teamLead.toString() !== user._id.toString()
      ) {
        return res.status(400).json({
          success: false,
          message: "This team already has a Team Lead",
        });
      }

      // Assign TEAMLEAD
      if (role === "TEAMLEAD") {
        team.teamLead = user._id;
        await team.save();
      }

      // Assign user role + reference
      user.role = role;
      user.referenceType = "Team";
      user.referenceId = team._id;
      await user.save();

      const company = await Company.findById(team.companyId).select(
        "name code"
      );

      const token = generateToken(user);

      return res.json({
        success: true,
        message: "Role assigned successfully",
        token,
        user: {
          ...user.toObject(),
          team: {
            id: team._id,
            name: team.name,
            teamCode: team.teamCode,
          },
          company: company
            ? {
                id: company._id,
                name: company.name,
                code: company.code,
              }
            : null,
        },
      });
    }

    // ============================================================
    // ================== STUDENT / TEACHER =======================
    // ============================================================
    if (role === "STUDENT" || role === "TEACHER") {
      if (!code) {
        return res.status(400).json({
          success: false,
          message: "classCode is required for STUDENT / TEACHER",
        });
      }

      const cls = await Class.findOne({
        classCode: code.toUpperCase(),
      });

      if (!cls) {
        return res.status(404).json({
          success: false,
          message: "Invalid class code",
        });
      }

      // TEACHER → Only one per class
      if (
        role === "TEACHER" &&
        cls.teacher &&
        cls.teacher.toString() !== user._id.toString()
      ) {
        return res.status(400).json({
          success: false,
          message: "This class already has a Teacher",
        });
      }

      // Assign teacher
      if (role === "TEACHER") {
        cls.teacher = user._id;
        await cls.save();
      } 

      // Assign role
      user.role = role;
      user.referenceType = "Class";
      user.referenceId = cls._id;
      await user.save();

      // find school for this class
      const school = await School.findById(cls.schoolId).select("name code");

      const token = generateToken(user);

      return res.json({
        success: true,
        message: "Role assigned successfully",
        token,
        user: {
          ...user.toObject(),
          class: {
            id: cls._id,
            name: cls.name,
            classCode: cls.classCode,
          },
          school: school
            ? {
                id: school._id,
                name: school.name,
                code: school.code,
              }
            : null,
        },
      });
    }

    // ================== INVALID ROLE ==================
    return res.status(400).json({
      success: false,
      message: "Invalid role selected",
    });
  } catch (error) {
    console.error("Select Role Error:", error);
    return res.status(500).json({
      success: false,
      message: "Role assignment failed",
    });
  }
};



// ================= 4. LOGIN =================
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ 
      email,
      isVerified: true,
      isDeleted: false 
    });

    if (!user || !user.isVerified) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials or not verified' });
    }

    if (user?.isDeleted) {
  return res.status(403).json({
    success: false,
    message: "Your account has been deleted. Contact support to reactivate."
  });
}


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};


// ================= FORGOT PASSWORD - SEND OTP =================
export const forgotPasswordSendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ 
      email,
      isVerified: true,
      isDeleted: false 

    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const otp = '1234'; // replace with random in production
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();

    await sendOtpEmail(email, otp);

    return res.json({
      success: true,
      message: 'OTP sent to email for password reset'
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
};

// ================= VERIFY FORGOT PASSWORD OTP =================
export const verifyForgotOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ 
      email,
      isVerified: true,
      isDeleted: false
     });

    if (!user || !user.otp || !user.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found'
      });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired'
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    return res.json({
      success: true,
      message: 'OTP verified. You can now reset your password.'
    });

  } catch (error) {
    console.error('Verify Forgot OTP Error:', error);
    return res.status(500).json({
      success: false,
      message: 'OTP verification failed'
    });
  }
};


// ================= RESET PASSWORD =================
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ 
      email,
      isVerified: true,
      isDeleted: false 
    });

    if (!user || !user.otp) {
      return res.status(400).json({
        success: false,
        message: 'Please verify OTP first'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    return res.json({
      success: true,
      message: 'Password reset successful. You can login now.'
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Password reset failed'
    });
  }
};


// ===== GOOGLE LOGIN =====
// const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// export const googleLogin = async (req: Request, res: Response) => {
//   console.log("GOOGLE_CLIENT_ID======",process.env.GOOGLE_CLIENT_ID);
  
//   try {
//     const { token } = req.body;

//     const ticket = await googleClient.verifyIdToken({
//       idToken: token,
//       audience: process.env.GOOGLE_CLIENT_ID
//     });

//     const payload = ticket.getPayload();
//     if (!payload) return res.status(400).json({ success: false });

//     const { email, name, picture } = payload;

//     let user = await User.findOne({ email });

//     if (!user) {
//       user = await User.create({
//         name,
//         email,
//         authProvider: "google",
//         isVerified: true,
//         role: null,
//         referenceType: null,
//         referenceId: null,
//         profileImage: picture
//       });
//     }

//     const jwtToken = generateToken(user);

//     return res.json({
//       success: true,
//       message: "Google login successful",
//       token: jwtToken,
//       user
//     });

//   } catch (error: any) {
//   console.error("GOOGLE VERIFY ERROR 👉", error);

//   return res.status(500).json({
//     success: false,
//     message: "Google login failed",
//     error: error.message
//   });
// }
// };


// ===== FACEBOOK LOGIN =====

// ===== GOOGLE LOGIN =====
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ success: false, message: "Invalid Google token" });
    }

    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    // 🔥 USER EXISTS BUT DELETED → REVIVE
    if (user && user.isDeleted) {
      user.name = name;
      // user.profileImage = picture;
      user.authProvider = "google";
      user.isVerified = true;
      user.isDeleted = false;
      user.deletedAt = null;
      user.role = null;
      user.referenceType = null;
      user.referenceId = null;

      await user.save();
    }

    // 🆕 USER DOES NOT EXIST → CREATE
    if (!user) {
      user = await User.create({
        name,
        email,
        authProvider: "google",
        isVerified: true,
        isDeleted: false,
        role: null,
        referenceType: null,
        referenceId: null,
        profileImage: picture
      });
    }

    const jwtToken = generateToken(user);

    return res.json({
      success: true,
      message: "Google login successful",
      token: jwtToken,
      user
    });

  } catch (error: any) {
    console.error("GOOGLE LOGIN ERROR 👉", error);
    return res.status(500).json({
      success: false,
      message: "Google login failed"
    });
  }
};


export const facebookLogin = async (req: Request, res: Response) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: "Facebook access token required"
      });
    }

    // ✅ Verify token with Facebook Graph API
    const fbResponse = await axios.get(
      "https://graph.facebook.com/me",
      {
        params: {
          fields: "id,name,email,picture.type(large)",
          access_token: accessToken
        }
      }
    );

    const { email, name, picture } = fbResponse.data;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Facebook account has no email permission"
      });
    }

    let user = await User.findOne({ email });

    // ✅ Auto create if not exists
    if (!user) {
      user = await User.create({
        name,
        email,
        authProvider: "facebook",
        isVerified: true,
        role: null,
        referenceType: null,
        referenceId: null,
        profileImage: picture?.data?.url
      });
    }

    const jwtToken = generateToken(user);

    return res.json({
      success: true,
      message: "Facebook login successful",
      token: jwtToken,
      user
    });

  } catch (error: any) {
    console.error("FACEBOOK LOGIN ERROR 👉", error.message);

    return res.status(500).json({
      success: false,
      message: "Facebook login failed",
      error: error.message
    });
  }
};

// ================= RESEND OTP =================
export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // if (user.isVerified) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "User is already verified"
    //   });
    // }

    // Generate new OTP
    const otp = "1234"; // 🔹 Replace with random generator in production
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    // Send OTP
    await sendOtpEmail(email, otp);

    return res.json({
      success: true,
      message: "OTP resent successfully"
    });

  } catch (error) {
    console.error("Resend OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP"
    });
  }
};


