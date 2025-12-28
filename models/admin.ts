import mongoose, { Document, Schema } from 'mongoose';

export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  role: 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'HR_MANAGER';
  status: boolean;
  schoolId?: mongoose.Types.ObjectId;
  companyId?: mongoose.Types.ObjectId;
  isDeleted: boolean;
}

const AdminSchema: Schema<IAdmin> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'HR_MANAGER'],
      required: true
    },

    status: { type: Boolean, default: true },

    // Required ONLY for School Admin
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required(this: IAdmin) {
        return this.role === 'SCHOOL_ADMIN';
      }
    },

    // Required ONLY for HR
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required(this: IAdmin) {
        return this.role === 'HR_MANAGER';
      }
    },

    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Unique per SCHOOL for SCHOOL_ADMIN
// AdminSchema.index(
//   { schoolId: 1, role: 1 },
//   {
//     unique: true,
//     partialFilterExpression: { role: 'SCHOOL_ADMIN', isDeleted: false }
//   }
// );

AdminSchema.index(
  { schoolId: 1, role: 1 },
  {
    unique: true,
    partialFilterExpression: {
      role: 'SCHOOL_ADMIN',
      isDeleted: false,
      schoolId: { $exists: true }
    }
  }
);

// Unique per COMPANY for HR_MANAGER
// AdminSchema.index(
//   { companyId: 1, role: 1 },
//   {
//     unique: true,
//     partialFilterExpression: { role: 'HR_MANAGER', isDeleted: false }
//   }
// );

AdminSchema.index(
  { companyId: 1, role: 1 },
  {
    unique: true,
    partialFilterExpression: {
      role: 'HR_MANAGER',
      isDeleted: false,
      companyId: { $exists: true }
    }
  }
);

export default mongoose.model<IAdmin>('Admin', AdminSchema);
