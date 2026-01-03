import { Branch } from "./branch";
import { BaseEntity, PaginationParams, SoftDeletable } from "./index";
import { User, UserBasic } from "./user";

// ============================================================================
// HRM - DEPARTMENT
// ============================================================================

export enum EmployeeStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  TERMINATED = "terminated",
  ON_LEAVE = "on_leave",
}

export interface Department extends BaseEntity, SoftDeletable {
  name: string;
  description?: string;
  status: EmployeeStatus;
  code: string;
  manager_name?: string;
  manager_email?: string;
  notes?: string;
  employees?: Employee[];
}

export interface DepartmentBasic extends SoftDeletable {
  id: number;
  name: string;
  description: string;
  status: string;
  code: string;
  manager_name: string;
  manager_email: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDepartmentPayload {
  name: string;
  description?: string;
  status?: "active" | "inactive";
  code: string;
  manager_name?: string;
  manager_email?: string;
  notes?: string;
}

export interface UpdateDepartmentPayload extends Partial<CreateDepartmentPayload> {
  id: number;
}

export interface DepartmentEmployeeCount {
  department_id?: number;
  department_name?: string;
  total_employees: number;
  active_employees: number;
  inactive_employees: number;
}

// ============================================================================
// HRM - DESIGNATION
// ============================================================================

export type DesignationLevel =
  | "junior_officer"
  | "officer"
  | "senior_officer"
  | "manager"
  | "senior_manager"
  | "director"
  | string;

export interface Designation extends SoftDeletable {
  id: number;
  title: string;
  code: string;
  level: DesignationLevel;
  description?: string;
  minSalary: string;
  maxSalary: string;
  autoApproveLeaveDays: number;
  canApproveLeave: boolean;
  canApprovePayroll: boolean;
  parentDesignation?: Designation | null;
  parentDesignationId?: number | null;
  childDesignations?: Designation[];
  employees?: Employee[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface DesignationBasic extends SoftDeletable {
  id: number;
  title: string;
  code: string;
  level: string;
  description: string;
  minSalary: string;
  maxSalary: string;
  autoApproveLeaveDays: number;
  canApproveLeave: boolean;
  canApprovePayroll: boolean;
  parentDesignationId?: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDesignationPayload {
  title: string;
  code: string;
  level: string;
  description?: string;
  minSalary: number;
  maxSalary: number;
  autoApproveLeaveDays?: number;
  canApproveLeave?: boolean;
  canApprovePayroll?: boolean;
  parentDesignationId?: number | null;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateDesignationPayload extends Partial<CreateDesignationPayload> {
  id: number;
}

export interface DesignationHierarchy {
  id: number;
  title: string;
  code: string;
  level: string;
  children?: DesignationHierarchy[];
}

export interface AssignEmployeeToDesignationPayload {
  employee_id: number;
  designation_id: number;
}

// ============================================================================
// HRM - EMPLOYEE
// ============================================================================

export enum EmployeeType {
  FULL_TIME = "full_time",
  PART_TIME = "part_time",
  CONTRACT = "contract",
  INTERN = "intern",
}

export interface Employee extends BaseEntity {
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  hire_date: string;
  termination_date?: string | null;
  status: EmployeeStatus;
  employee_type: EmployeeType;
  department?: Department;
  departmentId: number;
  base_salary: string;
  branch?: Branch;
  user: User;
  userId: number;
  designation?: Designation;
  designationId: number;
  reportingManagerId?: number | null;
  __reportingManager__?: Employee;
  __subordinates__?: Employee[];
  notes?: string;
}

export interface EmployeeBasic {
  id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  hire_date: string;
  termination_date?: string | null;
  status: string;
  employee_type: string;
  department?: DepartmentBasic;
  departmentId: number;
  base_salary: string;
  user?: UserBasic;
  userId: number;
  designation?: DesignationBasic;
  designationId: number;
  reportingManagerId?: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateEmployeePayload {
  employee_code?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  hire_date: string;
  status?: EmployeeStatus;
  employee_type?: EmployeeType;
  designationId: number;
  departmentId: number;
  base_salary: number;
  branch_id: number;
  userId?: number;
  notes?: string;
  reportingManagerId?: number;
}

export interface UpdateEmployeePayload extends Partial<CreateEmployeePayload> {
  id: number;
  termination_date?: string | null;
}

export interface GetEmployeesParams extends PaginationParams {
  search?: string;
  status?: "active" | "inactive" | "terminated";
  department_id?: number;
  designation_id?: number;
  branch_id?: number;
}
