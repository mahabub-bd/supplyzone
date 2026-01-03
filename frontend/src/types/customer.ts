import { Address, BaseEntity } from ".";
import { Account } from "./accounts";
import { Sale } from "./sales";

export interface Customer extends BaseEntity {
  name: string;
  customer_code: string;
  email: string;
  phone: string;
  billing_address?: Address;
  shipping_address?: Address;
  status: boolean;
  account: Account;
  account_id: number;
  group_id?: number;
  group?: CustomerGroup;
  reward_points?: number;
  sales: Sale[];
}

export interface CustomerBasic {
  id: number;
  customer_code: string;
  name: string;
  phone: string;
  email: string;
  billing_address?: Address;
  shipping_address?: Address;
  status: boolean;
  reward_points: string;
  account_id: number;
  group_id: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerGroup {
  id: number;
  name: string;
  description?: string;
  discount_percentage?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateCustomerPayload {
  id: string | number;
  body: Partial<Customer>;
}

// Query Params with Search & Pagination
export interface CustomerQueryParams {
  search?: string;
  page?: number;
  limit?: number;
}
