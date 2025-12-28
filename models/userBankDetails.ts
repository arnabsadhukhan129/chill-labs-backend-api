import mongoose, { Schema, Document } from "mongoose";

export interface IUserBankDetails extends Document {
  userId: mongoose.Types.ObjectId;
  accountOwnerName?: string;
  upiId?: string;
  upiVerified: boolean;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  is_updated: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserBankDetailsSchema = new Schema<IUserBankDetails>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  accountOwnerName: {
    type: String,
  },
  upiId: {
    type: String,
  },
  upiVerified: {
    type: Boolean,
    default: false,
    required: true,
  },
  bankName: {
    type: String,
  },
  accountNumber: {
    type: String,
  },
  ifscCode: {
    type: String,
  },
  is_updated: {
    type: Boolean,
    default: false,
    required: true,
  },
}, {
  timestamps: true,
  collection: "user_bank_details",
});

const UserBankDetails = mongoose.model<IUserBankDetails>("UserBankDetails", UserBankDetailsSchema);

export default UserBankDetails;
