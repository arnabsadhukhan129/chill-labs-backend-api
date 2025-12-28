import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {
  name: string;
  description?: string;
  color?: string;
  is_active: boolean;
  is_deleted: boolean;
  role_type: "client" | "staff" | "admin";
  parent_id?: mongoose.Types.ObjectId;
  role_slug: string;
  role_level: string;
  modulesPermissions?: any[];
  createdAt?: Date;
  updatedAt?: Date;

  // Methods
  isActive(): boolean;
}

const RoleSchema = new Schema<IRole>({
  name: {
    type: String,
    required: true,
    unique: true,
    maxlength: 100,
  },
  description: {
    type: String,
    maxlength: 255,
  },
  color: {
    type: String,
    maxlength: 255,
  },
  is_active: {
    type: Boolean,
    default: true,
    required: true,
  },
  is_deleted: {
    type: Boolean,
    default: false,
    required: true,
  },
  role_type: {
    type: String,
    enum: ["client", "staff", "admin"],
    default: "staff",
    required: true,
  },
  parent_id: {
    type: Schema.Types.ObjectId,
    ref: "Role",
  },
  role_slug: {
    type: String,
    required: true,
  },
  role_level: {
    type: String,
    default: "LVL-5",
    required: true,
  },
}, {
  timestamps: true,
  collection: "roles",
});

// Instance methods
RoleSchema.methods.isActive = function (): boolean {
  return this.is_active;
};

// Virtual for modulesPermissions
RoleSchema.virtual('modulesPermissions', {
  ref: 'RoleModulePermission',
  localField: '_id',
  foreignField: 'role_id',
});

// Ensure virtual fields are serialized
RoleSchema.set('toJSON', {
  virtuals: true
});

const Role = mongoose.model<IRole>("Role", RoleSchema);

export default Role;
