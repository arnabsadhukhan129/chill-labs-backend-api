import Role from "../../models/role";
import User from "../../models/User";
import UserRole from "../../models/userRole";
import Permission from "../../models/permission";
import RoleModulePermission from "../../models/roleModulePermission";
import { RoleCreationAttributes, ModulePermission } from "../../types/role";
import UserBankDetails from "../../models/userBankDetails";
import Country from "../../models/country";
import UserAddress from "../../models/userAddress";
import authService from "./auth.service";
import mongoose from "mongoose";


class RoleService {
  /**
   * Create a new role with associated permissions.
   * @Author Aashutosh
   * @param roleData - The data for the new role, including name and description.
   * @param modulesPermissions - An array of permissions associated with the role.
   * @returns The created role.
   */
  async createRoleWithPermissions(
    roleData: any,
    modulesPermissions: any[]
  ) {
    try {
      // Generate a slug for the role
      const words = roleData.name.split(" ");
      const slugArray = words.map((word: string) => {
        const truncatedWord = word.slice(0, 3);
        const randomNumber = Math.floor(1000 + Math.random() * 900);
        return `${truncatedWord}${randomNumber}`.slice(0, 3);
      });
      const slug =
        slugArray.join("").toUpperCase() +
        Math.floor(100 + Math.random() * 900);
      roleData.role_slug = slug;

      const role = await Role.create(roleData); // Ensure this matches your Role model

      // Iterate over modules and permissions and add them to RoleModulePermission
      for (const modulePermission of modulesPermissions) {
        const { module_id, permission_id } = modulePermission;

        await RoleModulePermission.create({
          module_id: new mongoose.Types.ObjectId(module_id),
          permission_id: new mongoose.Types.ObjectId(permission_id),
          role_id: role._id,
        });
      }

      return role;
    } catch (error: any) {
      throw new Error("Error:" + error.message);
    }
  }

  /**
   * Edit an existing role and its associated permissions.
   * @Author Aashutosh
   * @param roleId - The ID of the role to edit.
   * @param roleData - The new data for the role.
   * @param modulesPermissions - An array of new permissions associated with the role.
   * @returns The updated role.
   */
  async editRoleWithPermissions(
    roleId: string,
    roleData: any,
    modulesPermissions: any[]
  ) {
    const role = await Role.findById(roleId);

    if (!role) {
      throw new Error("Role not found"); // You can throw a custom error
    }

    Object.assign(role, roleData);
    await role.save();

    // Clear existing permissions and modules
    await RoleModulePermission.deleteMany({ role_id: new mongoose.Types.ObjectId(roleId) });

    // Add new permissions
    for (const modulePermission of modulesPermissions) {
      const { module_id, permission_id } = modulePermission;
      await RoleModulePermission.create({
        module_id: new mongoose.Types.ObjectId(module_id),
        permission_id: new mongoose.Types.ObjectId(permission_id),
        role_id: new mongoose.Types.ObjectId(roleId),
      });
    }

    return role;
  }

  /**
   * Retrieve role details by ID, including associated permissions.
   * @Author Aashutosh
   * @param roleId - The ID of the role to retrieve.
   * @returns An object containing role details and permissions, or null if not found.
   */
  async getRoleDetails(roleId: string) {
    const roleWithPermissions = await Role.findById(roleId).populate({
      path: 'modulesPermissions',
      populate: {
        path: 'permission_id',
        model: 'Permission'
      }
    });

    // Check if roleWithPermissions is null before accessing its properties
    if (!roleWithPermissions) {
      return null; // Return null if no role is found
    }

    // Check if roleWithPermissions is null before accessing its properties
    const formattedResponse = {
      role_name: roleWithPermissions?.name,
      role_description: roleWithPermissions?.description,
      role_color: roleWithPermissions?.color,
      parent_id: roleWithPermissions?.parent_id,
      role_type: roleWithPermissions?.role_type,
      role_level: roleWithPermissions?.role_level,
      role_slug: roleWithPermissions?.role_slug,
      modules_permissions:
        roleWithPermissions?.modulesPermissions?.map(
          (mp: { module_id: any; permission_id: any }) => ({
            module_id: mp.module_id,
            permission_id: mp.permission_id,
          })
        ) || [], // Ensure it defaults to an empty array if undefined
    };
    return formattedResponse;
  }

