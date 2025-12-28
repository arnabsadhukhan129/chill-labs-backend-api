import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  image: string;
  isDeleted: boolean;
}

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true, unique: true },
    isDeleted: { type: Boolean, default: false },
    // courseId: { type: mongoose.Types.ObjectId, ref: 'Course', required: true }
  },
  { timestamps: true }
);

export default mongoose.model<ICategory>('Category', CategorySchema);
