import mongoose, { Schema, Document } from "mongoose";

export interface IUserRole extends Document {
  userId: mongoose.Types.ObjectId;
  roleId: mongoose.Types.ObjectId;
  created_by: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserRoleSchema = new Schema<IUserRole>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  roleId: {
    type: Schema.Types.ObjectId,
    ref: "Role",
    required: true,
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, {
  timestamps: true,
  collection: "user_roles",
});

// Compound index to ensure unique user-role combinations
UserRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true });

const UserRole = mongoose.model<IUserRole>("UserRole", UserRoleSchema);

export default UserRole;
