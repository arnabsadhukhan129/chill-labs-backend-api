import { Request, Response } from 'express';
import SubCategory from '../../models/sub-category';
import SearchHistory from "../../models/searchHistory";

import mongoose, { PipelineStage } from 'mongoose';


/* CREATE SUB-CATEGORY */
export const createSubCategory = async (req: Request, res: Response) => {
    try {
        const { name, image, content, categoryId,content_type,discription } = req.body;

        if (!name || !image || !categoryId) {
            return res.status(400).json({
                success: false,
                message: 'Sub-category name, Category and image are required'
            });
        }

        const activeContent = content?.filter((c: any) => !c.isDeleted) || [];
        const content_length = activeContent.length;
        const content_time = activeContent.reduce(
            (sum: number, c: any) => sum + (c.time || 0),
            0
        );

        const subCategory = await SubCategory.create({
            name,
            image,
            content,
            content_length,
            content_time,
            categoryId,
            content_type
        });

        return res.status(201).json({
            success: true,
            message: 'Sub-category created successfully',
            data: subCategory
        });

    } catch (error: any) {
        console.error('Create Sub-Category Error:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Image must be unique'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

/* LIST ONLY ACTIVE SUB-CATEGORIES WITH PAGINATION */
// export const listSubCategories = async (req: Request, res: Response) => {
//   try {
//     const page  = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 10;
//     const skip  = (page - 1) * limit;

//     const searchTag = (req.query.search as string) || '';

//     const pipeline: PipelineStage[] = [
//       { $match: { isDeleted: false } },

//       // Filter content + tag search
//       {
//         $addFields: {
//           content: {
//             $filter: {
//               input: "$content",
//               as: "c",
//               cond: {
//                 $and: [
//                   { $eq: ["$$c.isDeleted", false] },
//                   ...(searchTag
//                     ? [{
//                         $in: [
//                           searchTag.toLowerCase(),
//                           {
//                             $map: {
//                               input: "$$c.tags",
//                               as: "t",
//                               in: { $toLower: "$$t" }
//                             }
//                           }
//                         ]
//                       }]
//                     : [])
//                 ]
//               }
//             }
//           }
//         }
//       },

//       // remove docs with empty content when tag search is used
//       ...(searchTag
//         ? [{
//             $match: { "content.0": { $exists: true } }
//           }]
//         : []),

//       {
//         $addFields: {
//           content_length: { $size: "$content" },
//           content_time: { $sum: "$content.time" }
//         }
//       },

//       { $sort: { createdAt: -1 } as any },
//       { $skip: skip },
//       { $limit: limit }
//     ];

//     const [subCategories, total] = await Promise.all([
//       SubCategory.aggregate(pipeline),
//       SubCategory.countDocuments({ isDeleted: false })
//     ]);

//     res.json({
//       success: true,
//       data: subCategories,
//       pagination: {
//         totalRecords: total,
//         currentPage: page,
//         limit,
//         totalPages: Math.ceil(total / limit)
//       }
//     });

//   } catch (error) {
//     console.error("List SubCategories Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server Error"
//     });
//   }
// };
// export const listSubCategories = async (req: Request, res: Response) => {
//   try {
//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const searchTag = (req.query.search as string)?.trim() || "";

//     /* SAVE SEARCH HISTORY AUTOMATICALLY */
//     try {
//       if (searchTag !== "") {
//         const userId =
//           (req as any).user?.id || (req as any).admin?.id;   // ✅ FIXED HERE

//         console.log("userId====", userId);

//         if (userId) {
//           await SearchHistory.deleteMany({ userId, keyword: searchTag });
//           await SearchHistory.create({ userId, keyword: searchTag });
//         } else {
//           console.log("No userId/adminId found → skipping history save");
//         }
//       }
//     } catch (err) {
//       console.log("Search history save error:", err);
//     }

//     /* ------------------------------
//        BUILD AGGREGATION PIPELINE
//     ------------------------------- */
//     const pipeline: PipelineStage[] = [
//       { $match: { isDeleted: false } },

//       {
//         $addFields: {
//           content: {
//             $filter: {
//               input: "$content",
//               as: "c",
//               cond: {
//                 $and: [
//                   { $eq: ["$$c.isDeleted", false] },
//                   ...(searchTag
//                     ? [
//                         {
//                           $in: [
//                             searchTag.toLowerCase(),
//                             {
//                               $map: {
//                                 input: "$$c.tags",
//                                 as: "t",
//                                 in: { $toLower: "$$t" }
//                               }
//                             }
//                           ]
//                         }
//                       ]
//                     : [])
//                 ]
//               }
//             }
//           }
//         }
//       },

//       ...(searchTag ? [{ $match: { "content.0": { $exists: true } } }] : []),

//       {
//         $addFields: {
//           content_length: { $size: "$content" },
//           content_time: { $sum: "$content.time" }
//         }
//       },

//       { $sort: { createdAt: -1 } as any },
//       { $skip: skip },
//       { $limit: limit }
//     ];

//     /* TOTAL COUNT PIPELINE */
//     const countPipeline: PipelineStage[] = [
//       { $match: { isDeleted: false } },

//       {
//         $addFields: {
//           content: {
//             $filter: {
//               input: "$content",
//               as: "c",
//               cond: {
//                 $and: [
//                   { $eq: ["$$c.isDeleted", false] },
//                   ...(searchTag
//                     ? [
//                         {
//                           $in: [
//                             searchTag.toLowerCase(),
//                             {
//                               $map: {
//                                 input: "$$c.tags",
//                                 as: "t",
//                                 in: { $toLower: "$$t" }
//                               }
//                             }
//                           ]
//                         }
//                       ]
//                     : [])
//                 ]
//               }
//             }
//           }
//         }
//       },

//       ...(searchTag ? [{ $match: { "content.0": { $exists: true } } }] : []),

//       { $count: "total" }
//     ];

//     const [subCategories, totalCountResult] = await Promise.all([
//       SubCategory.aggregate(pipeline),
//       SubCategory.aggregate(countPipeline)
//     ]);

//     const totalRecords = totalCountResult?.[0]?.total || 0;

//     res.json({
//       success: true,
//       data: subCategories,
//       pagination: {
//         totalRecords,
//         currentPage: page,
//         limit,
//         totalPages: Math.ceil(totalRecords / limit)
//       }
//     });
//   } catch (error) {
//     console.error("List SubCategories Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server Error"
//     });
//   }
// };

export const listSubCategories = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const searchTag = (req.query.search as string)?.trim().toLowerCase() || "";

    /* ====================================================
       SAVE SEARCH HISTORY
    ==================================================== */
    try {
      if (searchTag) {
        const userId =
          (req as any).user?.id || (req as any).admin?.id;

        if (userId) {
          await SearchHistory.deleteMany({ userId, keyword: searchTag });
          await SearchHistory.create({ userId, keyword: searchTag });
        }
      }
    } catch (err) {
      console.log("Search history save error:", err);
    }

    /* ====================================================
       MAIN PIPELINE
    ==================================================== */
    const pipeline: PipelineStage[] = [
      { $match: { isDeleted: false } },

      /* ---- detect subcategory name match ---- */
      {
        $addFields: {
          isNameMatch: searchTag
            ? {
                $regexMatch: {
                  input: "$name",
                  regex: searchTag,
                  options: "i"
                }
              }
            : false
        }
      },

      /* ---- FILTER CONTENT SMARTLY ---- */
      {
        $addFields: {
          content: {
            $filter: {
              input: "$content",
              as: "c",
              cond: {
                $and: [
                  { $eq: ["$$c.isDeleted", false] },

                  /* ⭐ only filter content when name does NOT match */
                  ...(searchTag
                    ? [{
                        $or: [
                          { $eq: ["$isNameMatch", true] }, // keep all content
                          {
                            $or: [
                              {
                                $regexMatch: {
                                  input: "$$c.name",
                                  regex: searchTag,
                                  options: "i"
                                }
                              },
                              {
                                $in: [
                                  searchTag,
                                  {
                                    $map: {
                                      input: "$$c.tags",
                                      as: "t",
                                      in: { $toLower: "$$t" }
                                    }
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      }]
                    : [])
                ]
              }
            }
          }
        }
      },

      /* ---- final search match ---- */
      ...(searchTag
        ? [{
            $match: {
              $or: [
                { isNameMatch: true },
                { "content.0": { $exists: true } }
              ]
            }
          }]
        : []),

      /* ---- stats ---- */
      {
        $addFields: {
          content_length: { $size: "$content" },
          content_time: { $sum: "$content.time" }
        }
      },

      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ];

    /* ====================================================
       COUNT PIPELINE (MUST MATCH MAIN LOGIC)
    ==================================================== */
    const countPipeline: PipelineStage[] = [
      { $match: { isDeleted: false } },

      {
        $addFields: {
          isNameMatch: searchTag
            ? {
                $regexMatch: {
                  input: "$name",
                  regex: searchTag,
                  options: "i"
                }
              }
            : false
        }
      },

      {
        $addFields: {
          content: {
            $filter: {
              input: "$content",
              as: "c",
              cond: {
                $and: [
                  { $eq: ["$$c.isDeleted", false] },

                  ...(searchTag
                    ? [{
                        $or: [
                          { $eq: ["$isNameMatch", true] },
                          {
                            $or: [
                              {
                                $regexMatch: {
                                  input: "$$c.name",
                                  regex: searchTag,
                                  options: "i"
                                }
                              },
                              {
                                $in: [
                                  searchTag,
                                  {
                                    $map: {
                                      input: "$$c.tags",
                                      as: "t",
                                      in: { $toLower: "$$t" }
                                    }
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      }]
                    : [])
                ]
              }
            }
          }
        }
      },

      ...(searchTag
        ? [{
            $match: {
              $or: [
                { isNameMatch: true },
                { "content.0": { $exists: true } }
              ]
            }
          }]
        : []),

      { $count: "total" }
    ];

    /* ====================================================
       RUN
    ==================================================== */
    const [subCategories, totalCountResult] = await Promise.all([
      SubCategory.aggregate(pipeline),
      SubCategory.aggregate(countPipeline)
    ]);

    const totalRecords = totalCountResult?.[0]?.total || 0;

    /* ====================================================
       RESPONSE
    ==================================================== */
    return res.json({
      success: true,
      data: subCategories,
      pagination: {
        totalRecords,
        currentPage: page,
        limit,
        totalPages: Math.ceil(totalRecords / limit)
      }
    });

  } catch (error) {
    console.error("List SubCategories Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};






/* UPDATE SUB-CATEGORY */
export const updateSubCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const activeContents = (data.content || []).filter(
            (c: any) => !c.isDeleted
        );

        const updateData = {
            ...data,
            content_length: activeContents.length,
            content_time: activeContents.reduce(
                (sum: number, c: any) => sum + (c.time || 0),
                0
            )
        };

        const subCategory = await SubCategory.findOneAndUpdate(
            { _id: id, isDeleted: false },
            updateData,
            { new: true }
        );

        if (!subCategory) {
            return res.status(404).json({ success: false, message: "Sub-category not found" });
        }

        res.json({
            success: true,
            message: "Sub-category updated successfully",
            data: subCategory
        });

    } catch (error: any) {
        console.error("Update SubCategory Error:", error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Image must be unique"
            });
        }

        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/* SOFT DELETE SUB-CATEGORY */
export const deleteSubCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const subCategory = await SubCategory.findOneAndUpdate(
            { _id: id },
            { isDeleted: true },
            { new: true }
        );

        if (!subCategory) {
            return res.status(404).json({ success: false, message: 'Sub-category not found' });
        }

        res.json({
            success: true,
            message: 'Sub-category deleted successfully'
        });

    } catch (error) {
        console.error("Delete SubCategory Error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


export const toggleDeleteSubCategoryContent = async (req: Request, res: Response) => {
    try {
        const { subCategoryId, contentId } = req.body;
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
            return res.status(400).json({ success: false, message: "Invalid SubCategory ID" });
        }
        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return res.status(400).json({ success: false, message: "Invalid Content ID" });
        }

        // Find the sub-category
        const subCategory = await SubCategory.findById(subCategoryId);
        if (!subCategory) {
            return res.status(404).json({ success: false, message: 'Sub not found' });
        }

        // Find the content item manually
        const contentItem = subCategory.content.find(c => c._id?.toString() === contentId);
        if (!contentItem) {
            return res.status(404).json({ success: false, message: 'Content item not found' });
        }

        // Toggle isDeleted
        contentItem.isDeleted = !contentItem.isDeleted;

        // Recalculate content stats
        const activeContents = subCategory.content.filter(c => !c.isDeleted);
        subCategory.content_length = activeContents.length;
        subCategory.content_time = activeContents.reduce((sum, c) => sum + (c.time || 0), 0);

        await subCategory.save();

        res.json({
            success: true,
            message: contentItem.isDeleted
                ? 'Content soft deleted successfully'
                : 'Content restored successfully',
            data: subCategory
        });

    } catch (error) {
        console.error("Toggle Delete Content Error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/* GET SUB-CATEGORY BY ID */
export const getSubCategoryById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const pipeline: PipelineStage[] = [
            { $match: { _id: new mongoose.Types.ObjectId(id), isDeleted: false } },
            {
                $addFields: {
                    content: {
                        $filter: {
                            input: "$content",
                            as: "c",
                            cond: { $eq: ["$$c.isDeleted", false] }
                        }
                    }
                }
            },
            {
                $addFields: {
                    content_length: { $size: "$content" },
                    content_time: { $sum: "$content.time" }
                }
            }
        ];

        const result = await SubCategory.aggregate(pipeline);

        if (!result.length) {
            return res.status(404).json({ success: false, message: "Sub-category not found" });
        }

        res.json({
            success: true,
            data: result[0]
        });

    } catch (error) {
        console.error("Get SubCategory Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const toggleFeaturedSubCategoryContent = async (req: Request, res: Response) => {
    try {
        const { subCategoryId, contentId } = req.body;

        // Validate ObjectIds
        if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
            return res.status(400).json({ success: false, message: "Invalid SubCategory ID" });
        }
        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return res.status(400).json({ success: false, message: "Invalid Content ID" });
        }

        // Find the sub-category
        const subCategory = await SubCategory.findById(subCategoryId);
        if (!subCategory) {
            return res.status(404).json({ success: false, message: 'Sub-category not found' });
        }

        // Find the content item
        const contentItem = subCategory.content.find(c => c._id?.toString() === contentId);
        if (!contentItem) {
            return res.status(404).json({ success: false, message: 'Content item not found' });
        }

        // Toggle isFeatured
        contentItem.isFeatured = !contentItem.isFeatured;

        await subCategory.save();

        res.json({
            success: true,
            message: contentItem.isFeatured
                ? 'Content marked as featured'
                : 'Content unmarked as featured',
            data: subCategory
        });

    } catch (error) {
        console.error("Toggle Featured Content Error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


export const getAllFeaturedContent = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = (req as any).admin;
    const role = user?.role;

    // =====================================================
    // 🔐 ROLE-BASED AUDIENCE FILTER
    // =====================================================
    let audienceMatch: PipelineStage[] = [];

    if (['EMPLOYEE', 'TEAMLEAD'].includes(role)) {
      audienceMatch = [
        { $match: { "content.audiance": { $in: ["COMPANY"] } } }
      ];
    }

    if (['TEACHER', 'STUDENT'].includes(role)) {
      audienceMatch = [
        { $match: { "content.audiance": { $in: ["SCHOOL"] } } }
      ];
    }

    const baseMatch = [
      { $match: { isDeleted: false } },
      { $unwind: "$content" },
      {
        $match: {
          "content.isFeatured": true,
          "content.isDeleted": false
        }
      }
    ];

    const pipeline: PipelineStage[] = [
      ...baseMatch,

      // 🔐 Apply audience filter
      ...audienceMatch,

      // 📦 Projection
      {
        $project: {
          _id: 0,
          contentId: "$content._id",
          name: "$content.name",
          image: "$content.image",
          time: "$content.time",
          url: "$content.url",
          isFeatured: "$content.isFeatured",
          subCategoryId: "$_id",
          categoryId: "$categoryId",
          content_type: "$content_type",
          createdAt: "$createdAt",
          audiance: "$content.audiance"
        }
      },

      // 🔃 Sort newest featured first
      { $sort: { createdAt: -1 } },

      // 📄 Pagination
      { $skip: skip },
      { $limit: limit }
    ];

    // 🔢 Count pipeline (must match filters exactly)
    const countPipeline: PipelineStage[] = [
      ...baseMatch,
      ...audienceMatch,
      { $count: "total" }
    ];

    const [featuredContent, countResult] = await Promise.all([
      SubCategory.aggregate(pipeline),
      SubCategory.aggregate(countPipeline)
    ]);

    const total = countResult[0]?.total || 0;

    return res.json({
      success: true,
      data: featuredContent,
      pagination: {
        totalRecords: total,
        currentPage: page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Get Featured Content Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


export const addSubCategoryContent = async (req: Request, res: Response) => {
  try {
    const { subCategoryId } = req.params;
    const { name, url, time, tags,audiance } = req.body;

    if (!name || !url) {
      return res.status(400).json({
        success: false,
        message: "Name and URL are required"
      });
    }
    if(!audiance){
      return res.status(400).json({
        success: false,
        message: "Audiance is required"
      });
    }
    const subCategory = await SubCategory.findOneAndUpdate(
      { _id: subCategoryId, isDeleted: false },
      {
        $push: {
          content: {
            name,
            url,
            time: Number(time) || 0,
            tags: tags || [],
            isFeatured: false,
            isDeleted: false,
            audiance
          }
        }
      },
      { new: true }
    );

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Sub-category not found"
      });
    }

    // Recalculate stats
    const activeContent = subCategory.content.filter(c => !c.isDeleted);
    subCategory.content_length = activeContent.length;
    subCategory.content_time = activeContent.reduce((s, c) => s + (c.time || 0), 0);
    await subCategory.save();

    res.json({
      success: true,
      message: "Content added successfully",
      data: subCategory
    });

  } catch (error) {
    console.error("Add Content Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const listSubCategoryContents = async (req: Request, res: Response) => {
  try {
    const { subCategoryId } = req.params;
    const { page = 1, limit = 10, search = "", showDeleted = false } = req.query;

    const user = (req as any).admin;
    const role = user?.role;
    // console.log(user,"ROLE++++++++++++")
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // =====================================================
    // 🔐 ROLE-BASED AUDIENCE FILTER
    // =====================================================
    let audienceFilter: PipelineStage[] = [];

    if (['EMPLOYEE', 'TEAMLEAD'].includes(role)) {
      audienceFilter = [
        { $match: { "content.audiance": { $in: ["COMPANY"] } } }
      ];
    }

    if (['TEACHER', 'STUDENT'].includes(role)) {
      audienceFilter = [
        { $match: { "content.audiance": { $in: ["SCHOOL"] } } }
      ];
    }

    const pipeline: PipelineStage[] = [
      { $match: { _id: new mongoose.Types.ObjectId(subCategoryId) } },
      { $unwind: "$content" },

      // 🧹 Hide deleted content
      ...(String(showDeleted) === "true"
        ? []
        : [{ $match: { "content.isDeleted": false } }]),

      // 🔍 Search
      ...(search
        ? [{
            $match: {
              "content.name": { $regex: search, $options: "i" }
            }
          }]
        : []),

      // 🔐 Apply audience filter
      ...audienceFilter,

      // 📦 Projection
      {
        $project: {
          _id: "$content._id",
          name: "$content.name",
          url: "$content.url",
          time: "$content.time",
          isFeatured: "$content.isFeatured",
          isDeleted: "$content.isDeleted",
          tags: "$content.tags",
          sortOrder: "$content.sortOrder",
          content_type: "$content_type",
          image: "$content.image",
          author: "$content.author",
          chapter: "$content.chapter",
          audiance: "$content.audiance",
        }
      },

      // 🔃 Sort by order
      { $sort: { sortOrder: 1 } },

      // 📄 Pagination
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limitNum }
          ],
          total: [
            { $count: "count" }
          ]
        }
      }
    ];

    const result = await SubCategory.aggregate(pipeline);

    const data = result[0]?.data || [];
    const total = result[0]?.total[0]?.count || 0;

    return res.json({
      success: true,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      data
    });

  } catch (error) {
    console.error("Content Listing Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


export const updateSubCategoryContent = async (req: Request, res: Response) => {
  try {
    const { subCategoryId, contentId } = req.params;
    const {
      name,
      url,
      time,
      tags,
      isFeatured,
      image,
      author,
      chapter,
      audiance
    } = req.body;

    const subCategory = await SubCategory.findById(subCategoryId);

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "SubCategory not found"
      });
    }

    const content = subCategory.content.id(contentId);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found"
      });
    }

    /* ================= UPDATE CONTENT ================= */
    content.name = name;
    content.url = url;
    content.time = Number(time) || 0;
    content.tags = tags || [];
    content.isFeatured = isFeatured;
    content.image = image;
    content.author = author;
    content.chapter = chapter;
    content.audiance = audiance;

    /* ================= RECALCULATE STATS ================= */
    const activeContent = subCategory.content.filter(c => !c.isDeleted);

    subCategory.content_length = activeContent.length;
    subCategory.content_time = activeContent.reduce(
      (sum, c) => sum + (Number(c.time) || 0),
      0
    );

    await subCategory.save();

    res.json({
      success: true,
      message: "Content updated successfully",
      data: subCategory
    });

  } catch (error) {
    console.error("Update Content Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


export const getSingleSubCategoryContent = async (req: Request, res: Response) => {
  try {
    const { subCategoryId, contentId } = req.params;

    const result = await SubCategory.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(subCategoryId) } },
      { $unwind: "$content" },
      { $match: { "content._id": new mongoose.Types.ObjectId(contentId) } },
      { $project: { _id: 0, content: "$content" } }
    ]);

    if (!result.length) {
      return res.status(404).json({
        success: false,
        message: "Content not found"
      });
    }

    res.json({
      success: true,
      data: result[0].content
    });

  } catch (error) {
    console.error("Get Content Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


export const reorderSubCategoryContent = async (req: Request, res: Response) => {
  try {
    const { subCategoryId } = req.params;
    const { orderedIds, startIndex = 0 } = req.body; // startIndex tells us where in the full list this page starts

    if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
      return res.status(400).json({ success: false, message: "Invalid SubCategory ID" });
    }
    if (!Array.isArray(orderedIds) || !orderedIds.length) {
      return res.status(400).json({ success: false, message: "orderedIds must be a non-empty array" });
    }

    // Find the subcategory
    const subCategory = await SubCategory.findById(subCategoryId);
    
    if (!subCategory) {
      return res.status(404).json({ success: false, message: "SubCategory not found" });
    }

    // Create a map of content IDs to their new sort order (relative to the page)
    const sortOrderMap = new Map<string, number>();
    orderedIds.forEach((id, index) => {
      sortOrderMap.set(id.toString(), startIndex + index);
    });

    // Update the sortOrder for each content item
    subCategory.content.forEach((item) => {
      const newSortOrder = sortOrderMap.get(item._id.toString());
      if (newSortOrder !== undefined) {
        item.sortOrder = newSortOrder;
      }
    });

    // Sort the content array by the new sortOrder
    subCategory.content.sort((a, b) => a.sortOrder - b.sortOrder);

    // Mark the content array as modified (important for nested arrays)
    subCategory.markModified('content');

    // Save the updated subcategory
    await subCategory.save();

    res.json({ 
      success: true, 
      message: "Content reordered successfully",
      data: subCategory.content 
    });

  } catch (error) {
    console.error("Reorder Content Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};