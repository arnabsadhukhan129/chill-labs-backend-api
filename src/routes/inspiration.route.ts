import { Router } from "express";
import {
  createInspiration,
  listInspirations,
  getInspirationById,
  updateInspiration,
  deleteInspiration
} from "../controllers/inspirationController";
import { verifyToken } from "../middleware/authMiddleware";
import { allowRoles } from "../middleware/roleMiddleware";

const router = Router();

router.post("/",verifyToken,allowRoles('SUPER_ADMIN'), createInspiration);
router.get("/",verifyToken, listInspirations);
router.get("/:id",verifyToken, getInspirationById);
router.put("/:id",verifyToken, allowRoles('SUPER_ADMIN'), updateInspiration);
router.delete("/:id",verifyToken, allowRoles('SUPER_ADMIN'), deleteInspiration);

export default router;
