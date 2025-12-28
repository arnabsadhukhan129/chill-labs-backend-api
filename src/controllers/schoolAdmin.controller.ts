// src/controllers/schoolAdmin.controller.ts

import { Request, Response } from 'express';
import ClassModel from '../../models/Class';
import User from '../../models/User';
import School from '../../models/School';
import Class from '../../models/Class'
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Teacher from '../../models/Teacher';
import Student from '../../models/Student';
import { any } from 'joi';

/* ================================================================
    CLASS SECTION
==================================================================*/

// CREATE CLASS (admin enters schoolCode, not schoolId)
export const createClass = async (req: Request, res: Response) => {
  try {
    const { name, schoolCode } = req.body;

    if (!name || !schoolCode) {
      return res.status(400).json({
        success: false,
        message: "Class name and schoolCode are required"
      });
    }

    const school = await School.findOne({ code: schoolCode.toUpperCase() });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: "Invalid school code"
      });
    }

    // Auto generate classCode
    const lastClass = await ClassModel.findOne().sort({ createdAt: -1 }).select("classCode");
    let classCode = "CLASS001";

    if (lastClass?.classCode) {
      const next = parseInt(lastClass.classCode.replace("CLASS", "")) + 1;
      classCode = `CLASS${next.toString().padStart(3, "0")}`;
    }

    const newClass = await ClassModel.create({
      name,
      schoolId: school._id,
      classCode,
      teacher: null
    });

    return res.status(201).json({
      success: true,
      message: "Class created successfully",
      data: {
        id: newClass._id,
        className: newClass.name,
        classCode: newClass.classCode,
        school: {
          id: school._id,
          schoolName: school.name,
          schoolCode: school.code
        }
      }
    });

  } catch (error) {
    console.error("Create Class Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating class"
    });
  }
};


// LIST CLASSES (Role-based filtering)
// export const listClasses = async (req: Request, res: Response) => {
//   try {
//     const admin = (req as any).admin; // From verifyToken middleware

//     if (!admin) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized"
//       });
//     }

//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 10;
//     const skip = (page - 1) * limit;
//     const search = (req.query.search as string)?.trim();

//     // Default filter
//     let filter: any = { isDeleted: false };

//     // ============================================
//     // SUPER ADMIN → SEE ALL CLASSES
//     // ============================================
//     if (admin.role === "SUPER_ADMIN") {
//       // No additional filter needed
//     }

//     // ============================================
//     // SCHOOL ADMIN → SEE ONLY CLASSES OF THEIR SCHOOL
//     // ============================================
//     else if (admin.role === "SCHOOL_ADMIN") {
//       if (!admin.schoolId) {
//         return res.status(400).json({
//           success: false,
//           message: "School Admin does not belong to any school"
//         });
//       }

//       filter.schoolId = admin.schoolId;
//     }

   

//     // ============================================
//     // OTHER ROLES NOT ALLOWED
//     // ============================================
//     else {
//       return res.status(403).json({
//         success: false,
//         message: "Not allowed to view classes"
//       });
//     }

//     // ============================================
//     // QUERY DATABASE
//     // ============================================
//     const [classes, total] = await Promise.all([
//       ClassModel.find(filter)
//         .populate("teacher", "name email")
//         .populate("schoolId", "name code")
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit),

//       ClassModel.countDocuments(filter)
//     ]);

//     return res.json({
//       success: true,
//       data: classes,
//       pagination: {
//         totalRecords: total,
//         currentPage: page,
//         limit,
//         totalPages: Math.ceil(total / limit)
//       }
//     });

//   } catch (error) {
//     console.error("List Classes Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error"
//     });
//   }
// };


