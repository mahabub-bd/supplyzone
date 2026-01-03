// src/features/report/reportApi.ts

import { ApiResponse, DateRangeParams } from "../../types";
import { apiSlice } from "../apiSlice";
import type {
  Report,
  ReportType,
  ReportStatus,
} from "./types";

// ============================================================================
// REPORT QUERY PARAMETERS
// ============================================================================

export interface SalesReportQuery {
  fromDate?: string;
  toDate?: string;
  dateRange?: string;
  branch_id?: number;
  customer_id?: number;
  product_id?: number;
  includeComparison?: boolean;
}

export interface PurchaseReportQuery extends DateRangeParams {
  dateRange?: string;
  branch_id?: number;
  supplier_id?: number;
  warehouse_id?: number;
}

export interface InventoryReportQuery {
  warehouse_id?: number;
  branch_id?: number;
  product_id?: number;
  low_stock_only?: boolean;
}

export interface StockReportQuery extends DateRangeParams {
  branch_id?: number;
  warehouse_id?: number;
  category_id?: number;
}

export interface ProductsReportQuery extends DateRangeParams {
  branch_id?: number;
  category_id?: number;
}

export interface EmployeesReportQuery extends DateRangeParams {
  branch_id?: number;
  department_id?: number;
  employee_id?: number;
}

export interface ProfitLossReportQuery extends DateRangeParams {
  dateRange?: string;
  branch_id?: number;
}

export interface ExpenseReportQuery extends DateRangeParams {
  branch_id?: number;
  category_id?: number;
  payment_method?: string;
}

export interface SummaryReportQuery extends DateRangeParams {
  branch_id?: number;
}

export interface CustomersReportQuery extends DateRangeParams {
  branch_id?: number;
  customer_id?: number;
  customer_type?: string;
}

export interface ReportFilterParams {
  type?: ReportType;
  status?: ReportStatus;
  branch_id?: number;
  page?: number;
  limit?: number;
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

export const reportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ========================================================================
    // GET REPORT ENDPOINTS (New Structure)
    // ========================================================================

