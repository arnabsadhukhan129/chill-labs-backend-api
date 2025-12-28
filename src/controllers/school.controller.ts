import  Company  from '../../models/company';
import { Request, Response } from 'express';
import School from '../../models/School';
import Admin from '../../models/admin';
import ClassModel from "../../models/Class";
import { sendAdminCredentialsEmail } from "../utils/sendAdminCredentialsEmail";
import bcrypt from 'bcryptjs';

/* CREATE SCHOOL */
export const createSchool = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'School name is required'
      });
    }

    // ✅ Get last created school
    const lastSchool = await School.findOne({})
      .sort({ createdAt: -1 })
      .select('code');

    let newCode = 'SCHOOL001';

    if (lastSchool && lastSchool.code) {
      const lastNumber = parseInt(lastSchool.code.replace('SCHOOL', ''));
      const nextNumber = lastNumber + 1;
      newCode = `SCHOOL${nextNumber.toString().padStart(3, '0')}`;
    }

    const school = await School.create({
      name,
      code: newCode
    });

    return res.status(201).json({
      success: true,
      message: 'School created successfully',
      data: school
    });

  } catch (error) {
    console.error('Create School Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};


/* LIST ONLY ACTIVE SCHOOLS WITH PAGINATION */
export const listSchools = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };

    const [schools, total] = await Promise.all([
      School.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      School.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: schools,
      pagination: {
        totalRecords: total,
        currentPage: page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

/* SOFT DELETE SCHOOL */
export const deleteSchool = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // ===============================
    // 1️⃣ Check school exists
    // ===============================
    const school = await School.findById(id);
    if (!school || school.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "School not found"
      });
    }

    // ===============================
    // 2️⃣ Check class assignment
    // ===============================
    const classCount = await ClassModel.countDocuments({
      schoolId: school._id,
      isDeleted: false
    });

    console.log("classCount======", classCount);

    if (classCount > 0) {
      return res.status(400).json({
        success: false,
        message: "School cannot be deleted because classes are already assigned"
      });
    }

    // ===============================
    // 3️⃣ Soft delete school
    // ===============================
    school.isDeleted = true;
    await school.save();

    return res.json({
      success: true,
      message: "School deleted successfully"
    });

  } catch (error) {
    console.error("Delete School Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


/* UPDATE SCHOOL */
export const updateSchool = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;

    const school = await School.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { name, code },
      { new: true }
    );

    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    res.json({
      success: true,
      message: 'School updated successfully',
      data: school
    });
  } catch {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};



/* GET SCHOOL BY ID */
export const getSchoolById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const school = await School.findOne({ _id: id, isDeleted: false });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    res.json({
      success: true,
      data: school
    });
  } catch (error) {
    console.error('Get School By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

/* SCHOOL-WISE HR + ADMIN LIST */
  export const getSchoolAdmins = async (req: Request, res: Response) => {
  try {
    const { schoolCode } = req.params;

    // ✅ Find school by code
    const school = await School.findOne({
      code: schoolCode,
      isDeleted: { $ne: true }
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    // ✅ Fetch HR + School Admin using schoolId
    const admins = await Admin.find({
        schoolId: school._id,
        role: { $in: ['HR_MANAGER', 'SCHOOL_ADMIN'] },
        isDeleted: false
      }).select('-password');

      res.json({
        success: true,
        school: {
          id: school._id,
          name: school.name,
          code: school.code
        },
        data: admins
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Server Error'
      });
    }
  };

/* SCHOOL ADMIN LIST */
// export const getAllSchoolAdmins = async (req: Request, res: Response) => {
//   try {
//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const filter = {
//       role: 'SCHOOL_ADMIN',
//       isDeleted: false
//     };

//     const [admins, total] = await Promise.all([
//       Admin.find(filter)
//         .select('-password')
//         .populate('schoolId', 'name code')  // <-- Add this line
//         .skip(skip)
//         .limit(limit)
//         .sort({ createdAt: -1 }),

//       Admin.countDocuments(filter)
//     ]);


//     res.json({
//       success: true,
//       data: admins,
//       pagination: {
//         page,
//         limit,
//         total,
//         totalPages: Math.ceil(total / limit)
//       }
//     });

//   } catch (error) {
//     console.error("School Admin List Error:", error);
//     res.status(500).json({
//       success: false,
//       message: 'Server Error'
//     });
//   }
// };

export const getAllSchoolAdmins = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string)?.trim();

    /** ================= BASE FILTER ================= */
    let filter: any = {
      role: "SCHOOL_ADMIN",
      isDeleted: { $ne: true } // ✅ HIDE DELETED ADMINS
    };

    /** ================= SEARCH ================= */
    if (search) {
      const regex = new RegExp(search, "i");

      // Find matching schools
      const schoolIds = await School.find({
        name: regex,
        isDeleted: { $ne: true } // ✅ ONLY ACTIVE SCHOOLS
      }).distinct("_id");

      filter.$or = [
        { name: regex },
        { email: regex },
        { schoolId: { $in: schoolIds } }
      ];
    }

    const [admins, total] = await Promise.all([
      Admin.find(filter)
        .select("-password")
        .populate({
          path: "schoolId",
          model: "School",
          match: { isDeleted: { $ne: true } }, // ✅ SAFETY
          select: "name code"
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),

      Admin.countDocuments(filter)
    ]);

    return res.json({
      success: true,
      data: admins,
      pagination: {
        totalRecords: total,
        currentPage: page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("School Admin List Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};



/** ================= SOFT DELETE SCHOOL ADMIN ================= */
export const deleteSchoolAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findOne({
      _id: id,
      role: "SCHOOL_ADMIN",
      isDeleted: { $ne: true }
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "School Admin not found"
      });
    }

    admin.isDeleted = true;
    await admin.save();

    return res.json({
      success: true,
      message: "School Admin deleted successfully"
    });

  } catch (error) {
    console.error("Delete School Admin Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


/* HR Manager LIST */
// export const getAllHRManagers = async (req: Request, res: Response) => {
//   try {
//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const filter = {
//       role: 'HR_MANAGER',
//       isDeleted: false
//     };

//     const [admins, total] = await Promise.all([
//       Admin.find(filter)
//         .select('-password')
//         .populate('companyId', 'name code')   // <-- ADD COMPANY NAME + CODE
//         .skip(skip)
//         .limit(limit)
//         .sort({ createdAt: -1 }),

//       Admin.countDocuments(filter)
//     ]);

//     res.json({
//       success: true,
//       data: admins,
//       pagination: {
//         page,
//         limit,
//         total,
//         totalPages: Math.ceil(total / limit)
//       }
//     });

//   } catch (error) {
//     console.error("HR Manager List Error:", error);
//     res.status(500).json({
//       success: false,
//       message: 'Server Error'
//     });
//   }
// };

export const getAllHRManagers = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string)?.trim();

    /** ================= BASE FILTER ================= */
    let filter: any = {
      role: "HR_MANAGER",
      isDeleted: { $ne: true } // ✅ HIDE DELETED HR MANAGERS
    };

    // =========================================================
    // 🔍 SEARCH (name, email, company name, company code)
    // =========================================================
    if (search) {
      const regex = new RegExp(search, "i");

      // 1️⃣ Find matching ACTIVE companies
      const companyIds = await Company.find({
        isDeleted: { $ne: true },
        $or: [
          { name: regex },
          { code: regex }
        ]
      }).distinct("_id");

      // 2️⃣ Apply OR filter
      filter.$or = [
        { name: regex },
        { email: regex },
        { companyId: { $in: companyIds } }
      ];
    }

    const [admins, total] = await Promise.all([
      Admin.find(filter)
        .select("-password")
        .populate({
          path: "companyId",
          model: "Company",
          match: { isDeleted: { $ne: true } }, // ✅ SAFETY
          select: "name code"
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),

      Admin.countDocuments(filter)
    ]);

    return res.json({
      success: true,
      data: admins,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("HR Manager List Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


/** ================= SOFT DELETE HR MANAGER ================= */
export const deleteHRManager = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const hrManager = await Admin.findOne({
      _id: id,
      role: "HR_MANAGER",
      isDeleted: { $ne: true }
    });

    if (!hrManager) {
      return res.status(404).json({
        success: false,
        message: "HR Manager not found"
      });
    }

    hrManager.isDeleted = true;
    await hrManager.save();

    return res.json({
      success: true,
      message: "HR Manager deleted successfully"
    });

  } catch (error) {
    console.error("Delete HR Manager Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};



/** Create HR and School Admin using schoolCode */
export const createSchoolAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, schoolCode, companyCode } = req.body;

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    let entity: any;
    let adminPayload: any = {
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role,
    };

    if (role === "HR_MANAGER") {
      if (!companyCode) {
        return res.status(400).json({ message: "Company code is required for HR" });
      }

      entity = await Company.findOne({ code: companyCode, isDeleted: false });

      if (!entity) {
        return res.status(404).json({ message: "Company not found with this code" });
      }

      // ensure only 1 HR per company
      const exists = await Admin.findOne({
        role,
        companyId: entity._id,
        isDeleted: false,
      });

      if (exists) {
        return res.status(400).json({ message: "HR already exists for this company" });
      }

      adminPayload.companyId = entity._id;
    }

    else if (role === "SCHOOL_ADMIN") {
      if (!schoolCode) {
        return res.status(400).json({ message: "School code is required" });
      }

      entity = await School.findOne({ code: schoolCode, isDeleted: false });

      if (!entity) {
        return res.status(404).json({ message: "School not found with this code" });
      }

      // ensure only 1 admin per school
      const exists = await Admin.findOne({
        role,
        schoolId: entity._id,
        isDeleted: false,
      });

      if (exists) {
        return res.status(400).json({ message: "School Admin already exists for this school" });
      }

      adminPayload.schoolId = entity._id;
    }

    else {
      return res.status(400).json({ message: "Invalid role" });
    }

    const admin = await Admin.create(adminPayload);

    //Send credentials email
    await sendAdminCredentialsEmail({
      to: email,
      name,
      email,
      password, // original password (before hashing)
      role
    });

    res.status(200).json({
      success: true,
      message: "Admin created successfully and credentials sent via email",
      data: admin,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
/**List Schools with pagination */
export const listSchoolAdmins = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;


    const skip = (page - 1) * limit;


    const data = await Admin.find({
    schoolId,
    isDeleted: false,
    role: { $in: ['HR_MANAGER', 'SCHOOL_ADMIN'] }
    })
    .skip(skip)
    .limit(limit)
    .select('-password');


    const total = await Admin.countDocuments({ schoolId, isDeleted: false });


    res.json({
    success: true,
    data,
    pagination: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
    }
    });
    } catch {
    res.status(500).json({ message: 'Server error' });
  }
};
