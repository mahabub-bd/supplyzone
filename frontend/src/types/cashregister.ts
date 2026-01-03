import {
  BaseEntity,
  PaginationParams,
  PaymentMethod,
  TransactionType,
} from ".";
import { Branch } from "./branch";
import { User } from "./user";

export type CashRegisterStatus =
  | "active"
  | "inactive"
  | "closed"
  | "open"
  | "maintenance";

export interface CashRegister extends BaseEntity {
  register_code?: string;
  name: string;
  description?: string;
  status: CashRegisterStatus;
  branch_id?: number;
  branch?: Branch;
  opening_balance: string;
  current_balance: string;
  expected_amount?: string | null;
  actual_amount?: string | null;
  variance?: string | null;
  opened_by?: User | null;
  closed_by?: User | null;
  opened_at?: string | null;
  closed_at?: string | null;
  notes?: string | null;
}

export interface CashRegisterTransaction extends BaseEntity {
  cash_register: CashRegister;
  transaction_type: TransactionType;
  amount: string;
  payment_method: PaymentMethod;
  sale?: {
    id: number;
    invoice_no: string;
  } | null;
  user: User;
  description?: string;
  running_balance: string;
  reference_no?: string | null;
}

export interface CreateCashRegisterPayload {
  code: string;
  name: string;
  description?: string;
  branch_id: number;
  status?: "active" | "inactive";
}

export interface OpenCashRegisterPayload {
  cash_register_id: number;
  opening_balance: number;
  notes?: string;
}

export interface CloseCashRegisterPayload {
  cash_register_id: number;
  actual_amount: number;
  notes?: string;
}

export interface CashInPayload {
  amount: number;
  description?: string;
  payment_method?: PaymentMethod;
  notes?: string;
}

export interface CashOutPayload {
  amount: number;
  description?: string;
  payment_method?: PaymentMethod;
  notes?: string;
}

export interface AdjustBalancePayload {
  amount: number;
  description: string;
  adjustment_type: "increase" | "decrease";
  notes?: string;
}

export interface VarianceReport {
  cash_register_id: number;
  cash_register: CashRegister;
  opening_balance: number;
  total_sales: number;
  total_cash_in: number;
  total_cash_out: number;
  expected_balance: number;
  counted_balance: number;
  variance: number | null;
  variance_percentage: number;
  cash_in: {
    sales: number;
    cash_in: number;
    adjustments: number;
  };
  cash_out: {
    refunds: number;
    cash_out: number;
    adjustments: number;
  };
  transactions_summary: {
    sales_count: number;
    cash_in_count: number;
    cash_out_count: number;
    total_transactions: number;
  };
  payment_breakdown: {
    cash: number;
    card: number;
    mobile: number;
    other: number;
  };
  opened_at: string;
  closed_at: string;
  duration_minutes: number;
  notes?: string;
}

export interface GetCashRegistersParams extends PaginationParams {
  branch_id?: number;
  status?: CashRegisterStatus;
  search?: string;
}

export interface GetTransactionsParams extends PaginationParams {
  cash_register_id?: number;
  transaction_type?: TransactionType;
  start_date?: string;
  end_date?: string;
}
