import express from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import { allowRoles } from '../middleware/roleMiddleware';

import {
  createEmployee,
  createTeam,
  addEmployeeToTeam,
  listTeams,
  listEmployees,
  changeTeamLead,
  deleteTeam,
  listTeamLeads,
  deleteEmployee,
  deleteTeamLead,
} from '../controllers/hr.controller';

const router = express.Router();

// ================= EMPLOYEE =================

// Create Employee
router.post(
  '/employee/create',
  verifyToken,
  allowRoles('HR_MANAGER'),
  createEmployee
);

// ================= TEAM =================

// Create Team
router.post(
  '/team/create',
  verifyToken,
  allowRoles('SUPER_ADMIN','HR_MANAGER'),
  createTeam
);

// Add Employees to Team
router.post(
  '/team/add-employees',
  verifyToken,
  allowRoles('HR_MANAGER'),
  addEmployeeToTeam
);

// List All Teams
router.get(
  '/teams',
  verifyToken,
  allowRoles('SUPER_ADMIN', 'HR_MANAGER'),
  listTeams
);

// Delete Teams
router.delete(
  '/teams/:id',
  verifyToken,
  allowRoles('SUPER_ADMIN', 'HR_MANAGER'),
  deleteTeam
);

router.get(
  "/employees",
  verifyToken,
  allowRoles("SUPER_ADMIN", "HR_MANAGER"),
  listEmployees
);

router.delete(
  "/employees/:id",
  verifyToken,
  allowRoles("SUPER_ADMIN", "HR_MANAGER"),
  deleteEmployee
);


// List All Teams Lead
router.get(
  '/team-lead',
  verifyToken,
  allowRoles("SUPER_ADMIN", "HR_MANAGER"),
  listTeamLeads
);

router.delete(
  "/team-lead/:id",
  verifyToken,
  allowRoles("SUPER_ADMIN", "HR_MANAGER"),
  deleteTeamLead
);

// // List Employees of a Team
// router.get(
//   '/team/:teamId/employees',
//   verifyToken,
//   allowRoles('HR_MANAGER'),
//   listTeamEmployees
// );

// Change Team Lead
router.put(
  '/team/change-lead',
  verifyToken,
  allowRoles('HR_MANAGER'),
  changeTeamLead
);

// Soft Delete Team
router.delete(
  '/team/:id',
  verifyToken,
  allowRoles('HR_MANAGER'),
  deleteTeam
);

export default router;
