import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  email: string;
  password: string;
  classId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId; // USER NOW
  schoolId: mongoose.Types.ObjectId;
  studentCode: string;
  isDeleted: boolean;
}

const StudentSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },

    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // FIXED

    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },

    studentCode: { type: String, unique: true },

    isDeleted: { type: Boolean, default: false }
  },

  { timestamps: true }
);

export default mongoose.model<IStudent>('Student', StudentSchema);
