import { BaseEntity } from ".";

export interface Warehouse extends BaseEntity {
  name: string;
  location?: string;
  address?: string;
  status?: boolean;
}

export interface Branch extends BaseEntity {
  code: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  is_active: boolean;
  default_warehouse_id: number | null;
  default_warehouse: Warehouse;
}

// Simplified branch type used in nested objects
export interface BranchBasic {
  id: number;
  code: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateBranchPayload {
  id: string | number;
  body: Partial<Branch>;
}
