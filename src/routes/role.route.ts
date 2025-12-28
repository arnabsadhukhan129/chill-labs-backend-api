import { Router } from "express";
import RoleController from "../controllers/role.controller";
import {
  validateCreateRole,
  validateEditRole,
} from "../middleware/validateRole"; // Ensure the path is correct

const router = Router();
// Route to create a role with modules and permissions

/**
 * @swagger
 * /rbac/roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_name:
 *                 type: string
 *                 example: "Task role for staff"
 *               role_description:
 *                 type: string
 *                 example: "Task role for staff"
 *               role_color:
 *                 type: string
 *                 example: "rgba(164, 57, 57, 1)"
 *               parent_id:
 *                 type: integer
 *                 example: 1
 *               role_level:
 *                 type: string
 *                 example: "LVL-4"
 *               role_type:
 *                 type: string
 *                 enum: ["staff", "admin"]
 *                 example: "staff"
 *               modules_permissions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     module_id:
 *                       type: integer
 *                       example: 1
 *                     permission_id:
 *                       type: integer
 *                       example: 1
 *     responses:
 *       201:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Role created successfully"
 *                 role:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Task role for staff"
 *                     description:
 *                       type: string
 *                       example: "Task role for staff"
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.post("/roles", validateCreateRole, RoleController.createRole); // Use validation middleware

/**
 * @swagger
 * /rbac/allroles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     parameters:
 *       - in: query
 *         name: role_type
 *         schema:
 *           type: string
 *           enum: ["staff", "admin"]
 *     responses:
 *       201:
 *         description: Role retrieved successfully
 *
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.get("/allroles", RoleController.getRoles); // Use validation middleware

/**
 * @swagger
 * /rbac/roles/{id}:
 *   put:
 *     summary: Edit an existing role
 *     tags: [Roles]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the role to edit
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_name:
 *                 type: string
 *                 example: "Updated Task role for staff"
 *               role_description:
 *                 type: string
 *                 example: "Updated description for task role"
 *               role_color:
 *                 type: string
 *                 example: "rgba(164, 57, 57, 1)"
 *               role_type:
 *                 type: string
 *                 enum: ["staff", "admin"]
 *                 example: "staff"
 *               modules_permissions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     module_id:
 *                       type: integer
 *                       example: 1
 *                     permission_id:
 *                       type: integer
 *                       example: 1
 *     responses:
 *       200:
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Role updated successfully"
 *                 role:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Updated Task role for staff"
 *                     description:
 *                       type: string
 *                       example: "Updated description for task role"
 *                     role_type:
 *                       type: string
 *                       example: "staff"
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Role not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.put("/roles/:id", validateEditRole, RoleController.editRole);

/**
 * @swagger
 * /rbac/roles/{id}:
 *   get:
 *     summary: Get a role by ID
 *     tags: [Roles]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the role to fetch
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Role fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "Task role for staff"
 *                 description:
 *                   type: string
 *                   example: "Task role description"
 *                 modules_permissions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       module_id:
 *                         type: integer
 *                         example: 1
 *                       permission_id:
 *                         type: integer
 *                         example: 1
 *       404:
 *         description: Role not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Role not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.get("/roles/:id", RoleController.getRoleById);

/**
 * @swagger
 * /rbac/roles/{id}:
 *   delete:
 *     summary: Delete a role by ID
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the role to delete
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       404:
 *         description: Role not found
 *       400:
 *         description: Invalid role ID
 *       500:
 *         description: Internal server error
 */
router.delete("/roles/:id", RoleController.deleteRoleHandler);

/**
 * @swagger
 * /rbac/assignUser:
 *   post:
 *     summary: Assign a role to a user
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               roleId:
 *                 type: integer
 *             required:
 *               - userId
 *               - roleId
 *     responses:
 *       200:
 *         description: Role assigned successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User or role not found
 */
router.post("/assignUser", RoleController.assignUserRole);

/**
 * @swagger
 * /rbac/updteroleassign:
 *   post:
 *     summary: Update role assignment
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: number
 *               previousRoleids:
 *                 type: array
 *                 items:
 *                   type: number
 *               roleIds:
 *                 type: array
 *                 items:
 *                   type: number
 *             required:
 *               - userId
 *               - ids
 *               - roleIds
 *     responses:
 *       200:
 *         description: Role assignment updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User or role not found
 */
router.post("/updteroleassign", RoleController.updateRoleAssignment);

/**
 * @swagger
 * /rbac/roles/user/{userId}:
 *   get:
 *     summary: Get roles by user ID
 *     tags: [Roles]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID of the user to fetch roles for
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful response with the roles
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *       404:
 *         description: User not found or no roles assigned
 */
router.get("/roles/user/:userId", RoleController.getRolesByUserId);

/**
 * @swagger
 * /rbac/permissions:
 *   get:
 *     summary: Retrieve a list of all permissions
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: A list of permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   slug:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 */
router.get("/permissions", RoleController.getAllPermissions);

/**
 * @swagger
 * /rbac/modules:
 *   get:
 *     summary: Retrieve a list of all modules
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: A list of modules
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   slug:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 */
router.get("/modules", RoleController.getAllModules);


/**
 * @swagger
 * /rbac/getrolewseusers:
 *   get:
 *     summary: Get roles with associated users by role ID
 *     tags: [Roles]
 *     parameters:
 *       - in: query
 *         name: role_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the role to fetch users for
 *     responses:
 *       200:
 *         description: Roles with users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   color:
 *                     type: string
 *                   userRoles:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         userId:
 *                           type: integer
 *                         users:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *                             email:
 *                               type: string
 *                             username:
 *                               type: string
 *                             phoneNumber:
 *                               type: string
 *                             profile_image_url:
 *                               type: string
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get("/getrolewseusers", RoleController.getRoleWseUsers);


/**
 * @swagger
 * /rbac/userrolemodules:
 *   get:
 *     summary: Retrieve user role permissions
 *     tags: [Roles]
 *     parameters:
 *       - in: query
 *         name: module_type
 *         schema:
 *           type: string
 *         required: true
 *         description: type of module
 *     responses:
 *       200:
 *         description: User role permissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   color:
 *                     type: string
 *                   modulesPermissions:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         module:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *                         permission:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get("/userrolemodules", RoleController.getUserRolePermissions);

router.get("/allmodulespaths", RoleController.getAllModulesAndPaths);

/**
 * @swagger
 * /rbac/getrolepathpermissions/{id}:
 *   get:
 *     summary: Retrieve role path permissions by ID
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the role to fetch path permissions for
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Role path permission retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 color:
 *                   type: string
 *                 modulesPermissions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       module:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                       permission:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get("/getrolepathpermissions/:id", RoleController.getRolePathPermission);

export default router;
