import { ApiResponse } from "../../types";
import {
  AdjustBalancePayload,
  CashInPayload,
  CashOutPayload,
  CashRegister,
  CashRegisterTransaction,
  CloseCashRegisterPayload,
  CreateCashRegisterPayload,
  GetCashRegistersParams,
  GetTransactionsParams,
  OpenCashRegisterPayload,
  VarianceReport,
} from "../../types/cashregister";
import { apiSlice } from "../apiSlice";

export const cashRegisterApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔹 GET ALL CASH REGISTERS
    getCashRegisters: builder.query<
      ApiResponse<CashRegister[]>,
      GetCashRegistersParams
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.branch_id)
          searchParams.append("branch_id", params.branch_id.toString());
        if (params.status) searchParams.append("status", params.status);
        if (params.page) searchParams.append("page", params.page.toString());
        if (params.limit) searchParams.append("limit", params.limit.toString());
        if (params.search) searchParams.append("search", params.search);
        return `/cash-register?${searchParams.toString()}`;
      },
      providesTags: ["CashRegister"],
    }),

    // 🔹 GET CASH REGISTER BY ID
    getCashRegisterById: builder.query<ApiResponse<CashRegister>, number>({
      query: (id) => `/cash-register/${id}`,
      providesTags: (_result, _error, id) => [{ type: "CashRegister", id }],
    }),

    // 🔹 GET AVAILABLE CASH REGISTERS FOR POS
    getAvailableCashRegisters: builder.query<ApiResponse<CashRegister[]>, void>(
      {
        query: () => "/cash-register/available",
        providesTags: ["CashRegister"],
      }
    ),

    // 🔹 CREATE CASH REGISTER
    createCashRegister: builder.mutation<
      ApiResponse<CashRegister>,
      CreateCashRegisterPayload
    >({
      query: (data) => ({
        url: "/cash-register/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CashRegister"],
    }),

    // 🔹 OPEN CASH REGISTER
    openCashRegister: builder.mutation<
      ApiResponse<CashRegister>,
      OpenCashRegisterPayload
    >({
      query: (payload) => ({
        url: `/cash-register/open`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (_result, _error, payload) => [
        "CashRegister",
        { type: "CashRegister", id: payload.cash_register_id },
      ],
    }),

    // 🔹 CLOSE CASH REGISTER
    closeCashRegister: builder.mutation<
      ApiResponse<CashRegister>,
      CloseCashRegisterPayload
    >({
      query: (payload) => ({
        url: `/cash-register/close`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (_result, _error, payload) => [
        "CashRegister",
        { type: "CashRegister", id: payload.cash_register_id },
      ],
    }),

    // 🔹 CASH IN TRANSACTION
    cashIn: builder.mutation<
      ApiResponse<CashRegisterTransaction>,
      { id: number; data: CashInPayload }
    >({
      query: ({ id, data }) => ({
        url: `/cash-register/${id}/cash-in`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "CashRegister",
        { type: "CashRegister", id },
        "CashRegisterTransaction",
      ],
    }),

    // 🔹 CASH OUT TRANSACTION
    cashOut: builder.mutation<
      ApiResponse<CashRegisterTransaction>,
      { id: number; data: CashOutPayload }
    >({
      query: ({ id, data }) => ({
        url: `/cash-register/${id}/cash-out`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "CashRegister",
        { type: "CashRegister", id },
        "CashRegisterTransaction",
      ],
    }),

    // 🔹 ADJUST BALANCE
    adjustBalance: builder.mutation<
      ApiResponse<CashRegisterTransaction>,
      { id: number; data: AdjustBalancePayload }
    >({
      query: ({ id, data }) => ({
        url: `/cash-register/${id}/adjust`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "CashRegister",
        { type: "CashRegister", id },
        "CashRegisterTransaction",
      ],
    }),

    // 🔹 GET CASH REGISTER TRANSACTIONS
    getCashRegisterTransactions: builder.query<
      ApiResponse<CashRegisterTransaction[]>,
      GetTransactionsParams
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.cash_register_id)
          searchParams.append(
            "cash_register_id",
            params.cash_register_id.toString()
          );
        if (params.transaction_type)
          searchParams.append("transaction_type", params.transaction_type);
        if (params.start_date)
          searchParams.append("start_date", params.start_date);
        if (params.end_date) searchParams.append("end_date", params.end_date);
        if (params.page) searchParams.append("page", params.page.toString());
        if (params.limit) searchParams.append("limit", params.limit.toString());
        return `/cash-register/transactions?${searchParams.toString()}`;
      },
      providesTags: ["CashRegisterTransaction"],
    }),

    // 🔹 GET TRANSACTIONS BY CASH REGISTER ID
    getTransactionsByCashRegisterId: builder.query<
      ApiResponse<CashRegisterTransaction[]>,
      { id: number; params?: GetTransactionsParams }
    >({
      query: ({ id, params }) => {
        const searchParams = new URLSearchParams();
        if (params?.transaction_type)
          searchParams.append("transaction_type", params.transaction_type);
        if (params?.start_date)
          searchParams.append("start_date", params.start_date);
        if (params?.end_date) searchParams.append("end_date", params.end_date);
        if (params?.page) searchParams.append("page", params.page.toString());
        if (params?.limit)
          searchParams.append("limit", params.limit.toString());
        return `/cash-register/${id}/transactions?${searchParams.toString()}`;
      },
      providesTags: (_result, _error, { id }) => [
        "CashRegisterTransaction",
        { type: "CashRegisterTransaction", id: id.toString() },
      ],
    }),

    // 🔹 GET VARIANCE REPORT
    getVarianceReport: builder.query<ApiResponse<VarianceReport>, number>({
      query: (id) => `/cash-register/${id}/variance-report`,
      providesTags: (_result, _error, id) => [{ type: "CashRegister", id }],
    }),

    // 🔹 GET SUMMARY REPORT
    getCashRegisterSummary: builder.query<
      ApiResponse<{
        total_registers: number;
        open_registers: number;
        total_balance: number;
        today_sales: number;
        today_transactions: number;
      }>,
      { branch_id?: number }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.branch_id)
          searchParams.append("branch_id", params.branch_id.toString());
        return `/cash-register/summary?${searchParams.toString()}`;
      },
      providesTags: ["CashRegister"],
    }),
  }),
});

export const {
  useGetCashRegistersQuery,
  useGetCashRegisterByIdQuery,
  useGetAvailableCashRegistersQuery,
  useCreateCashRegisterMutation,
  useOpenCashRegisterMutation,
  useCloseCashRegisterMutation,
  useCashInMutation,
  useCashOutMutation,
  useAdjustBalanceMutation,
  useGetCashRegisterTransactionsQuery,
  useGetTransactionsByCashRegisterIdQuery,
  useGetVarianceReportQuery,
  useGetCashRegisterSummaryQuery,
} = cashRegisterApi;
