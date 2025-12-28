import { Request, Response } from 'express';
import Category from '../../models/category';
import mongoose from 'mongoose';

/* CREATE CATEGORY */
export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name, image } = req.body;

        if (!name || !image) {
            return res.status(400).json({
                success: false,
                message: 'Category name and image are required'
            });
        }

        const category = await Category.create({
            name,
            image
        });

        return res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category
        });

    } catch (error) {
        console.error('Create Category Error:', error);
        if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
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

/* LIST ONLY ACTIVE CATEGORIES WITH PAGINATION */
// export const listCategories = async (req: Request, res: Response) => {
//     try {
//         const page = Number(req.query.page) || 1;
//         const limit = Number(req.query.limit) || 10;
//         const skip = (page - 1) * limit;
//         const search = req.query.search as string;

//         const filter: any = { isDeleted: false };

//         const searchFilter = search ? {
//             $or: [
//                 { name: { $regex: search, $options: "i" } },  // Category name
//                 { "subCategories.name": { $regex: search, $options: "i" } }, // Subcategory name
//                 {
//                     "subCategories.content.name": {
//                         $regex: search,
//                         $options: "i"
//                     }
//                 }, // Content name
//                 {
//                     "subCategories.content.tags": {
//                         $elemMatch: { $regex: search, $options: "i" }
//                     }
//                 } // Tags
//             ]
//         } : {};

//         const pipeline: any[] = [
//             { $match: filter },

//             {
//                 $lookup: {
//                     from: "sub-categories",
//                     localField: "_id",
//                     foreignField: "categoryId",
//                     as: "subCategories"
//                 }
//             },

//             // Add search filter if search exists
//             ...(search ? [{ $match: searchFilter }] : []),

//             // Stats
//             {
//                 $addFields: {
//                     subCategoriesCount: { $size: "$subCategories" },
//                     totalContentCount: {
//                         $sum: {
//                             $map: {
//                                 input: "$subCategories",
//                                 as: "sub",
//                                 in: { $size: "$$sub.content" }
//                             }
//                         }
//                     }
//                 }
//             },

//             { $sort: { createdAt: -1 } },
//             { $skip: skip },
//             { $limit: limit }
//         ];

//         const [categories, total] = await Promise.all([
//             Category.aggregate(pipeline),
//             Category.countDocuments(filter)
//         ]);

//         res.status(200).json({
//             success: true,
//             data: categories,
//             pagination: {
//                 totalRecords: total,
//                 currentPage: page,
//                 limit,
//                 totalPages: Math.ceil(total / limit)
//             }
//         });

//     } catch (error) {
//         console.error("Error:", error);
//         res.status(500).json({
//             success: false,
//             message: "Server Error"
//         });
//     }
// };

export const listCategories = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search as string;
    const contentOnly = req.query.contentOnly === 'true';

    // ⭐ NEW
    const contentType = req.query.content_type as 'video' | 'audio' | 'book';

    const categoryFilter: any = { isDeleted: false };

    /* ================= CONTENT SEARCH ================= */
    const contentSearch = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { 'subCategories.content.name': { $regex: search, $options: 'i' } },
            {
              'subCategories.content.tags': {
                $elemMatch: { $regex: search, $options: 'i' },
              },
            },
            { 'subCategories.content.author': { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    /* ================= BASE PIPELINE ================= */
    const basePipeline: any[] = [
      { $match: categoryFilter },

      {
        $lookup: {
          from: 'sub-categories',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'subCategories',
        },
      },

      { $unwind: '$subCategories' },

      // ⭐ FILTER BY CONTENT TYPE (video/audio/book)
      ...(contentType
        ? [{ $match: { 'subCategories.content_type': contentType } }]
        : []),

      { $unwind: '$subCategories.content' },

      { $match: { 'subCategories.content.isDeleted': false } },

      ...(search ? [{ $match: contentSearch }] : []),
    ];

    /* ================= CONDITIONAL GROUP ================= */
    const groupStage = contentOnly
      ? {
          $group: {
            _id: '$subCategories.content._id',
            name: { $first: '$subCategories.content.name' },
            url: { $first: '$subCategories.content.url' },
            time: { $first: '$subCategories.content.time' },
            tags: { $first: '$subCategories.content.tags' },
            isFeatured: { $first: '$subCategories.content.isFeatured' },
            image: { $first: '$subCategories.content.image' },
            author: { $first: '$subCategories.content.author' },
            chapter: { $first: '$subCategories.content.chapter' },

            categoryId: { $first: '$_id' },
            categoryName: { $first: '$name' },
            subCategoryId: { $first: '$subCategories._id' },
            subCategoryName: { $first: '$subCategories.name' },

            contentType: { $first: '$subCategories.content_type' },
            createdAt: { $first: '$subCategories.content.createdAt' },
          },
        }
      : {
          $group: {
            _id: '$_id',
            name: { $first: '$name' },
            image: { $first: '$image' },
            createdAt: { $first: '$createdAt' },
            // content: {
            //   $push: {
            //     _id: '$subCategories.content._id',
            //     name: '$subCategories.content.name',
            //     url: '$subCategories.content.url',
            //     time: '$subCategories.content.time',
            //     tags: '$subCategories.content.tags',
            //     isFeatured: '$subCategories.content.isFeatured',
            //     image: '$subCategories.content.image',
            //     author: '$subCategories.content.author',
            //     chapter: '$subCategories.content.chapter',
            //     contentType: '$subCategories.content_type',
            //     subCategoryId: '$subCategories._id',
            //     subCategoryName: '$subCategories.name',
            //   },
            // },
          },
        };

    /* ================= FINAL PIPELINE ================= */
    const pipeline = [
      ...basePipeline,
      groupStage,
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const data = await Category.aggregate(pipeline);

    /* ================= COUNT ================= */
    const countPipeline = [...basePipeline, groupStage, { $count: 'total' }];
    const countResult = await Category.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    /* ================= RESPONSE ================= */
    return res.status(200).json({
      success: true,
      data,
      pagination: {
        totalRecords: total,
        currentPage: page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};






/* UPDATE CATEGORY */
export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body; 

        const category = await Category.findOneAndUpdate(
            { _id: id, isDeleted: false },
            updateData,
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        return res.json({
            success: true,
            message: "Category updated successfully",
            data: category
        });

    } catch (error: any) {
        console.error("Update Category Error:", error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Image must be unique"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};


/* SOFT DELETE CATEGORY */
export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const category = await Category.findOneAndUpdate(
            { _id: id },
            { isDeleted: true },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/* GET CATEGORY BY ID */
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contentOnly = req.query.contentOnly === 'true';
    const contentType = req.query.content_type as 'video' | 'audio' | 'book';

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID',
      });
    }

    /* ================= BASE MATCH ================= */
    const basePipeline: any[] = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: 'sub-categories',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'subCategories',
        },
      },
      { $unwind: '$subCategories' },

      // ✅ filter by content_type if provided
      ...(contentType
        ? [{ $match: { 'subCategories.content_type': contentType } }]
        : []),

      { $unwind: '$subCategories.content' },
      { $match: { 'subCategories.content.isDeleted': false } },
    ];

    /* ================= CONTENT ONLY ================= */
    if (contentOnly) {
      const pipeline = [
        ...basePipeline,
        {
          $group: {
            _id: '$subCategories.content._id',
            name: { $first: '$subCategories.content.name' },
            url: { $first: '$subCategories.content.url' },
            time: { $first: '$subCategories.content.time' },
            tags: { $first: '$subCategories.content.tags' },
            isFeatured: { $first: '$subCategories.content.isFeatured' },
            image: { $first: '$subCategories.content.image' },
            author: { $first: '$subCategories.content.author' },
            chapter: { $first: '$subCategories.content.chapter' },

            contentType: { $first: '$subCategories.content_type' },
            subCategoryId: { $first: '$subCategories._id' },
            subCategoryName: { $first: '$subCategories.name' },

            createdAt: { $first: '$subCategories.content.createdAt' },
          },
        },
        { $sort: { createdAt: -1 } },
      ];

      const content = await Category.aggregate(pipeline);

      return res.status(200).json({
        success: true,
        data: content,
      });
    }

    /* ================= DEFAULT (CATEGORY + SUBCATEGORIES) ================= */
    const pipeline = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: 'sub-categories',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'subCategories',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          image: 1,
          subCategories: 1,
        },
      },
    ];

    const result = await Category.aggregate(pipeline);

    if (!result.length) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error('Get Category By Id Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};
