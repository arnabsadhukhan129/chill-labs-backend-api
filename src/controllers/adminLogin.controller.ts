import { Request, Response } from 'express';
import Admin from '../../models/admin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import mongoose from "mongoose";

interface IPopulatedSchool {
  _id: mongoose.Types.ObjectId;
  name: string;
  code: string;
}

interface IPopulatedCompany {
  _id: mongoose.Types.ObjectId;
  name: string;
  code: string;
}


// export const adminLogin = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email and password are required'
//       });
//     }

//     const admin = await Admin.findOne({ email });

//     if (!admin) {
//       return res.status(404).json({
//         success: false,
//         message: 'Admin not found'
//       });
//     }

//     if (!admin.status) {
//       return res.status(403).json({
//         success: false,
//         message: 'Admin account is disabled'
//       });
//     }

//     const isPasswordValid = await bcrypt.compare(password, admin.password);

//     if (!isPasswordValid) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }

//     // Only allow these roles to login
//     const allowedRoles = ['SUPER_ADMIN'];

//     if (!allowedRoles.includes(admin.role)) {
//       return res.status(403).json({
//         success: false,
//         message: 'Unauthorized role'
//       });
//     }
//     const payload: any = {
//       id: admin._id,
//       role: admin.role,
//       email: admin.email
//     };
//     const token = jwt.sign(
//       payload,
//       process.env.JWT_SECRET as string,
//       { expiresIn: '1d' }
//     );

//     return res.status(200).json({
//       success: true,
//       message: 'Login successful',
//       token,
//       admin: {
//         id: admin._id,
//         name: admin.name,
//         email: admin.email,
//         role: admin.role
//       }
//     });

//   } catch (error) {
//     console.error('Login Error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// };


export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // ✅ typed populate (CORRECT)
    const admin = await Admin.findOne({ email })
      .populate<{ schoolId?: IPopulatedSchool }>("schoolId", "code name")
      .populate<{ companyId?: IPopulatedCompany }>("companyId", "code name");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Account not found"
      });
    }

    if (!admin.status) {
      return res.status(403).json({
        success: false,
        message: "Account is disabled"
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // ✅ Allowed roles
    const allowedRoles = ["SUPER_ADMIN", "HR_MANAGER", "SCHOOL_ADMIN"];
    if (!allowedRoles.includes(admin.role)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized role"
      });
    }

    // ✅ JWT payload — ONLY IDs
    const payload: any = {
      id: admin._id,
      role: admin.role,
      email: admin.email
    };

    if (admin.role === "SCHOOL_ADMIN") {
      payload.schoolId = admin.schoolId?._id;
    }

    if (admin.role === "HR_MANAGER") {
      payload.companyId = admin.companyId?._id;
    }

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,

        // ✅ codes for frontend
        schoolCode:
          admin.role === "SCHOOL_ADMIN" ? admin.schoolId?.code : null,

        companyCode:
          admin.role === "HR_MANAGER" ? admin.companyId?.code : null
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
