import express from "express";
import { logContentActivity, listContentActivity, getUserContentActivityById } from "../controllers/activityController";
import { verifyToken } from "../middleware/activityMiddleware"; // your auth


const router = express.Router();


router.post("/log", verifyToken, logContentActivity);
router.get("/", verifyToken, listContentActivity); // admin listing with pagination and filters
router.get(
  "/content-activity/:userId",
  verifyToken,
  getUserContentActivityById
);


export default router;