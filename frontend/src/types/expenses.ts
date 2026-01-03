import { BaseEntity } from ".";
import { Branch } from "./branch";
import { User } from "./user";

export interface ExpenseCategory extends BaseEntity {
  name: string;
  description: string;
  is_active: boolean;
}

export interface Expense extends BaseEntity {
  title: string;
  description: string;
  amount: string;
  category: ExpenseCategory;
  category_id: number;
  receipt_url: string | null;
  branch: Branch | null;
  branch_id?: number | null;
  payment_method?: string;
  account_code?: string;
  created_by: User;
}

export interface CreateExpensePayload {
  title: string;
  description?: string;
  amount: number;
  category_id: number;
  receipt_url?: string;
  branch_id?: number;
  payment_method?: string;
  account_code?: string;
}

export interface UpdateExpensePayload extends Partial<CreateExpensePayload> {
  id: number;
}
