import { Request, Response } from "express";
import HealthScan from "../../models/HealthScan";
import mongoose from "mongoose";

export const saveHealthScan = async (req: Request, res: Response) => {
  try {
    const { userId, age, gender, weight, height, ...optionalData } = req.body;

    if (
      !userId ||
      age === undefined ||
      gender === undefined ||
      weight === undefined ||
      height === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "age, gender, weight, height are mandatory and must be numbers"
      });
    }

    const scan = await HealthScan.create({
      userId,
      age,
      gender,
      weight,
      height,
      ...optionalData
    });

    res.status(201).json({
      success: true,
      message: "Health scan saved successfully",
      data: scan
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};




export const listHealthScans = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { userId, search, fromDate, toDate } = req.query;

    const matchStage: any = {};

    // 🔹 Filter by userId
    if (userId) {
      matchStage.userId = new mongoose.Types.ObjectId(userId as string);
    }

    // 🔹 Date range filter
    if (fromDate || toDate) {
      matchStage.createdAt = {};
      if (fromDate) matchStage.createdAt.$gte = new Date(fromDate as string);
      if (toDate) matchStage.createdAt.$lte = new Date(toDate as string);
    }

    // 🔍 Numeric search (health fields)
    if (search && !isNaN(Number(search))) {
      const searchNumber = Number(search);
      matchStage.$or = [
        { age: searchNumber },
        { gender: searchNumber },
        { weight: searchNumber },
        { height: searchNumber },
        { heartRate: searchNumber },
        { spo2: searchNumber },
        { stressScore: searchNumber },
        { bmi: searchNumber },
        { bloodSugar: searchNumber },
        { bloodPressureSystolic: searchNumber },
        { bloodPressureDiastolic: searchNumber }
      ];
    }

    const pipeline: any[] = [
      { $match: matchStage },

      // 🔗 Join users
      {
        $lookup: {
          from: "users", // MongoDB collection name
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },

      // 🔍 Search by user name/email
      ...(search && isNaN(Number(search))
        ? [
            {
              $match: {
                $or: [
                  { "user.name": { $regex: search, $options: "i" } },
                  { "user.email": { $regex: search, $options: "i" } }
                ]
              }
            }
          ]
        : []),

      // 🧹 Select only required user fields
      {
        $project: {
          "user.password": 0,
          "user.otp": 0,
          "user.isDeleted": 0
        }
      },

      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ];

    const countPipeline = [...pipeline];
    countPipeline.splice(-3); // remove skip & limit

    const [data, totalResult] = await Promise.all([
      HealthScan.aggregate(pipeline),
      HealthScan.aggregate([
        ...countPipeline,
        { $count: "total" }
      ])
    ]);

    const total = totalResult[0]?.total || 0;

    return res.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

