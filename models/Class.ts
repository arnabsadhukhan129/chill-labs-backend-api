import { Schema, model, Document, Types } from 'mongoose';

export interface IClass extends Document {
  name: string;
  classCode: string;
  schoolId: Types.ObjectId;
  teacher?: Types.ObjectId | null; // User ID
  isDeleted?: boolean;
}

const classSchema = new Schema<IClass>(
  {
    name: { type: String, required: true },
    classCode: { type: String, unique: true, required: true },

    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },

    teacher: { type: Schema.Types.ObjectId, ref: 'User', default: null }, // FIXED
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default model<IClass>('Class', classSchema);
