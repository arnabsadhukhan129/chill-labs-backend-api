import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../../models/User";

// ================= PROFILE CHANGE PASSWORD =================
export const changePassword = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id; // from JWT middleware
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password & confirm password do not match"
      });
    }

    const user = await User.findById(userId);

    if (!user || !user.password) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to change password"
    });
  }
};


// ================= GET PROFILE =================
export const getProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;

    const user = await User.findById(userId).select("-password -otp -otpExpiresAt");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.json({
      success: true,
      message: "Profile fetched successfully",
      data: user
    });

  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile"
    });
  }
};


// ================= UPDATE PROFILE =================
export const updateProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, email, phone, avatar } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update fields only if they exist in body
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    await user.save();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile"
    });
  }
};


export const deleteAccount = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id; // Authenticated user ID

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Account already deleted"
      });
    }

    // Soft delete
    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();

    return res.json({
      success: true,
      message: "Account deleted successfully"
    });

  } catch (error) {
    console.error("Delete Account Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete account"
    });
  }
};

