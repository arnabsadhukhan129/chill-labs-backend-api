import { Request, Response } from 'express';
import Employee from '../../models/Employee';
import Team from '../../models/Team';
import School from '../../models/School';
import Company from '../../models/company';
import User from "../../models/User";
// import { IUser } from "../../models/User"; 
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        companyId?: string;
        [key: string]: any;
      };
    }
  }
}


/** ================= CREATE EMPLOYEE ================= */

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, position, password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    // Check if employee already exists
    const existing = await Employee.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Employee already exists'
      });
    }

    // ✅ HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await Employee.create({
      name,
      email,
      phone,
      position: position || 'employee',
      password: hashedPassword
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        position: employee.position
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};




/** ================= CREATE TEAM ================= */
export const createTeam = async (req: Request, res: Response) => {
  try {
    const { name, companyCode } = req.body;

    if (!name || !companyCode) {
      return res.status(400).json({
        success: false,
        message: "Team name and companyCode are required"
      });
    }

    const company = await Company.findOne({
      code: companyCode.toUpperCase(),
      isDeleted: { $ne: true }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Invalid companyCode"
      });
    }

    const lastTeam = await Team.findOne().sort({ createdAt: -1 }).select("teamCode");
    let teamCode = "TEAM001";

    if (lastTeam?.teamCode) {
      const next = parseInt(lastTeam.teamCode.replace("TEAM", "")) + 1;
      teamCode = `TEAM${next.toString().padStart(3, "0")}`;
    }

    const team = await Team.create({
      name,
      teamCode,
      companyId: company._id,
      teamLead: null
    });

    return res.status(201).json({
      success: true,
      message: "Team created successfully",
      data: {
        id: team._id,
        teamName: team.name,
        teamCode: team.teamCode,
        company: {
          id: company._id,
          companyName: company.name,
          companyCode: company.code
        }
      }
    });

  } catch (error) {
    console.error("Create Team Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


/** ================= ADD EMPLOYEES TO TEAM ================= */
export const addEmployeeToTeam = async (req: Request, res: Response) => {
  try {
    const { teamCode, employeeIds } = req.body;

    const team = await Team.findOne({ teamCode, isDeleted: false });
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // ✅ Only assign employees to team
    await Employee.updateMany(
      { _id: { $in: employeeIds } },
      { teamId: team._id }
    );

    res.json({
      success: true,
      message: 'Employees assigned to team successfully',
      teamCode: team.teamCode,
      teamLead: team.teamLead // existing lead remains unchanged
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



/** ================= LIST TEAMS WITH ROLE-BASED FILTERING ================= */
// export const listTeams = async (req: Request, res: Response) => {
//   try {
//     const admin = (req as any).admin;

//     if (!admin) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized - Admin info missing"
//       });
//     }

//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 10;
//     const skip = (page - 1) * limit;

//     let filter: any = {};

//     if (admin.role === "SUPER_ADMIN") {
//       filter = {};
//     } else if (admin.role === "HR_MANAGER") {
//       if (!admin.companyId) {
//         return res.status(400).json({
//           success: false,
//           message: "HR Manager does not belong to a company"
//         });
//       }
//       filter = { companyId: admin.companyId };
//     } else {
//       return res.status(403).json({
//         success: false,
//         message: "You are not allowed to view the team list"
//       });
//     }

//     const [teams, total] = await Promise.all([
//       Team.find(filter)
//         .populate("teamLead", "name email")
//         .populate("companyId", "name") // <-- ADD COMPANY NAME
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit),

//       Team.countDocuments(filter)
//     ]);

//     res.json({
//       success: true,
//       data: teams,
//       pagination: {
//         totalRecords: total,
//         currentPage: page,
//         limit,
//         totalPages: Math.ceil(total / limit)
//       }
//     });

//   } catch (error) {
//     console.error("List Teams Error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

export const listTeams = async (req: Request, res: Response) => {
  try {
    const admin = (req as any).admin;

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Admin info missing"
      });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string)?.trim() || "";

    // ==========================================================
    // BASE FILTER
    // ==========================================================
    let filter: any = { isDeleted: { $ne: true } };

    // ==========================================================
    // ROLE RESTRICTIONS
    // ==========================================================
    if (admin.role === "HR_MANAGER") {
      if (!admin.companyId) {
        return res.status(400).json({
          success: false,
          message: "HR Manager does not belong to a company"
        });
      }
      filter.companyId = admin.companyId;
    } else if (admin.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view the team list"
      });
    }

    // ==========================================================
    // SEARCH (team name only – DB level)
    // ==========================================================
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // ==========================================================
    // FETCH TEAMS
    // ==========================================================
    const teams = await Team.find(filter)
      .populate({
        path: "teamLead",
        select: "name email",
        match: { role: "TEAMLEAD", isDeleted: false }
      })
      .populate("companyId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Team.countDocuments(filter);

    // ==========================================================
    // FETCH EMPLOYEES FROM USERS COLLECTION
    // ==========================================================
    const teamIds = teams.map(team => team._id);

    const employees = await User.find({
      role: "EMPLOYEE",
      referenceType: "Team",
      referenceId: { $in: teamIds },
      isDeleted: false
    })
      .select("name email referenceId")
      .lean();

    // ==========================================================
    // GROUP EMPLOYEES BY TEAM
    // ==========================================================
    const employeesByTeam: Record<string, any[]> = {};

    employees.forEach((emp:any) => {
    if (!emp.referenceId) return; // ✅ TS + runtime safety

    const key = emp.referenceId.toString();

    if (!employeesByTeam[key]) {
      employeesByTeam[key] = [];
    }

  employeesByTeam[key].push(emp);
    });


    // ==========================================================
    // ATTACH EMPLOYEES TO TEAMS
    // ==========================================================
    const finalTeams = teams.map(team => ({
      ...team,
      employees: employeesByTeam[team._id.toString()] || []
    }));

    // ==========================================================
    // RESPONSE
    // ==========================================================
    return res.json({
      success: true,
      data: finalTeams,
      pagination: {
        totalRecords: total,
        currentPage: page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("List Teams Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


/** ================= SOFT DELETE TEAM ================= */
export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const team = await Team.findOne({ _id: id, isDeleted: false });
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    // 🔍 Check if users are assigned to this team
    const userCount = await User.countDocuments({
      referenceType: "Team",
      referenceId: team._id,
      isDeleted: false
    });

    if (userCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Team cannot be deleted because users are already assigned"
      });
    }

    // ✅ SOFT DELETE
    team.isDeleted = true;
    await team.save();

    return res.json({
      success: true,
      message: "Team deleted successfully"
    });

  } catch (error) {
    console.error("Delete Team Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


/** ================= Employee List ================= */
// export const listEmployees = async (req: Request, res: Response) => {
//   try {
//     const admin = (req as any).admin; // comes from verifyToken

//     if (!admin) {
//       return res.status(401).json({ success: false, message: "Unauthorized" });
//     }

//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     /** ================= BASE FILTER ================= */
//     let filter: any = {
//       role: "EMPLOYEE",
//       referenceType: { $in: ["Team", "TEAM", "team"] }
//     };

//     /** ================= HR MANAGER FILTER ================= */
//     if (admin.role === "HR_MANAGER") {

//       if (!admin.companyId) {
//         return res.status(400).json({
//           success: false,
//           message: "HR Manager does not belong to a company"
//         });
//       }

//       // 🔥 Get teams belonging to this HR's company
//       const teams = await Team.find({ companyId: admin.companyId });

//       const teamIds = teams.map((t) => t._id);

//       if (teamIds.length === 0) {
//         return res.json({
//           success: true,
//           data: [],
//           pagination: {
//             totalRecords: 0,
//             currentPage: page,
//             limit,
//             totalPages: 0
//           }
//         });
//       }

//       filter.referenceId = { $in: teamIds };
//     }

//     /** ================= SUPER_ADMIN sees all EMPLOYEES ================= */
//     // no extra filter required

//     /** ================= GET EMPLOYEES ================= */
//     const [employees, total] = await Promise.all([
//       User.find(filter)
//         .populate({
//           path: "referenceId",
//           model: "Team",
//           select: "name companyId",
//           populate: {
//             path: "companyId",
//             model: "Company",
//             select: "name"
//           }
//         })
//         .skip(skip)
//         .limit(limit)
//         .sort({ createdAt: -1 }),

//       User.countDocuments(filter)
//     ]);

//     /** ================= ADD TEAM NAME ================= */
//     const employeesWithTeam = await Promise.all(
//       employees.map(async (emp) => {
//         let teamName = null;

//         if (emp.referenceId) {
//           const team = await Team.findById(emp.referenceId).select("name");
//           teamName = team ? team.name : null;
//         }

//         return {
//           id: emp._id,
//           name: emp.name,
//           email: emp.email,
//           role: emp.role,
//           teamName,
//         };
//       })
//     );

//     /** ================= RESPONSE ================= */
//     return res.json({
//       success: true,
//       data: employeesWithTeam,
//       pagination: {
//         totalRecords: total,
//         currentPage: page,
//         limit,
//         totalPages: Math.ceil(total / limit)
//       }
//     });

//   } catch (error) {
//     console.error("Employee List Error:", error);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };


/** ================= Employee List ================= */
// export const listEmployees = async (req: Request, res: Response) => {
//   try {
//     const admin = (req as any).admin; // comes from verifyToken

//     if (!admin) {
//       return res.status(401).json({ success: false, message: "Unauthorized" });
//     }

//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     /** ================= BASE FILTER ================= */
//     let filter: any = {
//       role: "EMPLOYEE",
//       referenceType: { $in: ["Team", "TEAM", "team"] }
//     };

//     /** ================= HR MANAGER FILTER ================= */
//     if (admin.role === "HR_MANAGER") {

//       if (!admin.companyId) {
//         return res.status(400).json({
//           success: false,
//           message: "HR Manager does not belong to a company"
//         });
//       }

//       // 🔥 Get teams belonging to this HR's company
//       const teams = await Team.find({ companyId: admin.companyId });
//       const teamIds = teams.map((t) => t._id);

//       if (teamIds.length === 0) {
//         return res.json({
//           success: true,
//           data: [],
//           pagination: {
//             totalRecords: 0,
//             currentPage: page,
//             limit,
//             totalPages: 0
//           }
//         });
//       }

//       filter.referenceId = { $in: teamIds };
//     }

//     /** ================= GET EMPLOYEES ================= */
//     const [employees, total] = await Promise.all([
//       User.find(filter)
//         .populate({
//           path: "referenceId",
//           model: "Team",
//           select: "name companyId",
//           populate: {
//             path: "companyId",
//             model: "Company",
//             select: "name"
//           }
//         })
//         .skip(skip)
//         .limit(limit)
//         .sort({ createdAt: -1 }),

//       User.countDocuments(filter)
//     ]);

//     /** ================= FORMAT RESPONSE ================= */
//     const employeesWithTeam = employees.map((emp) => {
//       const team = emp.referenceId as any; // <-- populated team object

//       return {
//         id: emp._id,
//         name: emp.name,
//         email: emp.email,
//         role: emp.role,
//         teamName: team?.name || null,
//         companyName: team?.companyId?.name || null   // <-- ADDED
//       };
//     });

//     /** ================= RESPONSE ================= */
//     return res.json({
//       success: true,
//       data: employeesWithTeam,
//       pagination: {
//         totalRecords: total,
//         currentPage: page,
//         limit,
//         totalPages: Math.ceil(total / limit)
//       }
//     });

//   } catch (error) {
//     console.error("Employee List Error:", error);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };

export const listEmployees = async (req: Request, res: Response) => {
  try {
    const admin = (req as any).admin;

    if (!admin) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = (req.query.search as string) || "";

    /** ================= BASE FILTER ================= */
    let filter: any = {
      role: "EMPLOYEE",
      referenceType: { $in: ["Team", "TEAM", "team"] },
      isDeleted: { $ne: true } // ✅ HIDE DELETED EMPLOYEES
    };

    /** ================= 🔍 SEARCH FILTER ================= */
    if (search.trim() !== "") {
      const keyword = search.trim();

      filter.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } }
      ];
    }

    /** ================= HR MANAGER FILTER ================= */
    if (admin.role === "HR_MANAGER") {
      if (!admin.companyId) {
        return res.status(400).json({
          success: false,
          message: "HR Manager does not belong to a company"
        });
      }

      // ✅ ONLY ACTIVE TEAMS
      const teams = await Team.find({
        companyId: admin.companyId,
        isDeleted: { $ne: true }
      }).select("_id");

      const teamIds = teams.map(t => t._id);

      if (teamIds.length === 0) {
        return res.json({
          success: true,
          data: [],
          pagination: {
            totalRecords: 0,
            currentPage: page,
            limit,
            totalPages: 0
          }
        });
      }

      filter.referenceId = { $in: teamIds };
    }

    /** ================= GET EMPLOYEES ================= */
    const [employees, total] = await Promise.all([
      User.find(filter)
        .populate({
          path: "referenceId",
          model: "Team",
          match: { isDeleted: { $ne: true } }, // ✅ DOUBLE SAFETY
          select: "name companyId",
          populate: {
            path: "companyId",
            model: "Company",
            select: "name"
          }
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),

      User.countDocuments(filter)
    ]);

    /** ================= FORMAT RESPONSE ================= */
    const formatted = employees.map((emp: any) => {
      const team = emp.referenceId;

      return {
        id: emp._id,
        name: emp.name,
        email: emp.email,
        role: emp.role,
        teamName: team?.name || null,
        companyName: team?.companyId?.name || null
      };
    });

    return res.json({
      success: true,
      data: formatted,
      pagination: {
        totalRecords: total,
        currentPage: page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Employee List Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


/** ================= SOFT DELETE EMPLOYEE ================= */
export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await User.findOne({
      _id: id,
      role: "EMPLOYEE",
      isDeleted: { $ne: true }
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    employee.isDeleted = true;
    employee.deletedAt = new Date();
    await employee.save();

    return res.json({
      success: true,
      message: "Employee deleted successfully"
    });

  } catch (error) {
    console.error("Delete Employee Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};




/** ================= CHANGE TEAM LEAD ================= */
export const changeTeamLead = async (req: Request, res: Response) => {
    const { teamId, newLeadId } = req.body;
    const team = await Team.findByIdAndUpdate(teamId, { teamLead: newLeadId }, { new: true });
    res.json({ success: true, message: 'Team lead updated', data: team });
};




/** ================= TEAM LEAD List ================= */
// export const listTeamLeads = async (req: Request, res: Response) => {
//   try {
//     const admin = (req as any).admin; // decoded token user

//     if (!admin) {
//       return res.status(401).json({ success: false, message: "Unauthorized" });
//     }

//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     /** ================= BASE FILTER ================= */
//     let filter: any = {
//       role: "TEAMLEAD",
//       referenceType: "Team",
//       referenceId: { $ne: null }
//     };

//     /** ================= HR MANAGER FILTER ================= */
//     if (admin.role === "HR_MANAGER") {
//       if (!admin.companyId) {
//         return res.status(400).json({
//           success: false,
//           message: "HR Manager does not belong to any company"
//         });
//       }

//       // find teams under this HR manager's company
//       const teams = await Team.find({ companyId: admin.companyId });
//       const teamIds = teams.map((t) => t._id);

//       if (teamIds.length === 0) {
//         return res.json({
//           success: true,
//           data: [],
//           pagination: {
//             totalRecords: 0,
//             currentPage: page,
//             limit,
//             totalPages: 0
//           }
//         });
//       }

//       filter.referenceId = { $in: teamIds };
//     }

//     /** ================= SUPER_ADMIN sees ALL ================= */
//     // no change needed for SUPER_ADMIN

//     /** ================= FETCH TEAM LEADS ================= */
//     const [teamLeads, total] = await Promise.all([
//       User.find(filter)
//         .select("-password")
//         .populate({
//           path: "referenceId",
//           model: "Team",
//           select: "name teamCode companyId",
//            populate: {
//             path: "companyId",
//             model: "Company",
//             select: "name"     // <-- only company name
//           }
//         })
//         .skip(skip)
//         .limit(limit)
//         .sort({ createdAt: -1 }),

//       User.countDocuments(filter)
//     ]);

//     /** ================= RESPONSE ================= */
//     return res.json({
//       success: true,
//       data: teamLeads,
//       pagination: {
//         totalRecords: total,
//         currentPage: page,
//         limit,
//         totalPages: Math.ceil(total / limit)
//       }
//     });

//   } catch (error) {
//     console.error("Team Lead List Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error"
//     });
//   }
// };

export const listTeamLeads = async (req: Request, res: Response) => {
  try {
    const admin = (req as any).admin;

    if (!admin) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = (req.query.search as string) || "";

    /** ================= BASE FILTER ================= */
    let filter: any = {
      role: "TEAMLEAD",
      referenceType: "Team",
      referenceId: { $ne: null },
      isDeleted: { $ne: true } // ✅ HIDE DELETED TEAM LEADS
    };

    /** ================= 🔍 SEARCH FILTER ================= */
    if (search.trim() !== "") {
      const keyword = search.trim();

      filter.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } }
      ];
    }

    /** ================= HR MANAGER FILTER ================= */
    if (admin.role === "HR_MANAGER") {
      if (!admin.companyId) {
        return res.status(400).json({
          success: false,
          message: "HR Manager does not belong to any company"
        });
      }

      // ✅ ONLY ACTIVE TEAMS
      const teams = await Team.find({
        companyId: admin.companyId,
        isDeleted: { $ne: true }
      }).select("_id");

      const teamIds = teams.map(t => t._id);

      if (teamIds.length === 0) {
        return res.json({
          success: true,
          data: [],
          pagination: {
            totalRecords: 0,
            currentPage: page,
            limit,
            totalPages: 0
          }
        });
      }

      filter.referenceId = { $in: teamIds };
    }

    /** ================= FETCH TEAM LEADS ================= */
    const [teamLeads, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .populate({
          path: "referenceId",
          model: "Team",
          match: { isDeleted: { $ne: true } }, // ✅ DOUBLE SAFETY
          select: "name teamCode companyId",
          populate: {
            path: "companyId",
            model: "Company",
            select: "name"
          }
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),

      User.countDocuments(filter)
    ]);

    /** ================= EXTRA SEARCH (populated fields) ================= */
    let finalTeamLeads = teamLeads;

    if (search.trim() !== "") {
      const keyword = search.trim().toLowerCase();

      finalTeamLeads = teamLeads.filter((lead: any) => {
        const team = lead.referenceId;
        const company = team?.companyId;

        return (
          lead.name?.toLowerCase().includes(keyword) ||
          lead.email?.toLowerCase().includes(keyword) ||
          team?.name?.toLowerCase().includes(keyword) ||
          team?.teamCode?.toLowerCase().includes(keyword) ||
          company?.name?.toLowerCase().includes(keyword)
        );
      });
    }

    return res.json({
      success: true,
      data: finalTeamLeads,
      pagination: {
        totalRecords: search ? finalTeamLeads.length : total,
        currentPage: page,
        limit,
        totalPages: Math.ceil((search ? finalTeamLeads.length : total) / limit)
      }
    });

  } catch (error) {
    console.error("Team Lead List Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


/** ================= SOFT DELETE TEAM LEAD ================= */
// export const deleteTeamLead = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     const teamLead = await User.findOne({
//       _id: id,
//       role: "TEAMLEAD",
//       isDeleted: { $ne: true }
//     });

//     if (!teamLead) {
//       return res.status(404).json({
//         success: false,
//         message: "Team Lead not found"
//       });
//     }

//     teamLead.isDeleted = true;
//     teamLead.deletedAt = new Date();
//     await teamLead.save();

//     return res.json({
//       success: true,
//       message: "Team Lead deleted successfully"
//     });

//   } catch (error) {
//     console.error("Delete Team Lead Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error"
//     });
//   }
// };


export const deleteTeamLead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Team Lead ID"
      });
    }

    // 🔍 Find user (deleted or not)
    const teamLead = await User.findOne({
      _id: id,
      role: "TEAMLEAD"
    });

    if (!teamLead) {
      return res.status(404).json({
        success: false,
        message: "Team Lead not found"
      });
    }

    // ✅ ALWAYS remove from Team FIRST
    await Team.updateMany(
      { teamLead: teamLead._id },
      { $set: { teamLead: null } }
    );

    // ✅ Soft delete user if not already deleted
    if (!teamLead.isDeleted) {
      teamLead.isDeleted = true;
      teamLead.deletedAt = new Date();
      teamLead.referenceType = null;
      teamLead.referenceId = null;
      await teamLead.save();
    }

    return res.json({
      success: true,
      message: "Team Lead deleted and removed from team successfully"
    });

  } catch (error) {
    console.error("Delete Team Lead Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};