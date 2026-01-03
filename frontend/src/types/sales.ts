import { BaseEntity, ListResponse, PaginationParams } from ".";
import { JournalTransaction } from "./accounts";
import { BranchBasic } from "./branch";
import { Customer, CustomerBasic } from "./customer";
import { Product } from "./product";
import { User, UserWithRoles } from "./user";

// ============================================================================
// ENUMS & TYPES
// ============================================================================

export type SaleStatus =
  | "held"
  | "completed"
  | "refunded"
  | "partial_refund"
  | "draft"
  | "pending"
  | "cancelled";

// ============================================================================
// API QUERY PARAMETERS
// ============================================================================

/**
 * Query parameters for getting sales list
 */
export interface GetSalesParams extends PaginationParams {
  search?: string;
  status?: SaleStatus;
  saleType?: string;
  customer_id?: number;
  branch_id?: number;
  start_date?: string;
  end_date?: string;
  fromDate?: string;
  toDate?: string;
}

/**
 * Payload for creating a new sale
 */
export interface CreateSalePayload {
  customer_id?: number;
  items: Array<{
    product_id: number;
    quantity: number;
    unit_price: string | number;
    discount?: string | number;
    tax?: string | number;
    warehouse_id?: number;
  }>;
  payments?: Array<{
    method: string;
    amount: string | number;
    account_code: string;
    reference?: string;
  }>;
  discount?: string | number;
  tax?: string | number;
  status?: SaleStatus;
  sale_type?: string;
  notes?: string;
}

// ============================================================================
// ENTITIES
// ============================================================================
export interface SaleItem {
  id: number;
  product: Product;
  quantity: number;
  warehouse_id?: number;
  unit_price: string;
  discount: string;
  tax: string;
  line_total: string;
}

export interface SalePayment {
  id?: number;
  method: string;
  amount: string;
  account_code: string;
  reference?: string;
  created_at: string;
}

export interface Sale extends BaseEntity {
  invoice_no: string;
  items: SaleItem[];
  subtotal: string;
  discount: string;
  tax: string;
  total: string;
  paid_amount: string;
  payments: SalePayment[];
  status: SaleStatus;
  sale_type: string;
  served_by: User;
  customer: Customer;
}

export interface SaleData {
  invoice_no: string;
  items: SaleItem[];
  subtotal: string;
  discount: string;
  manual_discount: string;
  group_discount: string;
  tax: string;
  total: string;
  paid_amount: string;
  payments: SalePayment[];
  customer: CustomerBasic;
  created_by: UserWithRoles;
  branch: BranchBasic;
  served_by: UserWithRoles;
  created_at: string;
  updated_at: string;
}

export interface SaleResponse extends BaseEntity {
  invoice_no: string;
  items: SaleItem[];
  subtotal: string;
  discount: string;
  manual_discount: string;
  group_discount: string;
  tax: string;
  total: string;
  paid_amount: string;
  payments: SalePayment[];
  customer: CustomerBasic;
  created_by: UserWithRoles;
  branch: BranchBasic;
  served_by: UserWithRoles;
  status: string;
  sale_type: string;
}

export type SaleListResponse = ListResponse<SaleResponse>;

export interface SaleDetail {
  sale_id: number;
  invoice_no: string;
  total: number;
  created_at: string;
  customer?: { id: number; name: string; phone: string };
  served_by?: { id: number; full_name: string };
  transactions: JournalTransaction[];
}

export interface SaleTransactionsResponse {
  statusCode: number;
  message: string;
  data: SaleDetail[];
}
