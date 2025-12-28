import { Request, Response } from 'express';
import Admin from '../../models/admin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Employee from '../../models/Employee';
import Team from '../../models/Team';

/**Hr Login */
export const hrManagerLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const admin = await Admin.findOne({
      email,
      role: 'HR_MANAGER',
      isDeleted: false
    });

    if (!admin) {
      return res.status(404).json({ success: false, message: 'HR Manager not found' });
    }

    if (!admin.status) {
      return res.status(403).json({ success: false, message: 'Account is disabled' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role,
        email: admin.email,
        companyId: admin.companyId
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      message: 'HR Manager login successful',
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        companyId: admin.companyId
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


