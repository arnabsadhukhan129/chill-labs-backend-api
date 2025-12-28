import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from '../../models/admin';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/chill_labs_db';

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    const existing = await Admin.findOne({ email: 'superadmin@yopmail.com' });

    if (existing) {
      console.log('✅ Super Admin already exists');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    await Admin.create({
      name: 'Super Admin',
      email: 'superadmin@yopmail.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      status: true
    });

    console.log('✅ Super Admin created successfully');
    console.log('-----------------------------');
    console.log('Email: superadmin@yopmail.com');
    console.log('Password: Admin@123');
    console.log('Role: SUPER_ADMIN');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating Super Admin:', error);
    process.exit(1);
  }
};

createSuperAdmin();
