import User from "../../models/User";
import UserRole from "../../models/userRole";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

class AuthService {

  // ================= UPDATE USER (ADMIN) =================
  async updateStaffByAdmin(
    userId: string,
    data: {
      name?: string;
      email?: string;
      roleIds?: string[];
    },
    updatedBy?: string
  ) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      if (data.name) user.name = data.name;
      if (data.email) user.email = data.email;

      await user.save();

      // Update role mappings
      if (data.roleIds && data.roleIds.length > 0) {
        await UserRole.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });

        for (const roleId of data.roleIds) {
          await UserRole.create({
            userId: new mongoose.Types.ObjectId(userId),
            roleId: new mongoose.Types.ObjectId(roleId),
            created_by: updatedBy ? new mongoose.Types.ObjectId(updatedBy) : null
          });
        }
      }

      return { message: "User updated successfully" };
    } catch (error: any) {
      throw new Error("Error updating user: " + error.message);
    }
  }

  // ================= CHANGE USER ROLE TYPE =================
  async changeUserType(userId: string, role: string) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      user.role = role as any;
      await user.save();

      return { message: "User role updated successfully" };
    } catch (error: any) {
      throw new Error("Error changing user role: " + error.message);
    }
  }

  // ================= ADMIN LOGIN =================
  async adminLogin(email: string, password: string) {
    try {
      const user = await User.findOne({ email });
      if (!user || !user.password) {
        throw new Error("Invalid credentials");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new Error("Invalid credentials");

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "7d" }
      );

      return {
        token,
        user
      };
    } catch (error: any) {
      throw new Error("Login failed: " + error.message);
    }
  }

  async getUserById(userId: string) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");
      return user;
    } catch (error: any) {
      throw new Error("Error fetching user: " + error.message);
    }
  }
}

export default new AuthService();
