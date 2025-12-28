import { Optional } from "sequelize";

// // Extend RoleData to include optional timestamps
// export interface RoleData {
//     name: string;
//     description?: string;
//     is_active?: boolean;
//     is_deleted?: boolean;
// }

// export interface ModulePermission {
//     moduleId: number;
//     permissionIds: number[];
// }

export interface RoleData {
  name: string; // role_name
  parent_id?: number;
  description?: string; // role_description
  is_active?: boolean; // is_active
  is_deleted?: boolean; // is_deleted
  color?: string;
  role_type?: string;
  role_level?: string;
  role_slug?: string;
  parent_id?: number;
}
// // Define a new interface for Role creation
export interface RoleCreationAttributes
  extends Optional<RoleData, "is_active" | "is_deleted" | "role_slug"> {}

export interface ModulePermission {
  module_id: number; // Corresponds to module_id in the request
  permission_id: number; // Corresponds to permission_id in the request
}

export interface RoleModulePermissionn {
  module_id: number;
  permission_id: number;
}

export interface RoleDetails {
  role_name: string;
  role_description: string;
  color: string;
  modules_permissions: RoleModulePermissionn[];
}

export interface RoleResponse {
  data: {
    roles: RoleDetails;
  };
}
