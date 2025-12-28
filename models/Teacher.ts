import { Schema, model, Document, Types } from "mongoose";

export interface ITeacher extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  classId: Types.ObjectId;
  teacherCode: string;
  isDeleted?: boolean;
}

const teacherSchema = new Schema<ITeacher>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    password: { type: String, required: true },

    // FIXED — correct reference
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },

    teacherCode: { type: String, unique: true },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default model<ITeacher>("Teacher", teacherSchema);
