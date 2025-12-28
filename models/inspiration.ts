import { Schema, model, Document } from "mongoose";

export interface IInspiration extends Document {
  title: string;
  description?: string;
  videoUrl: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
}

const InspirationSchema = new Schema<IInspiration>(
  {
    title: { type: String, required: true },
    description: { type: String },
    videoUrl: { type: String, required: true },

    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default model<IInspiration>("Inspiration", InspirationSchema);
