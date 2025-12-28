import mongoose, { Schema, Document } from 'mongoose';

export interface ISignupOtp extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  otp: string;
  expiresAt: Date;
}

const SignupOtpSchema = new Schema<ISignupOtp>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true }
});

export default mongoose.model<ISignupOtp>('SignupOtp', SignupOtpSchema);
