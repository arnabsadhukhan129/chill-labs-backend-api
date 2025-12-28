import { Request, Response } from "express";
import RoleService from "../services/role.service";
import { RoleData, ModulePermission } from "../../types/role";
import { handleResponse } from "../utils/responseHandler";

class RoleController {
  /**
   * Create a new role with associated permissions.
   * @param req - Express Request object
   * @param res - Express Response object
   */
  async createRole(req: Request, res: Response) {
    const {
      role_name,
      role_description,
      role_color,
      role_type,
      parent_id,
      role_level,
      modules_permissions,
    }: {
      role_name: string;
      role_description?: string;
      role_color?: string;
      role_type?: string;
      parent_id?: number;
      role_level?: string;
      modules_permissions: ModulePermission[];
    } = req.body;

    try {
      // Use the service to create the role and associate it with modules and permissions
      const role = await RoleService.createRoleWithPermissions(
        {
          name: role_name,
          description: role_description,
          color: role_color,
          role_type,
          parent_id: parent_id ?? (+process.env.DEFAULT_PARENT_ID! as number),
          role_level: role_level ?? "LVL-5",
        },
        modules_permissions
      );
      handleResponse(res, 200, "Role created successfully", { role });
    } catch (error: any) {
      handleResponse(res, 500, "Error occurred", null, error.message);
    }
  }

  /**
   * Edit an existing role and its associated permissions.
   * @param req - Express Request object
   * @param res - Express Response object
   */
  async editRole(req: Request, res: Response) {
    const { id } = req.params;
    const {
      role_name,
      role_description,
      role_color,
      role_type,
      parent_id,
      modules_permissions,
      role_level,
    }: {
      role_name: string;
      role_description?: string;
      role_color?: string;
      role_type?: string;
      parent_id?: number;
      role_level?: string;
      modules_permissions: ModulePermission[];
    } = req.body;

    try {
      // Update the role with the provided information
      const role = await RoleService.editRoleWithPermissions(
        id,
        {
          name: role_name,
          description: role_description,
          color: role_color,
          role_type,
          parent_id: parent_id ?? (+process.env.DEFAULT_PARENT_ID! as number),
          role_level,
        },
        modules_permissions
      );
      handleResponse(res, 200, "Role updated successfully", { role });
    } catch (error: any) {
      handleResponse(res, 500, "Error occurred", null, error.message);
    }
  }

  /**
   * Retrieve role details by ID.
   * @param req - Express Request object
   * @param res - Express Response object
   */
  async getRoleById(req: Request, res: Response) {
    const { id } = req.params;

    try {
      // Fetch role details from the service
      const roleDetails = await RoleService.getRoleDetails(id);
      handleResponse(res, 200, "Role retrieved successfully", {
        roles: roleDetails,
      });
    } catch (error: any) {
      handleResponse(res, 500, "Error occurred", null, error.message);
    }
  }
  /**
   * Retrieve role details by ID.
   * @param req - Express Request object
   * @param res - Express Response object
   */
  async getRoles(req: Request, res: Response) {
    try {
      // Fetch role details from the service
      const { role_type } = req.query;
      const roleDetails = await RoleService.getRoles(
        typeof role_type === "string" ? [role_type] : ["staff", "admin"]
      );
      handleResponse(res, 200, "Role retrieved successfully", roleDetails);
    } catch (error: any) {
      handleResponse(res, 500, "Error occurred", null, error.message);
    }
  }

  /**
   * Delete a role by its ID.
   * @param req - Express Request object
   * @param res - Express Response object
   */
  async deleteRoleHandler(req: Request, res: Response) {
    const roleId = req.params.id;

    try {
      const essentialRoles = process.env.ESSENTIAL_ROLES?.split(",");

      if (essentialRoles?.includes(roleId.toString())) {
        return handleResponse(res, 400, "Cannot delete an essential role");
      }
      // Attempt to delete the role by ID
      const isDeleted = await RoleService.deleteRoleById(roleId);

      if (isDeleted) {
        handleResponse(
          res,
          200,
          "Role and associated permissions deleted successfully"
        );
      } else {
        handleResponse(res, 404, "Role not found");
      }
    } catch (error: any) {
      console.error("Error in deleteRoleHandler:", error);
      handleResponse(res, 500, "Internal server error", null, error.message);
    }
  }

