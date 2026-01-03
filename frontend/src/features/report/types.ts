import { DateRangeParams } from "../../types";

export type ReportType =
  | "sales"
  | "sales_daily"
  | "purchase"
  | "inventory"
  | "inventory_stock"
  | "profit_loss"
  | "stock"
  | "products"
  | "employees"
  | "expense"
  | "summary"
  | "customers"
  | "attendance";

export type ReportStatus = "pending" | "processing" | "completed" | "failed";

export type ReportPeriod = "daily" | "weekly" | "monthly" | "yearly" | "custom";

export interface Report {
  id: number;
  type: ReportType;
  title: string;
  description?: string;
  status: ReportStatus;
  format?: string;
  file_path?: string;
  file_url?: string;
  generated_by?: number;
  generated_at?: string;
  branch_id?: number;
  branch?: {
    id: number;
    code: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    is_active: boolean;
  };
  created_by?: number;
  created_by_user?: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    phone: string;
    status: string;
  };
  parameters?: Record<string, any>;
  data?: Record<string, any>;
  total_records?: number | null;
  error_message?: string | null;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface GenerateSalesReportPayload extends DateRangeParams {
  period?: ReportPeriod;
  branch_id?: number;
  customer_id?: number;
  payment_method?: string;
}

export interface GeneratePurchaseReportPayload extends DateRangeParams {
  branch_id?: number;
  supplier_id?: number;
  warehouse_id?: number;
}

export interface GenerateInventoryReportPayload {
  warehouse_id?: number;
  branch_id?: number;
  product_id?: number;
  low_stock_only?: boolean;
}

export interface GenerateProfitLossPayload extends DateRangeParams {
  branch_id?: number;
}

export interface GenerateExpenseReportPayload extends DateRangeParams {
  branch_id?: number;
  category_id?: number;
  payment_method?: string;
}

export interface GenerateAttendanceReportPayload extends DateRangeParams {
  branch_id?: number;
  employee_id?: number;
  department_id?: number;
}

export interface ReportFilterParams {
  type?: ReportType;
  status?: ReportStatus;
  branch_id?: number;
  page?: number;
  limit?: number;
}

export interface CreateReportPayload {
  type: ReportType;
  title: string;
  description?: string;
  parameters?: Record<string, any>;
  branch_id?: number;
}

export interface UpdateReportPayload {
  id: string | number;
  body: {
    title?: string;
    description?: string;
    status?: ReportStatus;
  };
}

export interface ReportDashboardSummary {
  total_reports: number;
  pending_reports: number;
  completed_reports: number;
  failed_reports: number;
  recent_reports: Report[];
  reports_by_type: {
    sales: number;
    purchase: number;
    inventory: number;
    profit_loss: number;
    expense: number;
    attendance: number;
  };
}

export interface ReportTypeInfo {
  type: ReportType;
  name: string;
  description: string;
  available: boolean;
}
