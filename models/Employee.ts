import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  name: string;
  email: string;
  phone: string;
  position: string;
  password: string;
  schoolId?: mongoose.Types.ObjectId;   // ✅ OPTIONAL
  teamId?: mongoose.Types.ObjectId;
  isDeleted: boolean;
}

const EmployeeSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String},
    position: { type: String, default: 'employee' },
    password: { 
      type: String, 
      required: true,
      select: false   // ✅ hides password from responses
    },
    // ✅ schoolId no longer mandatory
    schoolId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'School', 
      required: false 
    },

    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team'},
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Employee = mongoose.model<IEmployee>('Employee', EmployeeSchema);
export default Employee;
