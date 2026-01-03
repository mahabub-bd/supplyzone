import { BaseEntity, PaymentMethod } from ".";
import { Warehouse } from "./branch";
import { Product } from "./product";
import { Purchase, PurchaseItem } from "./purchase";
import { Supplier } from "./supplier";
import { User } from "./user";

export type PurchaseReturnStatus =
  | "draft"
  | "approved"
  | "processed"
  | "cancelled";
export interface PurchaseReturnItemCreate {
  product_id: number;
  purchase_item_id: number;
  returned_quantity: number;
  price: number;
  line_total?: string;
}

export interface PurchaseReturnItem {
  id: number;
  purchase_return_id: number;
  purchase_item_id: number;
  purchase_item?: PurchaseItem;
  product_id: number;
  product?: Product;
  returned_quantity: number;
  price: string;
  line_total: string;
}

export interface CreatePurchaseReturnPayload {
  purchase_id: number;
  supplier_id: number;
  warehouse_id: number;
  reason: string;
  items: PurchaseReturnItemCreate[];
}

export interface UpdatePurchaseReturnPayload {
  return_date?: string;
  items?: PurchaseReturnItemCreate[];
  reason?: string;
  note?: string;
}

export interface ApprovePurchaseReturnPayload {
  approval_notes?: string;
}

export interface ProcessPurchaseReturnPayload {
  processing_notes?: string;
  refund_to_supplier?: boolean;
  refund_amount?: number;
  refund_payment_method?: "cash" | "bank";
  refund_reference?: string;
  debit_account_code?: string;
  refund_later?: boolean;
}

export interface RefundPurchaseReturnPayload {
  refund_amount: number;
  payment_method: PaymentMethod;
  refund_reference?: string;
  debit_account_code: string;
  refund_notes?: string;
}

export interface RefundHistory extends BaseEntity {
  type: string;
  amount: string;
  method: string;
  note?: string;
  purchase_return_id: number;
  debit_account_code: string;
  credit_account_code: string;
}

export interface PurchaseReturn extends BaseEntity {
  return_no: string;
  purchase_id: number;
  purchase?: Purchase;
  supplier_id: number;
  supplier?: Supplier;
  warehouse_id: number;
  warehouse?: Warehouse;
  items: PurchaseReturnItem[];
  total: string;
  reason: string;
  status: PurchaseReturnStatus;
  approved_at?: string;
  approved_by?: number;
  approved_user?: User;
  processed_at?: string;
  processed_by?: number;
  processed_user?: User;
  approval_notes?: string;
  processing_notes?: string;
  refund_to_supplier: boolean;
  refund_reference: string;
  refund_payment_method: "cash" | "bank";
  refunded_at: string;
  debit_account_code: string;
  refund_amount: string;
  refund_history?: RefundHistory[];
}
