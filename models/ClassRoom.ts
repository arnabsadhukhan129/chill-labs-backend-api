import { Schema, model, Document, Types } from 'mongoose';

export interface IClassRoom extends Document {
  className: string;
  classCode: string;
  teacher?: Types.ObjectId | null; // User id
  createdAt: Date;
  updatedAt: Date;
}

const classRoomSchema = new Schema<IClassRoom>(
  {
    className: { type: String, required: true, trim: true },
    classCode: { type: String, required: true, unique: true, uppercase: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

const ClassRoom = model<IClassRoom>('ClassRoom', classRoomSchema);
export default ClassRoom;
