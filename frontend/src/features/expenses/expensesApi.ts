// src/features/expenses/expensesApi.ts

import { ApiResponse } from "../../types";
import {  CreateExpensePayload, Expense } from "../../types/expenses";

import { apiSlice } from "../apiSlice";

// For Expense Update
export interface UpdateExpensePayload {
  id: string | number;
  body: Partial<CreateExpensePayload>;
}

export const expensesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔹 GET ALL EXPENSES (with optional filters)
    getExpenses: builder.query<ApiResponse<Expense[]>, any | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();

        if (params) {
          if (params.category)
            searchParams.append("category", params.category.toString());
          if (params.branch_id)
            searchParams.append("branch_id", params.branch_id.toString());
          if (params.payment_method)
            searchParams.append("payment_method", params.payment_method);
          if (params.from_date)
            searchParams.append("from_date", params.from_date);
          if (params.to_date) searchParams.append("to_date", params.to_date);
          if (params.page) searchParams.append("page", params.page.toString());
          if (params.limit)
            searchParams.append("limit", params.limit.toString());
        }

        const queryString = searchParams.toString();
        return {
          url: `/expenses${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Expenses" as const,
                id,
              })),
              { type: "Expenses", id: "LIST" },
            ]
          : [{ type: "Expenses", id: "LIST" }],
    }),

    // 🔹 GET EXPENSE BY ID
    getExpenseById: builder.query<ApiResponse<Expense>, string | number>({
      query: (id) => ({
        url: `/expenses/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Expenses", id }],
    }),

    // 🔹 CREATE EXPENSE
    createExpense: builder.mutation<ApiResponse<Expense>, CreateExpensePayload>(
      {
        query: (body) => ({
          url: "/expenses",
          method: "POST",
          body,
        }),
        invalidatesTags: [{ type: "Expenses", id: "LIST" }],
      }
    ),

    // 🔹 UPDATE EXPENSE
    updateExpense: builder.mutation<ApiResponse<Expense>, UpdateExpensePayload>(
      {
        query: ({ id, body }) => ({
          url: `/expenses/${id}`,
          method: "PUT",
          body,
        }),
        invalidatesTags: (_result, _error, { id }) => [
          { type: "Expenses", id: "LIST" },
          { type: "Expenses", id },
        ],
      }
    ),

    // 🔹 DELETE EXPENSE
    deleteExpense: builder.mutation<
      ApiResponse<{ message: string }>,
      string | number
    >({
      query: (id) => ({
        url: `/expenses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Expenses", id: "LIST" }],
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useGetExpenseByIdQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} = expensesApi;