  /**
   * Retrieve role details by ID, including associated permissions.
   * @Author Aashutosh
   * @returns An array containing role details and permissions, or null if not found.
   */
  async getRoles(type: string[]) {
    console.log(type);

    const roleWithPermissions = await Role.aggregate([
      {
        $match: {
          is_deleted: false,
          role_type: { $in: type }
        }
      },
      {
        $lookup: {
          from: "user_roles",
          localField: "_id",
          foreignField: "roleId",
          as: "userRoles"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "userRoles.userId",
          foreignField: "_id",
          as: "users"
        }
      },
      {
        $addFields: {
          userCount: { $size: "$userRoles" }
        }
      },
      {
        $project: {
          userRoles: 0 // Remove userRoles array from final result
        }
      }
    ]);

    // Check if roleWithPermissions is null before accessing its properties
    if (!roleWithPermissions) {
      return null; // Return null if no role is found
    }

    return roleWithPermissions;
  }
  /**
   * Delete a role by its ID.
   * @Author Aashutosh
   * @param roleId - The ID of the role to delete.
   * @returns True if the role was deleted, false otherwise.
   */
  async deleteRoleById(roleId: string) {
    try {
      // Check if there are any associated user roles
      const associatedUserRolesCount = await UserRole.countDocuments({
        roleId: new mongoose.Types.ObjectId(roleId),
      });

      if (associatedUserRolesCount > 0) {
        throw new Error("Cannot delete role since there are associated users");
      }
      // Delete associated user roles first
      await UserRole.deleteMany({ roleId: new mongoose.Types.ObjectId(roleId) });
      // Delete the role with the given ID
      const deletedRole = await Role.findByIdAndDelete(roleId);

      // Return true if a role was deleted, false otherwise
      return !!deletedRole; // Returns true if at least one role was deleted
    } catch (error: any) {
      console.error("Error deleting role:", error);
      throw new Error(error.message || "Failed to delete role"); // You may want to handle the error more gracefully
    }
  }

  async assignRoleToUser(
    userIds: string[],
    roleId: string,
    created_by: string
  ) {
    // Check if users exist
    const users = await User.find({
      _id: { $in: userIds.map(id => new mongoose.Types.ObjectId(id)) },
    });
    if (users.length !== userIds.length) {
      throw new Error("One or more users not found");
    }

    // Check if role exists
    const role = await Role.findById(roleId);
    if (!role) {
      throw new Error("Role not found");
    }

    // Assign role to user
    const userRoles = await UserRole.insertMany(
      userIds.map((userId) => ({
        userId: new mongoose.Types.ObjectId(userId),
        roleId: new mongoose.Types.ObjectId(roleId),
        created_by: new mongoose.Types.ObjectId(created_by),
      }))
    );

    // for (let i = 0; i < userIds.length; i++) {
    //   if (!users[i].user_role) {
    //     await authService.updateDefaultRole(parseInt(userIds[i]), parseInt(roleId));
    //   }
    // }
    return userRoles;
  }

