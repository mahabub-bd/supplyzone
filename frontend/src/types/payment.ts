import { BaseEntity } from ".";
import { Customer } from "./customer";
import { Purchase } from "./purchase";
import { Sale } from "./sales";
import { Supplier } from "./supplier";

export interface Payment extends BaseEntity {
  type: "supplier" | "customer";
  supplier?: Supplier;
  customer?: Customer;
  purchase?: Purchase;
  sale?: Sale;
  amount: number;
  method: "cash" | "bank" | "mobile";
  payment_account_code?: string;
  note?: string;
}

export interface GetPaymentsParams {
  page?: number;
  limit?: number;
  type?: "supplier" | "customer";
  method?: "cash" | "bank" | "mobile";
}



export interface CreatePaymentPayload {
  type: "supplier" | "customer";
  supplier_id?: number;
  customer_id?: number;
  purchase_id?: number;
  sale_id?: number;
  amount: number;
  payment_account_code: string;
  method: "cash" | "bank" | "mobile";
  note?: string;
}
