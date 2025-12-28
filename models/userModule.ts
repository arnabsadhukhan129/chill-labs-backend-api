import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'TEAM_LEAD' | 'EMPLOYEE' | 'TEACHER' | 'STUDENT' | 'GUEST';
  socialProvider?: 'google' | 'facebook';
  socialId?: string;
  status: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
      type: String,
      enum: ['TEAM_LEAD', 'EMPLOYEE', 'TEACHER', 'STUDENT', 'GUEST'],
      required: true
    },
    socialProvider: { 
      type: String, 
      enum: ['google', 'facebook']
    },
    socialId: { 
      type: String,
      unique: true,
      sparse: true 
    },
    status: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