    // 🔹 GET SALES REPORT
    getSalesReport: builder.query<ApiResponse<any>, SalesReportQuery>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params) {
          if (params.fromDate) searchParams.append("fromDate", params.fromDate);
          if (params.toDate) searchParams.append("toDate", params.toDate);
          if (params.dateRange) searchParams.append("dateRange", params.dateRange);
          if (params.branch_id) searchParams.append("branch_id", params.branch_id.toString());
          if (params.customer_id) searchParams.append("customer_id", params.customer_id.toString());
          if (params.product_id) searchParams.append("product_id", params.product_id.toString());
          if (params.includeComparison !== undefined) searchParams.append("includeComparison", params.includeComparison.toString());
        }
        return {
          url: `/reports/sales${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
          method: "GET",
        };
      },
      providesTags: [{ type: "Reports", id: "SALES" }],
    }),

    // 🔹 GET PURCHASE REPORT
    getPurchaseReport: builder.query<ApiResponse<Report>, PurchaseReportQuery>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params) {
          if (params.start_date) searchParams.append("start_date", params.start_date);
          if (params.end_date) searchParams.append("end_date", params.end_date);
          if (params.dateRange) searchParams.append("dateRange", params.dateRange);
          if (params.branch_id) searchParams.append("branch_id", params.branch_id.toString());
          if (params.supplier_id) searchParams.append("supplier_id", params.supplier_id.toString());
          if (params.warehouse_id) searchParams.append("warehouse_id", params.warehouse_id.toString());
        }
        return {
          url: `/reports/purchase${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
          method: "GET",
        };
      },
      providesTags: [{ type: "Reports", id: "PURCHASE" }],
    }),

    // 🔹 GET INVENTORY REPORT
    getInventoryReport: builder.query<ApiResponse<Report>, InventoryReportQuery>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params) {
          if (params.warehouse_id) searchParams.append("warehouse_id", params.warehouse_id.toString());
          if (params.branch_id) searchParams.append("branch_id", params.branch_id.toString());
          if (params.product_id) searchParams.append("product_id", params.product_id.toString());
          if (params.low_stock_only !== undefined) searchParams.append("low_stock_only", params.low_stock_only.toString());
        }
        return {
          url: `/reports/inventory${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
          method: "GET",
        };
      },
      providesTags: [{ type: "Reports", id: "INVENTORY" }],
    }),

    // 🔹 GET PROFIT & LOSS REPORT
    getProfitLossReport: builder.query<ApiResponse<Report>, ProfitLossReportQuery>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params) {
          if (params.start_date) searchParams.append("start_date", params.start_date);
          if (params.end_date) searchParams.append("end_date", params.end_date);
          if (params.dateRange) searchParams.append("dateRange", params.dateRange);
          if (params.branch_id) searchParams.append("branch_id", params.branch_id.toString());
        }
        return {
          url: `/reports/profit-loss${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
          method: "GET",
        };
      },
      providesTags: [{ type: "Reports", id: "PROFIT_LOSS" }],
    }),

    // 🔹 GET STOCK REPORT
    getStockReport: builder.query<ApiResponse<Report>, StockReportQuery>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params) {
          if (params.start_date) searchParams.append("start_date", params.start_date);
          if (params.end_date) searchParams.append("end_date", params.end_date);
          if (params.branch_id) searchParams.append("branch_id", params.branch_id.toString());
          if (params.warehouse_id) searchParams.append("warehouse_id", params.warehouse_id.toString());
          if (params.category_id) searchParams.append("category_id", params.category_id.toString());
        }
        return {
          url: `/reports/stock${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
          method: "GET",
        };
      },
      providesTags: [{ type: "Reports", id: "STOCK" }],
    }),

    // 🔹 GET PRODUCTS REPORT
    getProductsReport: builder.query<ApiResponse<Report>, ProductsReportQuery>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params) {
          if (params.start_date) searchParams.append("start_date", params.start_date);
          if (params.end_date) searchParams.append("end_date", params.end_date);
          if (params.branch_id) searchParams.append("branch_id", params.branch_id.toString());
          if (params.category_id) searchParams.append("category_id", params.category_id.toString());
        }
        return {
          url: `/reports/products${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
          method: "GET",
        };
      },
      providesTags: [{ type: "Reports", id: "PRODUCTS" }],
    }),

    // 🔹 GET EMPLOYEES REPORT
    getEmployeesReport: builder.query<ApiResponse<Report>, EmployeesReportQuery>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params) {
          if (params.start_date) searchParams.append("start_date", params.start_date);
          if (params.end_date) searchParams.append("end_date", params.end_date);
          if (params.branch_id) searchParams.append("branch_id", params.branch_id.toString());
          if (params.department_id) searchParams.append("department_id", params.department_id.toString());
          if (params.employee_id) searchParams.append("employee_id", params.employee_id.toString());
        }
        return {
          url: `/reports/employees${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
          method: "GET",
        };
      },
      providesTags: [{ type: "Reports", id: "EMPLOYEES" }],
    }),

    // 🔹 GET EXPENSE REPORT
    getExpenseReport: builder.query<ApiResponse<Report>, ExpenseReportQuery>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params) {
          if (params.start_date) searchParams.append("start_date", params.start_date);
          if (params.end_date) searchParams.append("end_date", params.end_date);
          if (params.branch_id) searchParams.append("branch_id", params.branch_id.toString());
          if (params.category_id) searchParams.append("category_id", params.category_id.toString());
          if (params.payment_method) searchParams.append("payment_method", params.payment_method);
        }
        return {
          url: `/reports/expense${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
          method: "GET",
        };
      },
      providesTags: [{ type: "Reports", id: "EXPENSE" }],
    }),

    // 🔹 GET SUMMARY REPORT
    getSummaryReport: builder.query<ApiResponse<Report>, SummaryReportQuery>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params) {
          if (params.start_date) searchParams.append("start_date", params.start_date);
          if (params.end_date) searchParams.append("end_date", params.end_date);
          if (params.branch_id) searchParams.append("branch_id", params.branch_id.toString());
        }
        return {
          url: `/reports/summary${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
          method: "GET",
        };
      },
      providesTags: [{ type: "Reports", id: "SUMMARY" }],
    }),

    // 🔹 GET CUSTOMERS REPORT
    getCustomersReport: builder.query<ApiResponse<Report>, CustomersReportQuery>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params) {
          if (params.start_date) searchParams.append("start_date", params.start_date);
          if (params.end_date) searchParams.append("end_date", params.end_date);
          if (params.branch_id) searchParams.append("branch_id", params.branch_id.toString());
          if (params.customer_id) searchParams.append("customer_id", params.customer_id.toString());
          if (params.customer_type) searchParams.append("customer_type", params.customer_type);
        }
        return {
          url: `/reports/customers${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
          method: "GET",
        };
      },
      providesTags: [{ type: "Reports", id: "CUSTOMERS" }],
    }),

    // 🔹 GET DASHBOARD SUMMARY
    getReportDashboardSummary: builder.query<
      ApiResponse<ReportDashboardSummary>,
      void
    >({
      query: () => ({
        url: "/reports/dashboard",
        method: "GET",
      }),
      providesTags: [{ type: "Reports", id: "DASHBOARD" }],
    }),

    // ========================================================================
    // LEGACY ENDPOINTS (For compatibility)
    // ========================================================================

    // 🔹 GET ALL REPORTS (with filters) - Legacy
    getReports: builder.query<ApiResponse<Report[]>, ReportFilterParams | void>(
      {
        query: (params) => {
          const searchParams = new URLSearchParams();

          if (params) {
            if (params.type) searchParams.append("type", params.type);
            if (params.status) searchParams.append("status", params.status);
            if (params.branch_id)
              searchParams.append("branch_id", params.branch_id.toString());
            if (params.page)
              searchParams.append("page", params.page.toString());
            if (params.limit)
              searchParams.append("limit", params.limit.toString());
          }

          const queryString = searchParams.toString();
          return {
            url: `/reports${queryString ? `?${queryString}` : ""}`,
            method: "GET",
          };
        },
        providesTags: (result) =>
          result?.data
            ? [
                ...result.data.map(({ id }) => ({
                  type: "Reports" as const,
                  id,
                })),
                { type: "Reports", id: "LIST" },
              ]
            : [{ type: "Reports", id: "LIST" }],
      }
    ),

    // 🔹 GET REPORT BY ID
    getReportById: builder.query<ApiResponse<Report>, string | number>({
      query: (id) => ({
        url: `/reports/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Reports", id }],
    }),

    // 🔹 DELETE REPORT
    deleteReport: builder.mutation<
      ApiResponse<{ message: string }>,
      string | number
    >({
      query: (id) => ({
        url: `/reports/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Reports", id: "LIST" }],
    }),

    // 🔹 DOWNLOAD REPORT
    downloadReport: builder.query<Blob, string | number>({
      query: (id) => ({
        url: `/reports/${id}/download`,
        method: "GET",
        responseHandler: async (response) => response.blob(),
      }),
      providesTags: (_result, _error, id) => [{ type: "Reports", id }],
    }),

    // ========================================================================
    // GENERATE REPORT MUTATIONS
    // ========================================================================

    // 🔹 GENERATE SALES REPORT
    generateSalesReport: builder.mutation<ApiResponse<Report>, Partial<SalesReportQuery> & { title: string; description?: string }>({
      query: (data) => ({
        url: "/reports/sales/generate",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Reports", id: "LIST" }],
    }),

    // 🔹 GENERATE PURCHASE REPORT
    generatePurchaseReport: builder.mutation<ApiResponse<Report>, Partial<PurchaseReportQuery> & { title: string; description?: string }>({
      query: (data) => ({
        url: "/reports/purchase/generate",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Reports", id: "LIST" }],
    }),

    // 🔹 GENERATE INVENTORY REPORT
    generateInventoryReport: builder.mutation<ApiResponse<Report>, Partial<InventoryReportQuery> & { title: string; description?: string }>({
      query: (data) => ({
        url: "/reports/inventory/generate",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Reports", id: "LIST" }],
    }),

    // 🔹 GENERATE PROFIT & LOSS REPORT
    generateProfitLossReport: builder.mutation<ApiResponse<Report>, Partial<ProfitLossReportQuery> & { title: string; description?: string }>({
      query: (data) => ({
        url: "/reports/profit-loss/generate",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Reports", id: "LIST" }],
    }),

    // 🔹 GENERATE EXPENSE REPORT
    generateExpenseReport: builder.mutation<ApiResponse<Report>, Partial<ExpenseReportQuery> & { title: string; description?: string }>({
      query: (data) => ({
        url: "/reports/expense/generate",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Reports", id: "LIST" }],
    }),

    // 🔹 GENERATE ATTENDANCE REPORT
    generateAttendanceReport: builder.mutation<ApiResponse<Report>, Partial<EmployeesReportQuery> & { title: string; description?: string }>({
      query: (data) => ({
        url: "/reports/attendance/generate",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Reports", id: "LIST" }],
    }),
  }),
});

export const {
  // New GET query hooks
  useGetSalesReportQuery,
  useLazyGetSalesReportQuery,
  useGetPurchaseReportQuery,
  useLazyGetPurchaseReportQuery,
  useGetInventoryReportQuery,
  useLazyGetInventoryReportQuery,
  useGetProfitLossReportQuery,
  useLazyGetProfitLossReportQuery,
  useGetStockReportQuery,
  useLazyGetStockReportQuery,
  useGetProductsReportQuery,
  useLazyGetProductsReportQuery,
  useGetEmployeesReportQuery,
  useLazyGetEmployeesReportQuery,
  useGetExpenseReportQuery,
  useLazyGetExpenseReportQuery,
  useGetSummaryReportQuery,
  useLazyGetSummaryReportQuery,
  useGetCustomersReportQuery,
  useLazyGetCustomersReportQuery,
  useGetReportDashboardSummaryQuery,

  // Generate report mutations
  useGenerateSalesReportMutation,
  useGeneratePurchaseReportMutation,
  useGenerateInventoryReportMutation,
  useGenerateProfitLossReportMutation,
  useGenerateExpenseReportMutation,
  useGenerateAttendanceReportMutation,

  // Legacy hooks
  useGetReportsQuery,
  useGetReportByIdQuery,
  useLazyDownloadReportQuery,
  useDeleteReportMutation,
} = reportApi;
