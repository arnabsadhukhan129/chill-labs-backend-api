import express from 'express';
import {
  createSchool,
  listSchools,
  updateSchool,
  deleteSchool,
  getSchoolById,
  getSchoolAdmins,
  listSchoolAdmins,
  createSchoolAdmin,
  getAllHRManagers,
  getAllSchoolAdmins,
  deleteSchoolAdmin,
  deleteHRManager
} from '../controllers/school.controller';

import { verifyToken } from '../middleware/authMiddleware';
import { allowRoles } from '../middleware/roleMiddleware';

const router = express.Router();

// CREATE SCHOOL
router.post('/create', verifyToken, allowRoles('SUPER_ADMIN'), createSchool);

// CREATE Company
router.post('/create', verifyToken, allowRoles('SUPER_ADMIN'), createSchool);

// LIST SCHOOLS
router.get('/', listSchools);

//Delete Schools
router.delete("/:id", verifyToken, allowRoles('SUPER_ADMIN'), deleteSchool);

// LIST SCHOOL ADMINS 
router.get('/list-school-admin', getAllSchoolAdmins);

// Delete SCHOOL ADMINS 
router.delete('/school-admin/:id', deleteSchoolAdmin);

// LIST HR Managers
router.get('/list-hr-manager', getAllHRManagers);

// Delete HR Managers
router.delete('/hr-manager/:id', deleteHRManager);

// UPDATE SCHOOL
router.put('/:id', verifyToken, allowRoles('SUPER_ADMIN'), updateSchool);

// SOFT DELETE SCHOOL
router.delete('/:id', verifyToken, allowRoles('SUPER_ADMIN'), deleteSchool);

// GET SCHOOL BY ID
router.get('/school-by-id/:id', verifyToken, allowRoles('SUPER_ADMIN'), getSchoolById);

// LIST SCHOOL ADMINS (HR + SCHOOL ADMIN)
router.get('/list-admin-hr/:schoolCode', verifyToken, allowRoles('SUPER_ADMIN'), getSchoolAdmins);

//School Wise Admin and HR
router.get('/:schoolId', verifyToken, allowRoles('SUPER_ADMIN'), listSchoolAdmins);

// Create HR and School Admin using schoolCode
// router.post('/create-admin-hr', verifyToken, allowRoles('SUPER_ADMIN'), createSchoolAdmin);
router.post('/create-admin-hr', verifyToken, createSchoolAdmin);



export default router;
