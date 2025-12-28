import { Request, Response } from 'express';
import Company from '../../models/company';
import Admin from '../../models/admin';
import Team from "../../models/Team";
import bcrypt from 'bcryptjs';

/* CREATE COMPANY */
export const createCompany = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Company name is required" });
    }

    const lastCompany = await Company.findOne({})
      .sort({ createdAt: -1 })
      .select("code");

    let newCode = "COMP001";

    if (lastCompany && lastCompany.code) {
      const lastNumber = parseInt(lastCompany.code.replace("COMP", ""));
      newCode = `COMP${(lastNumber + 1).toString().padStart(3, "0")}`;
    }

    const company = await Company.create({ name, code: newCode });

    res.status(201).json({
      success: true,
      message: "Company created successfully",
      data: company,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* LIST ACTIVE COMPANIES */
// export const listCompanies = async (req: Request, res: Response) => {
//   try {
//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const filter = { isDeleted: false };

//     const [companies, total] = await Promise.all([
//       Company.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
//       Company.countDocuments(filter),
//     ]);

//     res.json({
//       success: true,
//       data: companies,
//       pagination: {
//         totalRecords: total,
//         currentPage: page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     });

//   } catch {
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

export const listCompanies = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = (req.query.search as string) || "";

    let filter: any = { isDeleted: false };

    // =====================================================
    // 🔍 SEARCH (name, code, email)
    // =====================================================
    if (search.trim() !== "") {
      const keyword = search.trim();

      filter.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { code: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } }
      ];
    }

    const [companies, total] = await Promise.all([
      Company.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Company.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: companies,
      pagination: {
        totalRecords: total,
        currentPage: page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch {
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

export const deleteCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id);
    if (!company || company.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Company not found"
      });
    }

    const teamCount = await Team.countDocuments({
      $expr: {
        $eq: [{ $toString: "$companyId" }, id]
      }
    });

    console.log("teamCount======", teamCount);

    if (teamCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Company cannot be deleted because teams are already assigned"
      });
    }

    company.isDeleted = true;
    await company.save();

    return res.json({
      success: true,
      message: "Company deleted successfully"
    });

  } catch (error) {
    console.error("Delete Company Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


/* UPDATE COMPANY */
export const updateCompany = async (req: Request, res: Response) => {
  try {
    const company = await Company.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      req.body,
      { new: true }
    );

    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    res.json({ success: true, message: "Company updated", data: company });
  } catch {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};



/* GET COMPANY BY ID */
export const getCompanyById = async (req: Request, res: Response) => {
  try {
    const company = await Company.findOne({ _id: req.params.id, isDeleted: false });

    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    res.json({ success: true, data: company });

  } catch {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* LIST COMPANY ADMINS */
export const getCompanyAdmins = async (req: Request, res: Response) => {
  try {
    const company = await Company.findOne({
      code: req.params.companyCode,
      isDeleted: false,
    });

    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    const admins = await Admin.find({
      companyId: company._id,
      role: { $in: ["HR_MANAGER", "COMPANY_ADMIN"] },
      isDeleted: false,
    }).select("-password");

    res.json({
      success: true,
      company: {
        id: company._id,
        name: company.name,
        code: company.code,
      },
      data: admins,
    });

  } catch {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* CREATE HR or COMPANY ADMIN */
export const createCompanyAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, companyCode } = req.body;

    const company = await Company.findOne({ code: companyCode, isDeleted: false });

    if (!company) {
      return res.status(404).json({ success: false, message: "Invalid company code" });
    }

    const exists = await Admin.findOne({
      role,
      companyId: company._id,
      isDeleted: false,
    });

    if (exists) {
      return res.status(400).json({
        message: `${role.replace("_", " ")} already exists for this company`,
      });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPass,
      role,
      companyId: company._id,
    });

    res.json({
      success: true,
      message: "Admin created successfully",
      data: admin,
    });

  } catch {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
