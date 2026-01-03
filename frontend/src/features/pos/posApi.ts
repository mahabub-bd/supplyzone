import { apiSlice } from "../apiSlice";
import { PosSalesResponse } from "../../types/pos";

export const posApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔹 GET TODAY'S POS SALES SUMMARY
    getPosSalesSummary: builder.query({
      query: ({ branch_id }: { branch_id?: number }) => {
        const params = new URLSearchParams();
        if (branch_id) params.append("branch_id", branch_id.toString());
        return `/pos/summary/today?${params.toString()}`;
      },
      providesTags: ["Sales"],
    }),

    // 🔹 GET POS SALES (PAGINATION)
    getPosSales: builder.query<PosSalesResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) =>
        `/pos/sales?page=${page}&limit=${limit}`,
      providesTags: ["Sales"],
    }),

    // 🔹 GET POS SALE BY ID
    getPosSaleById: builder.query({
      query: (id: number) => `/pos/sale/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Sales", id }],
    }),

    // 🔹 CREATE POS SALE
    createPosSale: builder.mutation({
      query: (data) => ({
        url: "/pos/sale",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Sales", "CashRegister"],
    }),
    getPosTransactionHistory: builder.query({
      query: ({ page = 1, limit = 10 }: { page?: number; limit?: number }) =>
        `/pos/transactions/history?page=${page}&limit=${limit}`,
      providesTags: ["Sales"],
    }),
    getPosTransactionHistoryById: builder.query({
      query: (id: number) => `/pos/sale/${id}/transactions`,
      providesTags: (_result, _error, id) => [{ type: "Sales", id }],
    }),
  }),
});

export const {
  useGetPosSalesSummaryQuery,
  useGetPosSalesQuery,
  useGetPosSaleByIdQuery,
  useCreatePosSaleMutation,
  useGetPosTransactionHistoryByIdQuery,
  useGetPosTransactionHistoryQuery,
} = posApi;
