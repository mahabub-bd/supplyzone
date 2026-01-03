import { BaseEntity } from ".";
import { Branch } from "./branch";
import { Role, RoleBasic } from "./role";

export interface User extends BaseEntity {
  username: string;
  email: string;
  full_name: string;
  phone: string;
  roles: Role[];
  branches?: Branch[];
  status: string;
  last_login_at: string | null;
  avatar?: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Simplified user types used in nested objects
export interface UserBasic {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  status: string;
  last_login_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserWithRoles extends UserBasic {
  roles: RoleBasic[];
}

export interface CreateUserPayload {
  username: string;
  email: string;
  full_name: string;
  phone: string;
  password: string;
  roles: string[];
  branch_ids?: number[];
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  full_name?: string;
  phone?: string;
  password?: string;
  roles?: string[];
  branch_ids?: number[];
}

export interface UpdateUserPayload {
  id: number | string;
  body: UpdateUserDto;
}
