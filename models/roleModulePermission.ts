import mongoose, { Schema, Document } from "mongoose";

export interface IRoleModulePermission extends Document {
  module_id: mongoose.Types.ObjectId;
  permission_id: mongoose.Types.ObjectId;
  role_id: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const RoleModulePermissionSchema = new Schema<IRoleModulePermission>({
  module_id: {
    type: Schema.Types.ObjectId,
    required: true,
    // Note: Since we removed Module model, we'll store as string reference
    // You may need to create a Module model or adjust this based on your needs
  },
  permission_id: {
    type: Schema.Types.ObjectId,
    ref: "Permission",
    required: true,
  },
  role_id: {
    type: Schema.Types.ObjectId,
    ref: "Role",
    required: true,
  },
}, {
  timestamps: true,
  collection: "role_module_permissions",
});


const RoleModulePermission = mongoose.model<IRoleModulePermission>("RoleModulePermission", RoleModulePermissionSchema);

export default RoleModulePermission;