  async assignMultipleroleToUser(
    userId: string,
    roleIds: string[],
    created_by: string
  ) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const existingRole = await UserRole.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });
    if (existingRole) {
      throw new Error("User already assigned to a role");
    }
    const userRoles = await UserRole.insertMany(
      roleIds.map((roleId) => ({
        userId: new mongoose.Types.ObjectId(userId),
        roleId: new mongoose.Types.ObjectId(roleId),
        created_by: new mongoose.Types.ObjectId(created_by),
      }))
    );
    return userRoles;
  }

  async fetchRolesByUserId(userId: string) {
    // Fetch user roles using Mongoose
    const userWithRoles = await User.findOne({
      _id: new mongoose.Types.ObjectId(userId),
      is_deleted: false,
    })
      .select('-password -otp -otpExpiresAt')
      .populate({
        path: 'userRoles',
        populate: {
          path: 'roleId',
          model: 'Role',
          populate: {
            path: 'modulesPermissions',
            model: 'RoleModulePermission',
            select: 'module_id permission_id'
          }
        }
      })
      .populate('country_id', 'name iso nicename phonecode');

    //console.log(JSON.stringify(userWithRoles, null, 2));
    return userWithRoles;
  }

  async fetchRolesByUserPhoneNo(phoneNumber: string) {
    // Fetch user roles using Mongoose
    const user = await User.findOne({
      phoneNumber: String(phoneNumber),
      is_deleted: false,
    })
      .select('-password')
      .populate({
        path: 'userRoles',
        populate: {
          path: 'roleId',
          model: 'Role'
        }
      })
      .populate('country_id', 'name iso nicename phonecode');

    //console.log(JSON.stringify(userWithRoles, null, 2));
    return user;
  }

  async fetchRolesByUser(name: string) {
    // Fetch user roles using Mongoose
    const user = await User.findOne({
      name,
      is_deleted: false,
    })
      .populate({
        path: 'userRoles',
        populate: {
          path: 'roleId',
          model: 'Role',
          populate: {
            path: 'modulesPermissions',
            model: 'RoleModulePermission',
            select: 'module_id permission_id'
          }
        }
      })
      .populate('country_id', 'name iso nicename phonecode');

    //console.log(JSON.stringify(userWithRoles, null, 2));
    return user;
  }

  async fetchRolesByEmail(email: string) {
    // Fetch user roles using Mongoose
    const user = await User.findOne({
      email,
      is_deleted: false,
    })
      .populate({
        path: 'userRoles',
        populate: {
          path: 'roleId',
          model: 'Role',
          populate: {
            path: 'modulesPermissions',
            model: 'RoleModulePermission',
            select: 'module_id permission_id'
          }
        }
      });

    //console.log(JSON.stringify(userWithRoles, null, 2));
    return user;
  }
  async getAllModules() {
    // This function needs to be implemented based on your module structure
    return [];
  }
  async getAllPermissions() {
    const permission = await Permission.find({}, 'name slug');
    return permission;
  }

  async getAllRolesWithUsers() {
    try {
      const roles = await Role.aggregate([
        {
          $match: {
            role_type: "staff",
            is_deleted: false
          }
        },
        {
          $lookup: {
            from: "user_roles",
            localField: "_id",
            foreignField: "roleId",
            as: "userRoles"
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "userRoles.userId",
            foreignField: "_id",
            as: "users",
            pipeline: [
              {
                $match: {
                  is_deleted: false
                }
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  email: 1,
                  phoneNumber: 1,
                  profile_image_url: 1
                }
              }
            ]
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            color: 1,
            role_type: 1,
            role_level: 1,
            role_slug: 1,
            parent_id: 1,
            userRoles: 1,
            users: 1
          }
        }
      ]);

      return roles;
    } catch (error: any) {
      console.error("Error fetching roles with users:", error.message);
      throw error;
    }
  }

  async getRolesWithUsers(roll_id: string) {
    try {
      const roles = await Role.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(roll_id),
            is_deleted: false
          }
        },
        {
          $lookup: {
            from: "user_roles",
            localField: "_id",
            foreignField: "roleId",
            as: "userRoles"
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "userRoles.userId",
            foreignField: "_id",
            as: "users",
            pipeline: [
              {
                $match: {
                  is_deleted: false
                }
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  email: 1,
                  phoneNumber: 1,
                  profile_image_url: 1
                }
              }
            ]
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            color: 1,
            role_type: 1,
            role_level: 1,
            role_slug: 1,
            parent_id: 1,
            userRoles: 1,
            users: 1
          }
        }
      ]);

      return roles;
    } catch (error: any) {
      console.error("Error fetching roles with users:", error.message);
      throw error;
    }
  }

  async updateRoleAssignment(
    ids: string[],
    roleIds: string[],
    userId: string,
    updatedBy: string = "1"
  ) {
    try {
      await UserRole.deleteMany({
        roleId: { $in: ids.map(id => new mongoose.Types.ObjectId(id)) },
        userId: new mongoose.Types.ObjectId(userId)
      });

      for (const roleId of roleIds) {
        await UserRole.create({
          roleId: new mongoose.Types.ObjectId(roleId),
          userId: new mongoose.Types.ObjectId(userId),
          created_by: new mongoose.Types.ObjectId(updatedBy),
        });
      }

      await User.findByIdAndUpdate(userId, { user_role: parseInt(roleIds[0]) });
      return { message: "Role assignment updated successfully" };
    } catch (error: any) {
      console.error("Error updating role assignment:", error.message);
      throw error;
    }
  }

  async getUserRolePermissions(userId: any, type: any) {
    const user = await User.findOne({
      _id: new mongoose.Types.ObjectId(userId),
      is_deleted: false,
    })
      .select('-user_type -password -otp -otpExpiresAt -is_deleted')
      .populate({
        path: 'userRoles',
        populate: {
          path: 'roleId',
          model: 'Role',
          select: '_id name description color role_type role_level role_slug parent_id',
          populate: {
            path: 'modulesPermissions',
            model: 'RoleModulePermission',
            populate: [
              {
                path: 'permission_id',
                model: 'Permission',
                select: '_id name slug'
              }
            ]
          }
        }
      });

    if (!user) {
      throw new Error("User not found");
    }

    const transFormedData = user.toObject();
    const userRolesData = transFormedData?.userRoles || [];

    const userRoles = userRolesData.map((userRole: any) => {
      const { _id, roleId } = userRole;
      const role = roleId;

      // Group permissions by moduleName
      const groupedModulesPermissions = role.modulesPermissions?.reduce(
        (acc: any, permission: any) => {
          const moduleName = permission.module_id?.toString() || 'unknown';
          const permissionName = permission.permission_id?.slug || 'unknown';

          if (!acc[moduleName]) {
            acc[moduleName] = [];
          }
          acc[moduleName].push(permissionName);

          return acc;
        },
        {}
      ) || {};

      // Convert groupedModulesPermissions to an array of objects
      const modulesPermissions = Object.entries(groupedModulesPermissions).map(
        ([moduleName, permissions]) => ({
          moduleName,
          permissions,
        })
      );

      return {
        _id,
        role: {
          _id: role._id,
          name: role.name,
          description: role.description,
          color: role.color,
          slug: role.role_slug,
          modulesPermissions,
        },
      };
    });

    return { ...transFormedData, userRoles };
  }

  async getRolePermissionsByRoleId(roleId: string) {
    try {
      const modulePathPermissions = await this.getAllModulesPaths();

      const role = await Role.findById(roleId)
        .select('_id name description color role_type role_level role_slug parent_id')
        .populate({
          path: 'modulesPermissions',
          model: 'RoleModulePermission',
          populate: [
            {
              path: 'permission_id',
              model: 'Permission',
              select: '_id name slug'
            }
          ]
        });

      if (!role) {
        throw new Error("Role With Permissions Not Found");
      }

      const pathPermissions = this.generatePermissionMap(
        modulePathPermissions,
        role.modulesPermissions
      );

      return {
        _id: role._id,
        name: role.name,
        description: role.description,
        color: role.color,
        slug: role.role_slug,
        pathPermissions,
      };
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      throw error;
    }
  }

  async getAllModulesPaths() {
    try {
      // Since ModulePathMap and Module models are not defined in the current Mongoose setup,
      // we'll return an empty array for now. This should be implemented based on your module structure.
      // You may need to create these models or adjust this method based on your requirements.
      return [];
    } catch (error: any) {
      console.error("Error fetching modules:", error.message);
      throw error;
    }
  }

  generatePermissionMap(modulePaths: any, userPermissions: any) {
    const permissionMap: any = {};

    // Step 1: Create a quick lookup for user permissions by module and permission ID
    const permissionLookup = new Set(
      userPermissions.map((p: any) => `${p.module_id}-${p.permission_id}`)
    );

    // Step 2: Iterate through the module paths and structure them
    for (const item of modulePaths) {
      const moduleId = item.module_id;
      const modulePathObj = item.ModulePaths?.[0];

      if (!modulePathObj) continue;

      const moduleSlug = item?.Modules[0]?.slug; // e.g. "dashboard_add" => "dashboard"
      const permissionSlug = modulePathObj.Permissions?.[0]?.slug; // e.g. "add", "edit", etc.
      const permissionId = modulePathObj.permission_id;

      if (!permissionSlug) continue;

      const accessKey = `${moduleId}-${permissionId}`;
      const isAccess = permissionLookup.has(accessKey);

      // Initialize the structure
      if (!permissionMap[moduleSlug]) {
        permissionMap[moduleSlug] = {
          moduleName: moduleSlug,
          permission: [{}],
        };
      }

      // Set permission data
      permissionMap[moduleSlug].permission[0][permissionSlug] = {
        url: modulePathObj.path,
        isAccess,
        disableBtn: modulePathObj.disable_btn || false,
      };
    }

    // Return the values as an array
    return Object.values(permissionMap);
  }
}
export default new RoleService();
