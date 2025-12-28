// types/user.d.ts
import { Model } from 'sequelize';

interface UserAttributes {
  id: number;
  username?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  googleId?: string;
  otp?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserInstance extends Model<UserAttributes>, UserAttributes {}

declare const User: typeof Model & {
  new (values?: object, options?: any): UserInstance;
  // Define any additional static methods if needed
};

export default User;
