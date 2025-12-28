// src/services/user.service.ts
import User from "../../models/User";
import mongoose from "mongoose";

class UserService {
  // Create a new user
  async createUser(data: any) {
    try {
      const user = await User.create(data);
      return user;
    } catch (error: any) {
      throw new Error("Error creating user: " + error.message);
    }
  }

  // Find user by email
  async findUserByEmail(email: string) {
    try {
      const user = await User.findOne({ email });
      return user;
    } catch (error: any) {
      throw new Error("Error finding user by email: " + error.message);
    }
  }

  // Find user by ID
  async getUserById(id: string) {
    try {
      const user = await User.findById(id);
      return user;
    } catch (error: any) {
      throw new Error("Error finding user by id: " + error.message);
    }
  }

  // Find multiple users by IDs
  async getUsersByIds(ids: string[]): Promise<any[]> {
    try {
      const users = await User.find({
        _id: { $in: ids.map(id => new mongoose.Types.ObjectId(id)) }
      }).select("_id name email role createdAt updatedAt");
      return users;
    } catch (error: any) {
      throw new Error("Error finding users by IDs: " + error.message);
    }
  }

  // Update OTP for user (by email instead of phone)
  async updateUserOtp(email: string, otp: string) {
    try {
      const user = await User.findOne({ email });
      if (!user) throw new Error("User not found");

      user.otp = otp;
      await user.save();
      return user;
    } catch (error: any) {
      throw new Error("Error updating OTP: " + error.message);
    }
  }

  // Soft delete user
  async deleteUser(id: string) {
    try {
      const user = await User.findById(id);
      if (!user) throw new Error("User not found");

      await user.deleteOne(); // actual delete
      return true;
    } catch (error: any) {
      throw new Error("Error deleting user: " + error.message);
    }
  }

  // Get basic user statistics by role
  async getUserRoleStatistics() {
    try {
      const statistics = await User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } },
        { $project: { role: "$_id", count: 1, _id: 0 } }
      ]);
      return statistics;
    } catch (error: any) {
      throw new Error("Error retrieving user role statistics: " + error.message);
    }
  }
}

export default new UserService();
