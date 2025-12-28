import express from "express";
import { verifyToken } from '../middleware/authMiddleware';
import {
    listHealthScans,
    saveHealthScan,
//   getUserScans
} from "../controllers/healthScanController";

const router = express.Router();

router.post("/create", verifyToken, saveHealthScan);
router.get("/list", verifyToken,listHealthScans);

export default router;
