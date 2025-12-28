import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Admin from "../../models/admin";
import User from "../../models/User";
import Team from "../../models/Team"; // IMPORTANT! needed to resolve employee → HR → company

interface JwtPayload {
  id: string;
  role: string;
  email: string;
}

export const verifyToken = async (req: any, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    // ---------------------------------------------------------
    // 1️⃣ CHECK USER LOGIN (EMPLOYEE, TEAMLEAD, STUDENT, TEACHER)
    // ---------------------------------------------------------
    let user = await User.findById(decoded.id).lean();

    if (user) {
      let schoolId = null;
      let companyId = null;

      // --------------------------------------------------
      // 🔵 EMPLOYEE / TEAMLEAD → resolve via TEAM → HR_MANAGER
      // --------------------------------------------------
      if (user.role === "EMPLOYEE" || user.role === "TEAMLEAD") {
        // Step 1: Find Team
        const team = await Team.findById(user.referenceId).lean();

        if (team && team.teamLead) {
          // Step 2: TeamLead is a USER → referenceId inside teamLead = HR_MANAGER ID
          const teamLead = await User.findById(team.teamLead).lean();

          if (teamLead && teamLead.referenceId) {
            // Step 3: HR Manager
            const hr = await Admin.findById(teamLead.referenceId).lean();

            if (hr && hr.companyId) {
              companyId = hr.companyId; // SUCCESS!
            }
          }
        }
      }

      // --------------------------------------------------
      // 🔵 STUDENT / TEACHER → school from SCHOOL_ADMIN
      // --------------------------------------------------
      if (user.role === "STUDENT" || user.role === "TEACHER") {
        const schoolAdmin = await Admin.findById(user.referenceId).lean();
        if (schoolAdmin && schoolAdmin.schoolId) {
          schoolId = schoolAdmin.schoolId;
        }
      }

     req.user = {
      id: user._id,            // FIXED
      role: user.role,
      schoolId,
      companyId,
      referenceId: user.referenceId,
      type: "USER"
    };


      return next();
    }

    // ---------------------------------------------------------
    // 2️⃣ CHECK ADMIN LOGIN
    // ---------------------------------------------------------
    const admin = await Admin.findById(decoded.id).lean();
    if (admin) {
      req.user = {
        id: admin._id,           // FIXED
        role: admin.role,
        schoolId: admin.schoolId || null,
        companyId: admin.companyId || null,
        type: "ADMIN"
      };
      return next();
    }

    return res.status(404).json({ message: "User/Admin not found" });

  } catch (error) {
    console.log("TOKEN ERROR:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
