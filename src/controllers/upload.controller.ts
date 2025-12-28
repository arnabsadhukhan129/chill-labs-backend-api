import { Request, Response } from "express";
import { uploadBufferToS3, buildS3Key } from "../services/uploade.service";

export const uploadFiles = async (req: Request, res: Response) => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const files = req.files as Express.Multer.File[];

    const uploadedFiles = await Promise.all(
      files.map(file => {
        const key = buildS3Key(file.originalname); // ✅ include folder
        return uploadBufferToS3(file.buffer, key, file.mimetype);
      })
    );

    return res.json({
      success: true,
      message: "Files uploaded successfully",
      uploadedFiles,
    });

  } catch (error: any) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: error.message ,success: false, message: error.message || "Upload failed" });
  }
};
