import { BaseEntity } from "./index";

export interface Permission extends BaseEntity {
  key: string;
  description: string;
}

export interface Role extends BaseEntity {
  name: string;
  description: string;
  permissions?: Permission[];
}

/**
 * Simplified role interface for nested objects
 * Used when full Role entity is not needed
 */
export interface RoleBasic {
  id: number;
  name: string;
  description: string;
}
