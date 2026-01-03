// Base interfaces
export interface DateRange {
  from: string;
  to: string;
}

export interface ReportMeta {
  dateRange: DateRange;
}

export interface BaseReportData<TSummary, TDetails = unknown> {
  summary: TSummary;
  meta: ReportMeta;
  details?: TDetails[];
}

export interface GrowthMetric {
  value: number;
  percentage: number;
}

export interface ComparisonPeriod {
  revenue: number;
  orders: number;
}

export interface Comparison {
  current: ComparisonPeriod;
  previous: ComparisonPeriod;
  growth: {
    revenue: GrowthMetric;
    orders: GrowthMetric;
  };
}

// Common summary fields
export interface BaseSummaryFields {
  totalDiscount: number;
  totalTax: number;
}

// Sales Report
export interface SalesSummary extends BaseSummaryFields {
  totalOrders: number;
  totalItemsSold: number;
  totalRevenue: number;
  averageOrderValue: number;
  netRevenue: number;
}

export interface SalesDetail {
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  saleId: number;
  invoiceNo: string;
  saleDate: string;
  productName: string;
  customerName: string;
}

export interface SalesReportData
  extends BaseReportData<SalesSummary, SalesDetail> {
  details: SalesDetail[];
  comparison?: Comparison;
}

// Purchase Report
export interface PurchaseSummary extends BaseSummaryFields {
  totalOrders: number;
  totalItems: number;
  totalValue: number;
  netValue: number;
}

export interface PurchaseDetail {
  quantity: number;
  totalValue: string;
  poNumber: string;
  status: string;
  orderDate: string;
  supplierName: string;
  warehouseName: string;
}

export interface PurchaseReportData
  extends BaseReportData<PurchaseSummary, PurchaseDetail> {
  details: PurchaseDetail[];
}

// Profit & Loss Report
export interface ProfitLossSummary extends BaseSummaryFields {
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossProfitMargin: number;
  totalExpenses: number;
  operatingProfit: number;
  netProfit: number;
  purchases: number;
}

export interface ProfitLossReportData
  extends BaseReportData<ProfitLossSummary> {
  details?: never;
}

// ============================================================================
// EMPLOYEE REPORT
// ============================================================================

export interface EmployeeSummary {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  terminatedEmployees: number;
  onLeaveEmployees: number;
  totalPayroll: number;
  averageSalary: number;
}

export interface EmployeeDetail {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  status: string;
  employeeType: string;
  baseSalary: number;
  hireDate: string;
  terminationDate?: string;
}

export interface EmployeeReportData
  extends BaseReportData<EmployeeSummary, EmployeeDetail> {
  details: EmployeeDetail[];
  departmentBreakdown?: Array<{
    departmentName: string;
    employeeCount: number;
    totalSalary: number;
  }>;
  designationBreakdown?: Array<{
    designationTitle: string;
    employeeCount: number;
    averageSalary: number;
  }>;
}

// ============================================================================
// ATTENDANCE REPORT
// ============================================================================

export interface AttendanceReportSummary {
  totalRecords: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  halfDayCount: number;
  leaveCount: number;
  totalRegularHours: number;
  totalOvertimeHours: number;
  attendanceRate: number;
}

export interface AttendanceReportDetail {
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  regularHours: number;
  overtimeHours: number;
  status: string;
  notes?: string;
}

export interface AttendanceReportData
  extends BaseReportData<AttendanceReportSummary, AttendanceReportDetail> {
  details: AttendanceReportDetail[];
}

// ============================================================================
// PAYROLL REPORT
// ============================================================================

export interface PayrollSummary {
  totalEmployees: number;
  totalBasicSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  totalOvertime: number;
  totalNetSalary: number;
  averageNetSalary: number;
  pendingPayments: number;
  completedPayments: number;
}

export interface PayrollDetail {
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  department: string;
  basicSalary: number;
  allowance: number;
  deduction: number;
  overtime: number;
  netSalary: number;
  payDate: string | null;
  status: string;
}

export interface PayrollReportData
  extends BaseReportData<PayrollSummary, PayrollDetail> {
  details: PayrollDetail[];
}

// ============================================================================
// REPORT QUERY PARAMS
// ============================================================================

export interface ReportQueryParams {
  start_date: string;
  end_date: string;
  branch_id?: number;
  department_id?: number;
  employee_id?: number;
}