  /**
   * Assign a role to a user.
   * @param req - Express Request object
   * @param res - Express Response object
   */
  async assignUserRole(req: Request, res: Response) {
    const { userId, roleId } = req.body;
    const { id } = (req as any).user;
    try {
      // Call the service to assign the role to the user
      const userRole = await RoleService.assignRoleToUser(userId, roleId, id);
      handleResponse(res, 200, "Role assigned successfully", { userRole });
    } catch (error: any) {
      handleResponse(res, 500, "Error assigning role", null, error.message);
    }
  }

  /**
   * Get roles assigned to a user by user ID.
   * @param req - Express Request object
   * @param res - Express Response object
   */
  async getRolesByUserId(req: Request, res: Response) {
    const { userId } = req.params;

    try {
      // Fetch roles associated with the user
      const roles = await RoleService.fetchRolesByUserId(userId);

      if (!roles) {
        handleResponse(res, 404, "No roles found for this user");
      } else {
        handleResponse(res, 200, "Roles retrieved successfully", roles);
      }
    } catch (error: any) {
      handleResponse(res, 500, "Internal server error", null, error.message);
    }
  }

  async getAllPermissions(req: Request, res: Response) {
    try {
      const permissions = await RoleService.getAllPermissions();
      handleResponse(
        res,
        200,
        "Permissions retrieved successfully",
        permissions
      );
    } catch (error: any) {
      handleResponse(res, 500, "Internal server error", null, error.message);
    }
  }

  async getAllModules(req: Request, res: Response) {
    try {
      const modules = await RoleService.getAllModules();
      handleResponse(res, 200, "Modules retrieved successfully", modules);
    } catch (error: any) {
      handleResponse(res, 500, "Internal server error", null, error.message);
    }
  }

  async getRoleWseUsers(req: Request, res: Response) {
    try {
      const role_id = req.query.role_id as string;
      if (!role_id)
        return res.status(400).json({ error: "role_id is required" });
      const roles = await RoleService.getRolesWithUsers(role_id);
      handleResponse(res, 200, "Roles retrieved successfully", roles);
    } catch (error: any) {
      handleResponse(res, 500, "Internal server error", null, error.message);
    }
  }

  async updateRoleAssignment(req: Request, res: Response) {
    const { id } = (req as any).user;
    const { userId, roleIds, previousRoleids } = req.body;

    try {
      // Call the service to update the role assignment
      const userRole = await RoleService.updateRoleAssignment(
        userId,
        roleIds,
        previousRoleids,
        id
      );
      handleResponse(res, 200, "Role assignment updated successfully", {
        userRole,
      });
    } catch (error: any) {
      handleResponse(res, 500, "Error assigning role", null, error.message);
    }
  }

  async getUserRolePermissions(req: Request, res: Response) {
    const { id } = (req as any).user ?? { id: 249 };
    const type = req?.query?.module_type as string | undefined;

    try {
      const permissions = await RoleService.getUserRolePermissions(id, type);
      handleResponse(
        res,
        200,
        "User role permissions retrieved successfully",
        permissions
      );
    } catch (error: any) {
      handleResponse(res, 500, "Internal server error", null, error.message);
    }
  }

  async getAllModulesAndPaths(req: Request, res: Response) {
    try {
      const modules = await RoleService.getAllModulesPaths();
      handleResponse(res, 200, "Modules retrieved successfully", modules);
    } catch (error: any) {
      handleResponse(res, 500, "Internal server error", null, error.message);
    }
  }

  async getRolePathPermission(req: Request, res: Response) {
    try {
      const roleId = req?.params?.id as string;
      if (!roleId)
        return res.status(400).json({ error: "role_id is required" });

      const response = await RoleService.getRolePermissionsByRoleId(roleId);

      handleResponse(
        res,
        200,
        "Role path permission retrieved successfully",
        response
      );
    } catch (error: any) {
      handleResponse(res, 500, "Request failed", null, error.message);
    }
  }
}

export default new RoleController();
