import { Address, BaseEntity, PaginationParams } from ".";
import { Account } from "./accounts";
import { Product } from "./product";
import { Purchase } from "./purchase";

export interface Supplier extends BaseEntity {
  name: string;
  supplier_code: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  billing_address?: Address;
  shipping_address?: Address;
  address?: string;
  payment_terms?: string;
  status: boolean;
  totalPurchased: number;
  account: Account;
  purchase_history: Purchase[];
  products: Product[];
}

export interface SupplierBasic {
  id: number;
  supplier_code: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSupplierPayload {
  name: string;
  supplier_code?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  billing_address?: Address;
  shipping_address?: Address;
  address?: string;
  payment_terms?: string;
  status?: boolean;
}

export interface UpdateSupplierPayload {
  id: string | number;
  body: Partial<CreateSupplierPayload>;
}

export interface GetSuppliersParams extends PaginationParams {
  search?: string;
  status?: boolean;
}
