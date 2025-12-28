import { Schema, model, Document, Types } from 'mongoose';

export type UserRole =
  | 'GUEST'
  | 'EMPLOYEE'
  | 'TEAMLEAD'
  | 'TEACHER'
  | 'STUDENT'
  | null;

export type ReferenceType = 'Team' | 'Class' | null;

export interface IUser extends Document {
  name?: string;
  email: string;
  password: string;
  role: UserRole;
  isVerified: boolean;
  otp?: string | null;
  otpExpiresAt?: Date | null;
  authProvider: 'local' | 'google' | 'facebook';
  referenceType: ReferenceType;
  referenceId?: Types.ObjectId | null;
  avatar?: string | null;
  phone?: string | null;
  isDeleted: boolean;
  deletedAt?: Date | null;
  userRoles?: any[];
}

export type IUserWithRoles = IUser & {
  userRoles: any[];
};

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatar: { type: String, default: null },
    phone: { type: String, default: null },
    password: {
      type: String,
      required: function (this: IUser) {
        return this.authProvider === 'local';
      },
    },

    role: {
      type: String,
      enum: ['GUEST', 'EMPLOYEE', 'TEAMLEAD', 'TEACHER', 'STUDENT', null],
      default: 'GUEST',
    },

    isVerified: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },

    authProvider: {
      type: String,
      enum: ['local', 'google', 'facebook'],
      default: 'local',
    },

    referenceType: {
      type: String,
      enum: ['Team', 'Class', null],
      default: null,
    },

    referenceId: {
      type: Schema.Types.ObjectId,
      refPath: 'referenceType',
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

/* 🔥 AUTO-FIX WRONG referenceType LIKE "CLASS" or "class" */
userSchema.pre('save', function (next) {
  if (this.referenceType && this.referenceType.toLowerCase() === 'class') {
    this.referenceType = 'Class'; // Correct case
  }
  next();
});

export default model<IUser>('User', userSchema);
