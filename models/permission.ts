import mongoose, { Schema, Document } from 'mongoose';

export interface IPermission extends Document {
  name: string;
  slug?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const PermissionSchema = new Schema<IPermission>({
  name: {
    type: String,
    required: true,
    maxlength: 150,
  },
  slug: {
    type: String,
    maxlength: 200,
  },
}, {
  timestamps: true,
  collection: 'permissions',
});


const Permission = mongoose.model<IPermission>("Permission", PermissionSchema);

export default Permission;
