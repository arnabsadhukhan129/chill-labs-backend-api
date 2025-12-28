import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  code: string;
  isDeleted: boolean;
}

const CompanySchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model<ICompany>('Company', CompanySchema);
