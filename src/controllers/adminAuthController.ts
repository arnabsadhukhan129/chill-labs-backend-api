import { Request, Response } from 'express';
import Admin from '../../models/admin';
import bcrypt from 'bcryptjs';

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json({
      message: 'Admin created successfully',
      admin
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
