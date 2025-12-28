import mongoose, { Schema, Document } from 'mongoose';

export interface ISchool extends Document {
  name: string;
  code: string;
  isDeleted: boolean;
}

const SchoolSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model<ISchool>('School', SchoolSchema);
