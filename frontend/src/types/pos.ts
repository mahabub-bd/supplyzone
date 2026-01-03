import { RoleBasic } from "./role";

export interface PosSaleItem {
  id: number;
  product: {
    id: number;
    name: string;
    sku: string;
    barcode: string;
    description: string;
    selling_price: string;
    purchase_price: string;
    discount_price: string;
    status: boolean;
    created_at: string;
    updated_at: string;
  };
  quantity: number;
  warehouse_id: number;
  unit_price: string;
  discount: string;
  tax: string;
  line_total: string;
}

export interface PosSalePayment {
  id: number;
  method: string;
  amount: string;
  account_code: string;
  reference: string | null;
  created_at: string;
}

export interface PosSaleCustomer {
  id: number;
  customer_code: string;
  name: string;
  phone: string;
  email: string;
  status: boolean;
  reward_points: string;
  account_id: number;
  group_id: number;
  created_at: string;
  updated_at: string;
}

export interface PosSaleUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  roles: RoleBasic[];
  status: string;
  last_login_at: string;
  created_at: string;
  updated_at: string;
}

export interface PosSaleBranch {
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

export interface PosSale {
  id: number;
  invoice_no: string;
  items: PosSaleItem[];
  subtotal: string;
  discount: string;
  manual_discount: string;
  group_discount: string;
  tax: string;
  total: string;
  paid_amount: string;
  payments: PosSalePayment[];
  customer: PosSaleCustomer;
  created_by: PosSaleUser;
  branch: PosSaleBranch;
  status: "completed" | "held" | "refunded" | "partial_refund" | "draft" | "pending" | "cancelled";
  sale_type: string;
  served_by: PosSaleUser;
  created_at: string;
  updated_at: string;
}

export interface PosSalesResponse {
  statusCode: number;
  message: string;
  data: PosSale[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PosSalesListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  date?: string;
  branch_id?: number;
}
