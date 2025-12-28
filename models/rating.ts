import mongoose, { Schema, Document } from 'mongoose';

export interface IRating extends Document {
  seller: mongoose.Types.ObjectId;
  comment?: string;
  rating: number;
  createdBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const RatingSchema = new Schema<IRating>({
  comment: {
    type: String,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
    required: true,
  },
  deletedAt: {
    type: Date,
  },
}, {
  timestamps: true,
  collection: 'ratings',
});

const Rating = mongoose.model<IRating>("Rating", RatingSchema);

export default Rating;
