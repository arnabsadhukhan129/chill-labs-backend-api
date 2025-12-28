import { Router } from "express";
import { changePassword, deleteAccount, getProfile, updateProfile } from "../controllers/profile.controller";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/change-password", protect, changePassword);
router.get("/view-profile", protect, getProfile);
router.put("/update-profile", protect, updateProfile); 
router.delete('/delete-account', protect, deleteAccount);

export default router;
