import { BaseEntity } from "./index";

// ============================================================================
// PAYROLL
// ============================================================================

export type PayrollStatus = "pending" | "paid" | "failed";

export interface PayrollHistory extends BaseEntity {
  employee_id: number;
  month: string;
  year: number;
  basic_salary: string;
  allowance: string;
  deduction: string;
  overtime: string;
  net_salary: string;
  pay_date: string | null;
  status: PayrollStatus;
  updated_at: string;
}