export const listClasses = async (req: Request, res: Response) => {
  try {
    const admin = (req as any).admin;

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string)?.trim();

    // ============================================
    // BASE FILTER
    // ============================================
    let filter: any = { isDeleted: false };

    // ============================================
    // ROLE BASED FILTER
    // ============================================
    if (admin.role === "SCHOOL_ADMIN") {
      filter.schoolId = admin.schoolId;
    }

    // ============================================
    // SEARCH LOGIC
    // ============================================
    if (search) {
      const regex = new RegExp(search, "i");

      const schoolIds = await School.find({
        name: regex,
        isDeleted: false
      }).distinct("_id");

      filter.$or = [
        { name: regex },
        { classCode: regex },
        { schoolId: { $in: schoolIds } }
      ];
    }

    // ============================================
    // FETCH CLASSES
    // ============================================
    const classes = await ClassModel.find(filter)
      .populate({
        path: "teacher",
        select: "name email role",
        match: { role: "TEACHER", isDeleted: false }
      })
      .populate("schoolId", "name code")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await ClassModel.countDocuments(filter);

    // ============================================
    // FETCH STUDENTS FROM USERS COLLECTION
    // ============================================
    const classIds = classes.map(cls => cls._id);

    const students = await User.find({
      role: "STUDENT",
      referenceType: "Class",
      referenceId: { $in: classIds },
      isDeleted: false
    })
      .select("name email referenceId")
      .lean();

    // ============================================
    // GROUP STUDENTS BY CLASS
    // ============================================
    const studentsByClass: Record<string, any[]> = {};

    students.forEach((student:any) => {
      const key = student.referenceId.toString();
      if (!studentsByClass[key]) {
        studentsByClass[key] = [];
      }
      studentsByClass[key].push(student);
    });

    // ============================================
    // ATTACH STUDENTS TO CLASSES
    // ============================================
    const finalClasses = classes.map(cls => ({
      ...cls,
      students: studentsByClass[cls._id.toString()] || []
    }));

    return res.json({
      success: true,
      data: finalClasses,
      pagination: {
        totalRecords: total,
        currentPage: page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("List Classes Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// DELETE CLASS (soft delete)
export const deleteClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // ===============================
    // 1️⃣ Check class exists
    // ===============================
    const classData = await ClassModel.findById(id);
    if (!classData || classData.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Class not found"
      });
    }

    // ===============================
    // 2️⃣ Check user assignment
    // ===============================
    const userCount = await User.countDocuments({
      referenceType: "Class",
      referenceId: classData._id
    });

    console.log("userCount======", userCount);

    if (userCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Class cannot be deleted because users are already assigned"
      });
    }

    // ===============================
    // 3️⃣ Soft delete class
    // ===============================
    classData.isDeleted = true;
    await classData.save();

    return res.json({
      success: true,
      message: "Class deleted successfully"
    });

  } catch (error) {
    console.error("Delete Class Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


/* ================================================================
    TEACHER SECTION  (Now in User table)
==================================================================*/

// CREATE TEACHER
export const createTeacher = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, classCode } = req.body;

    if (!name || !email || !password || !classCode) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password & classCode required"
      });
    }

    // Find class
    const cls = await ClassModel.findOne({ classCode, isDeleted: false });
    if (!cls) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }

    // Check if class already has a teacher
    if (cls.teacher) {
      return res.status(400).json({
        success: false,
        message: "This class already has a teacher"
      });
    }

    // Create teacher inside User table
    const hashedPass = await bcrypt.hash(password, 10);

    const teacher = await User.create({
      name,
      email,
      password: hashedPass,
      role: "TEACHER",
      referenceType: "Class",
      referenceId: cls._id
    });

    // Assign teacher to class
    cls.teacher = teacher._id;
    await cls.save();

    return res.status(201).json({
      success: true,
      message: "Teacher created successfully",
      data: teacher
    });

  } catch (error) {
    console.error("Create Teacher Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// LIST TEACHERS
// LIST TEACHERS (Role-based)
// export const listTeachers = async (req: Request, res: Response) => {
//   try {
//     const admin = (req as any).admin; // from verifyToken middleware

//     if (!admin) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized"
//       });
//     }

//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     let filter: any = { role: "TEACHER" };

//     // ================================================
//     // SUPER ADMIN → SEE ALL TEACHERS
//     // ================================================
//     if (admin.role === "SUPER_ADMIN") {
//       // no extra filter
//     }

//     // ================================================
//     // SCHOOL ADMIN → ONLY TEACHERS OF THAT SCHOOL
//     // ================================================
//     else if (admin.role === "SCHOOL_ADMIN") {
//       if (!admin.schoolId) {
//         return res.status(400).json({
//           success: false,
//           message: "School Admin does not belong to any school"
//         });
//       }

//       // Fetch all classes of this school
//       const classes = await Class.find({ schoolId: admin.schoolId }).select("_id");

//       const classIds = classes.map((cls) => cls._id);

//       filter.referenceId = { $in: classIds };
//     } 
//     else {
//       return res.status(403).json({
//         success: false,
//         message: "You are not allowed to view teacher list"
//       });
//     }

//     // ================================================
//     // FETCH TEACHERS
//     // ================================================
//     const [teachers, total] = await Promise.all([
//       User.find(filter)
//         .populate({
//           path: "referenceId",
//           model: "Class",
//           select: "name classCode schoolId",
//           populate: {
//             path: "schoolId",
//             model: "School",
//             select: "name"
//           }
//         })
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit),

//       User.countDocuments(filter),
//     ]);

//     // ================================================
//     // FINAL RESPONSE
//     // ================================================
//     return res.json({
//       success: true,
//       data: teachers,
//       pagination: {
//         totalRecords: total,
//         currentPage: page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     });

//   } catch (error) {
//     console.error("List Teachers Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

export const listTeachers = async (req: Request, res: Response) => {
  try {
    const admin = (req as any).admin;

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = (req.query.search as string) || "";

    let filter: any = { role: "TEACHER", isDeleted: { $ne: true } };

    // =====================================================
    // 🔍 SEARCH FILTER (name/email/class/school)
    // =====================================================
    if (search.trim() !== "") {
      const keyword = search.trim();

      filter.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } }
      ];
    }

    // =====================================================
    // SUPER ADMIN → SEE ALL TEACHERS
    // =====================================================
    if (admin.role === "SUPER_ADMIN") {
      // no additional filters
    }

    // =====================================================
    // SCHOOL ADMIN → ONLY SEE TEACHERS OF THEIR SCHOOL
    // =====================================================
    else if (admin.role === "SCHOOL_ADMIN") {
      if (!admin.schoolId) {
        return res.status(400).json({
          success: false,
          message: "School Admin does not belong to any school"
        });
      }

      const classes = await Class.find({ schoolId: admin.schoolId }).select("_id");
      const classIds = classes.map((cls) => cls._id);

      filter.referenceId = { $in: classIds };
    } 
    else {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view teacher list"
      });
    }

    // =====================================================
    // FETCH TEACHERS WITH POPULATED CLASS + SCHOOL
    // =====================================================
    const [teachers, total] = await Promise.all([
      User.find(filter)
        .populate({
          path: "referenceId",
          model: "Class",
          select: "name classCode schoolId",
          populate: {
            path: "schoolId",
            model: "School",
            select: "name"
          }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),
    ]);

    // =====================================================
    // RESPONSE
    // =====================================================
    return res.json({
      success: true,
      data: teachers,
      pagination: {
        totalRecords: total,
        currentPage: page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("List Teachers Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};




// DELETE TEACHER
export const deleteTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await User.findByIdAndUpdate(id, { isDeleted: true , isVerified: false});

    res.json({
      success: true,
      message: "Teacher removed successfully"
    });

  } catch (error) {
    console.error("Delete Teacher Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




/* ================================================================
    STUDENT SECTION  (Now in User table)
==================================================================*/

// CREATE STUDENT
export const createStudent = async (req: Request, res: Response) => {
  try {
    const { name, email, password, classCode } = req.body;

    if (!name || !email || !password || !classCode) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password & classCode required"
      });
    }

    const cls = await ClassModel.findOne({ classCode });
    if (!cls) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    const student = await User.create({
      name,
      email,
      password: hashedPass,
      role: "STUDENT",
      referenceType: "Class",
      referenceId: cls._id
    });

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: student
    });

  } catch (error) {
    console.error("Create Student Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// LIST STUDENTS
// export const listStudents = async (req: Request, res: Response) => {
//   try {
//     const { classCode } = req.query;
//     let filter: any = { role: "STUDENT" };

//     if (classCode) {
//       const cls = await ClassModel.findOne({
//         classCode: classCode.toString().toUpperCase(),
//       });

//       if (cls) filter.referenceId = cls._id;
//     }

//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 10;
//     const skip = (page - 1) * limit;

//     const [students, total] = await Promise.all([
//       User.find(filter)
//         .populate({
//           path: "referenceId",
//           model: "Class",    // <-- ALWAYS correct model
//           select: "name classCode",
//         })
//         .skip(skip)
//         .limit(limit)
//         .sort({ createdAt: -1 }),

//       User.countDocuments(filter),
//     ]);

//     return res.json({
//       success: true,
//       data: students,
//       pagination: {
//         totalRecords: total,
//         currentPage: page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     });
//   } catch (err) {
//     console.error("List Students Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };
/** ================= LIST STUDENTS WITH ROLE LOGIC ================= */
// export const listStudents = async (req: Request, res: Response) => {
//   try {
//     const admin = (req as any).admin;

//     if (!admin) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized"
//       });
//     }

//     const { classCode } = req.query;
//     let filter: any = {
//       role: "STUDENT"
//     };

//     /** ============================================================
//      * 🔥 CLASS FILTER (Optional)
//      * ============================================================ */
//     if (classCode) {
//       const cls = await ClassModel.findOne({
//         classCode: classCode.toString().toUpperCase()
//       });

//       if (cls) filter.referenceId = cls._id;
//       else filter.referenceId = null; // no match
//     }

//     /** ============================================================
//      * 🔥 SCHOOL ADMIN RESTRICTION
//      * School Admin must ONLY see students of their school
//      * Students → referenceId (classId)
//      * Class → schoolId
//      * ============================================================ */
//     if (admin.role === "SCHOOL_ADMIN") {
//       if (!admin.schoolId) {
//         return res.status(400).json({
//           success: false,
//           message: "School Admin does not belong to any school"
//         });
//       }

//       // 👉 find classes belonging to this school
//       const classes = await ClassModel.find({ schoolId: admin.schoolId });
//       const classIds = classes.map((c) => c._id);

//       if (classIds.length === 0) {
//         return res.json({
//           success: true,
//           data: [],
//           pagination: {
//             totalRecords: 0,
//             currentPage: 1,
//             limit: 10,
//             totalPages: 0
//           }
//         });
//       }

//       // restrict results to only these class IDs
//       filter.referenceId = { $in: classIds };
//     }

//     /** ============================================================
//      * 🔥 SUPER_ADMIN sees ALL students (no extra filter)
//      * ============================================================ */

//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 10;
//     const skip = (page - 1) * limit;

//     /** ============================================================
//      * 🔥 FETCH STUDENTS + POPULATE CLASS INFO
//      * ============================================================ */
//     const [students, total] = await Promise.all([
//       User.find(filter)
//         .populate({
//           path: "referenceId",
//           model: "Class",
//           select: "name classCode schoolId",
//           populate: {
//             path: "schoolId",
//             model: "School",
//             select: "name"
//           }
//         })
//         .skip(skip)
//         .limit(limit)
//         .sort({ createdAt: -1 }),

//       User.countDocuments(filter)
//     ]);

//     return res.json({
//       success: true,
//       data: students,
//       pagination: {
//         totalRecords: total,
//         currentPage: page,
//         limit,
//         totalPages: Math.ceil(total / limit)
//       }
//     });
//   } catch (err) {
//     console.error("List Students Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error"
//     });
//   }
// };





// DELETE STUDENT


export const listStudents = async (req: Request, res: Response) => {
  try {
    const admin = (req as any).admin;

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { classCode, search } = req.query;

    let filter: any = {
      role: "STUDENT",
      isDeleted: { $ne: true }
    };

    /** ============================================================
     * 🔍 SEARCH FILTER (name/email/class/school)
     * ============================================================ */
    if (search && search.toString().trim() !== "") {
      const keyword = search.toString().trim();

      filter.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } }
      ];
    }

    /** ============================================================
     * 🔥 CLASS FILTER (Optional)
     * ============================================================ */
    if (classCode) {
      const cls = await ClassModel.findOne({
        classCode: classCode.toString().toUpperCase()
      });

      if (cls) filter.referenceId = cls._id;
      else filter.referenceId = null;
    }

    /** ============================================================
     * 🔥 SCHOOL ADMIN RESTRICTION
     * ============================================================ */
    if (admin.role === "SCHOOL_ADMIN") {
      if (!admin.schoolId) {
        return res.status(400).json({
          success: false,
          message: "School Admin does not belong to any school"
        });
      }

      const classes = await ClassModel.find({ schoolId: admin.schoolId });
      const classIds = classes.map((c) => c._id);

      if (classIds.length === 0) {
        return res.json({
          success: true,
          data: [],
          pagination: {
            totalRecords: 0,
            currentPage: 1,
            limit: 10,
            totalPages: 0
          }
        });
      }

      filter.referenceId = { $in: classIds };
    }

    /** ============================================================
     * 🔥 PAGINATION
     * ============================================================ */
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    /** ============================================================
     * 🔥 FETCH STUDENTS + POPULATE CLASS INFO
     * ============================================================ */
    const [students, total] = await Promise.all([
      User.find(filter)
        .populate({
          path: "referenceId",
          model: "Class",
          select: "name classCode schoolId",
          populate: {
            path: "schoolId",
            model: "School",
            select: "name"
          }
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),

      User.countDocuments(filter)
    ]);

    return res.json({
      success: true,
      data: students,
      pagination: {
        totalRecords: total,
        currentPage: page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.error("List Students Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};





export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await User.findByIdAndUpdate(id, {
      isDeleted: true,
      isVerified: false
    });

    res.json({
      success: true,
      message: "Student removed successfully"
    });

  } catch (error) {
    console.error("Delete Student Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================================================================
    GUEST SECTION  (Now in User table)
==================================================================*/

// LIST GUEST USERS
export const listGuests = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const search = (req.query.search as string) || "";

    const filter: any = { 
      role: "GUEST",
      isDeleted: false 
    };  // ✔ FIXED TYPE ISSUE

    // 🔍 SEARCH by name OR email
    if (search.trim() !== "") {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const [guests, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(filter)
    ]);

    return res.json({
      success: true,
      data: guests,
      pagination: {
        totalRecords: total,
        currentPage: page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    });

  } catch (error) {
    console.error("Guest List Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

//GUEST removed
export const removeGuest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const guest = await User.findOne({
      _id: id,
      role: "GUEST"
    });

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Guest user not found"
      });
    }

    guest.isDeleted = true;
    guest.isVerified = false;
    await guest.save();

    return res.json({
      success: true,
      message: "Guest removed successfully"
    });

  } catch (error) {
    console.error("Remove Guest Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

