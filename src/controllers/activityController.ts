import Company from "../../models/company";
import School from "../../models/School";
import SubCategory from "../../models/sub-category";
import ContentActivity from "../../models/ContentActivity";
import Admin from "../../models/admin";
import Team from "../../models/Team";
import User from "../../models/User";
import Class from "../../models/Class";
import mongoose from "mongoose";


// =======================================================
//  LOG CONTENT ACTIVITY
// =======================================================
export const logContentActivity = async (req: any, res: any) => {
  try {
    const { contentId, contentType } = req.body;

    if (!contentId || !contentType) {
      return res.status(400).json({
        success: false,
        message: "contentId and contentType are required"
      });
    }

    // -------- FIX: Strong typing for TypeScript --------
    const modelMap: Record<string, string> = {
      book: "Book",
      video: "Video",
      audio: "Audio"
    };

    const actionMap: Record<string, string> = {
      book: "read",
      video: "watch",
      audio: "listen"
    };

    if (!modelMap[contentType]) {
      return res.status(400).json({
        success: false,
        message: "Invalid contentType"
      });
    }

    const entry = await ContentActivity.create({
      userId: req.user.id,          // 🔥 use id, not _id (from middleware)
      role: req.user.role,
      schoolId: req.user.schoolId || null,
      companyId: req.user.companyId || null,
      contentId,
      contentType,
      contentTypeModel: modelMap[contentType],
      action: actionMap[contentType],
      platform: req.headers["x-platform"] || "Android",
      ipAddress: req.ip,
      meta: {}
    });

    return res.json({
      success: true,
      message: "Activity logged successfully",
      entry
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};



// =======================================================
//  LIST CONTENT ACTIVITY
// =======================================================
// export const listContentActivity = async (req: any, res: any) => {
//   try {
//     const filters: any = {};

//     // ROLE BASED FILTER
//     if (req.user.role === "SCHOOL_ADMIN") filters.schoolId = req.user.schoolId;
//     if (req.user.role === "HR_MANAGER") filters.companyId = req.user.companyId;

//     // PAGINATION
//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     // 🔍 SEARCH (USER NAME + ACTION ONLY)
//     const search = req.query.search?.trim();

//     if (search) {
//       const users = await User.find({
//         name: { $regex: search, $options: "i" }
//       }).select("_id");

//       const userIds = users.map(u => u._id);

//       filters.$or = [
//         { action: { $regex: search, $options: "i" } },
//         { userId: { $in: userIds } }
//       ];
//     }

//     const total = await ContentActivity.countDocuments(filters);

//     const logs = await ContentActivity.find(filters)
//       .populate("userId", "name email role referenceId")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     // ⬇ keep your existing processing logic as-is ⬇

//     return res.json({
//       success: true,
//       page,
//       limit,
//       total,
//       totalPages: Math.ceil(total / limit),
//       logs
//     });

//   } catch (err: any) {
//     console.log(err);
//     return res.status(500).json({
//       success: false,
//       message: err.message
//     });
//   }
// };

export const listContentActivity = async (req: any, res: any) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const match: any = {};

    // ROLE BASED FILTER
    if (req.user.role === "SCHOOL_ADMIN") match.schoolId = req.user.schoolId;
    if (req.user.role === "HR_MANAGER") match.companyId = req.user.companyId;

    // 🔍 SEARCH (user name OR action)
    if (req.query.search?.trim()) {
      const users = await User.find({
        name: { $regex: req.query.search, $options: "i" }
      }).select("_id");

      match.$or = [
        { action: { $regex: req.query.search, $options: "i" } },
        { userId: { $in: users.map(u => u._id) } }
      ];
    }

    const pipeline: any[] = [
      { $match: match },

      // USER INFO
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },

      // 🔥 LOOKUP SUBCATEGORY CONTENT
      {
        $lookup: {
          from: "sub-categories",
          let: { contentId: "$contentId" },
          pipeline: [
            { $unwind: "$content" },
            {
              $match: {
                $expr: { $eq: ["$content._id", "$$contentId"] }
              }
            },
            {
              $project: {
                _id: 0,
                contentName: "$content.name",
                contentUrl: "$content.url",
                contentTime: "$content.time"
              }
            }
          ],
          as: "content"
        }
      },

      { $unwind: { path: "$content", preserveNullAndEmptyArrays: true } },

      // RESPONSE SHAPE
      {
        $project: {
          action: 1,
          contentType: 1,
          platform: 1,
          createdAt: 1,

          user: {
            name: "$user.name",
            email: "$user.email",
            role: "$user.role"
          },

          contentName: "$content.contentName",
          contentUrl: "$content.contentUrl",
          contentTime: "$content.contentTime"
        }
      },

      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ];

    const logs = await ContentActivity.aggregate(pipeline);

    const total = await ContentActivity.countDocuments(match);

    return res.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      logs
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// export const getUserContentActivityById = async (req: any, res: any) => {
//   try {
//     const { userId } = req.params;

//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     if (!userId) {
//       return res.status(400).json({
//         success: false,
//         message: "User ID is required"
//       });
//     }

//     const match: any = {
//       userId: new mongoose.Types.ObjectId(userId)
//     };

//     // 🔐 ROLE BASED ACCESS
//     if (req.user.role === "SCHOOL_ADMIN") {
//       match.schoolId = req.user.schoolId;
//     }

//     if (req.user.role === "HR_MANAGER") {
//       match.companyId = req.user.companyId;
//     }

//     const pipeline: any[] = [
//       { $match: match },

//       // 👤 USER INFO
//       {
//         $lookup: {
//           from: "users",
//           localField: "userId",
//           foreignField: "_id",
//           as: "user"
//         }
//       },
//       { $unwind: "$user" },

//       // 📚 SUBCATEGORY CONTENT LOOKUP
//       {
//         $lookup: {
//           from: "sub-categories",
//           let: { contentId: "$contentId" },
//           pipeline: [
//             { $unwind: "$content" },
//             {
//               $match: {
//                 $expr: { $eq: ["$content._id", "$$contentId"] }
//               }
//             },
//             {
//               $project: {
//                 _id: 0,
//                 contentName: "$content.name",
//                 contentUrl: "$content.url",
//                 contentTime: "$content.time"
//               }
//             }
//           ],
//           as: "content"
//         }
//       },
//       {
//         $unwind: {
//           path: "$content",
//           preserveNullAndEmptyArrays: true
//         }
//       },

//       // 🎯 RESPONSE SHAPE
//       {
//         $project: {
//           action: 1,
//           contentType: 1,
//           platform: 1,
//           createdAt: 1,

//           user: {
//             name: "$user.name",
//             email: "$user.email",
//             role: "$user.role"
//           },

//           contentName: "$content.contentName",
//           contentUrl: "$content.contentUrl",
//           contentTime: "$content.contentTime"
//         }
//       },

//       { $sort: { createdAt: -1 } },
//       { $skip: skip },
//       { $limit: limit }
//     ];

//     const logs = await ContentActivity.aggregate(pipeline);

//     const total = await ContentActivity.countDocuments(match);

//     return res.json({
//       success: true,
//       page,
//       limit,
//       total,
//       totalPages: Math.ceil(total / limit),
//       logs
//     });

//   } catch (error: any) {
//     return res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };


export const getUserContentActivityById = async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    const search = req.query.search?.trim();

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const match: any = {
      userId: new mongoose.Types.ObjectId(userId)
    };

    //ROLE BASED ACCESS
    if (req.user?.role === "SCHOOL_ADMIN") {
      match.schoolId = req.user.schoolId;
    }

    if (req.user?.role === "HR_MANAGER") {
      match.companyId = req.user.companyId;
    }

    const pipeline: any[] = [
      { $match: match },

      //USER INFO
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },

      // SUBCATEGORY CONTENT LOOKUP
      {
        $lookup: {
          from: "sub-categories",
          let: { contentId: "$contentId" },
          pipeline: [
            { $unwind: "$content" },
            {
              $match: {
                $expr: { $eq: ["$content._id", "$$contentId"] }
              }
            },
            {
              $project: {
                _id: 0,
                contentName: "$content.name",
                contentUrl: "$content.url",
                contentTime: "$content.time"
              }
            }
          ],
          as: "content"
        }
      },
      {
        $unwind: {
          path: "$content",
          preserveNullAndEmptyArrays: true
        }
      }
    ];

    // SEARCH FILTER (after lookups)
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { action: { $regex: search, $options: "i" } },
            { platform: { $regex: search, $options: "i" } },
            { contentType: { $regex: search, $options: "i" } },
            { "content.contentName": { $regex: search, $options: "i" } }
          ]
        }
      });
    }

    // RESPONSE SHAPE + PAGINATION
    pipeline.push(
      {
        $project: {
          action: 1,
          contentType: 1,
          platform: 1,
          createdAt: 1,

          user: {
            name: "$user.name",
            email: "$user.email",
            role: "$user.role"
          },

          contentName: "$content.contentName",
          contentUrl: "$content.contentUrl",
          contentTime: "$content.contentTime"
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    );

    const logs = await ContentActivity.aggregate(pipeline);

    // 🔢 TOTAL COUNT (with same filters)
    const countPipeline = pipeline.filter(
      stage => !("$skip" in stage || "$limit" in stage || "$sort" in stage)
    );

    countPipeline.push({ $count: "total" });

    const countResult = await ContentActivity.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    return res.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      logs
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

