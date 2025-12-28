import { Request, Response } from "express";
import Inspiration from "../../models/inspiration";

export const createInspiration = async (req: Request, res: Response) => {
  try {
    const { title, description, videoUrl } = req.body;

    if (!title || !videoUrl) {
      return res.status(400).json({
        success: false,
        message: "Title and video URL are required"
      });
    }

    const inspiration = await Inspiration.create({
      title,
      description,
      videoUrl
    });

    res.status(201).json({
      success: true,
      message: "Inspiration added successfully",
      data: inspiration
    });

  } catch (error) {
    console.error("Create Inspiration Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const listInspirations = async (req: Request, res: Response) => {
  try {
    const data = await Inspiration.find({
      isDeleted: false,
      isActive: true
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error("List Inspiration Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


export const deleteInspiration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const inspiration = await Inspiration.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!inspiration) {
      return res.status(404).json({
        success: false,
        message: "Inspiration not found"
      });
    }

    res.json({
      success: true,
      message: "Inspiration deleted"
    });

  } catch (error) {
    console.error("Delete Inspiration Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


export const getInspirationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const inspiration = await Inspiration.findOne({
      _id: id,
      isDeleted: false
    });

    if (!inspiration) {
      return res.status(404).json({
        success: false,
        message: "Inspiration not found"
      });
    }

    return res.json({
      success: true,
      data: inspiration
    });

  } catch (error) {
    console.error("Get Inspiration By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};



export const updateInspiration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, videoUrl, isActive } = req.body;

    const inspiration = await Inspiration.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        title,
        description,
        videoUrl,
        isActive
      },
      { new: true }
    );

    if (!inspiration) {
      return res.status(404).json({
        success: false,
        message: "Inspiration not found or deleted"
      });
    }

    return res.json({
      success: true,
      message: "Inspiration updated successfully",
      data: inspiration
    });

  } catch (error) {
    console.error("Update Inspiration Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};
