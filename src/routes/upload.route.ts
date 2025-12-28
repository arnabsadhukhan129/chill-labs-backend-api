import { Router } from "express";
import multer from "multer";
import { uploadFiles } from "../controllers/upload.controller";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post("/files", upload.array("files"), uploadFiles);
// router.delete("/", deleteFile);

export default router;
