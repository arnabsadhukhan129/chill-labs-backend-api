import express from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import { allowRoles } from '../middleware/roleMiddleware';
import {
  createClass,
  listClasses,
  // getClassById,
  deleteClass,
  createTeacher,
  listTeachers,
  deleteTeacher,
  createStudent,
  listStudents,
  // getStudentById,
  deleteStudent,
  listGuests,
  removeGuest
} from '../controllers/schoolAdmin.controller';

const router = express.Router();

// CLASS
router.post('/class/create', verifyToken, allowRoles('SCHOOL_ADMIN'), createClass);
router.get('/class/list', verifyToken, allowRoles('SUPER_ADMIN','SCHOOL_ADMIN'), listClasses);
// router.get('/class/:id', verifyToken, allowRoles('SCHOOL_ADMIN'), getClassById);
router.delete('/class/:id', verifyToken, allowRoles('SUPER_ADMIN','SCHOOL_ADMIN'), deleteClass);

// TEACHER
router.post('/teacher/create', verifyToken, allowRoles('SCHOOL_ADMIN'), createTeacher);
router.get('/teacher/list',verifyToken,
  allowRoles("SUPER_ADMIN", "SCHOOL_ADMIN"),
  listTeachers
);
router.delete('/teacher/:id', verifyToken, allowRoles('SCHOOL_ADMIN','SUPER_ADMIN'), deleteTeacher);
// router.get('/teacher/:id', verifyToken, allowRoles('SCHOOL_ADMIN'), getTeacherById);

// STUDENT
router.post('/student/create', verifyToken, allowRoles('SCHOOL_ADMIN'), createStudent);
router.get(
  "/student/list",
  verifyToken,
  allowRoles("SUPER_ADMIN", "SCHOOL_ADMIN"),
  listStudents
);

// router.get('/student/:id', verifyToken, allowRoles('SCHOOL_ADMIN'), getStudentById);
router.delete('/student/:id', verifyToken, allowRoles('SCHOOL_ADMIN','SUPER_ADMIN'), deleteStudent);

//GUEST
router.get('/guest/list', listGuests);
router.delete('/guest/:id',removeGuest);

export default router;
