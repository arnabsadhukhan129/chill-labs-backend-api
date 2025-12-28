import mongoose, { Schema, Document } from "mongoose";

export interface IUserAddress extends Document {
  user_id: mongoose.Types.ObjectId;
  address_type: "current" | "permanent";
  latitude: string;
  longitude: string;
  country?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserAddressSchema = new Schema<IUserAddress>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  address_type: {
    type: String,
    enum: ["current", "permanent"],
    default: "current",
  },
  latitude: {
    type: String,
    required: true,
  },
  longitude: {
    type: String,
    required: true,
  },
  country: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  postalCode: {
    type: String,
  },
  address: {
    type: String,
  },
}, {
  timestamps: true,
  collection: "user_address",
});

const UserAddress = mongoose.model<IUserAddress>("UserAddress", UserAddressSchema);

export default UserAddress;
