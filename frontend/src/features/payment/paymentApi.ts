import {
  CreatePaymentPayload,
  GetPaymentsParams,
  Payment,
} from "@/types/payment";
import { ApiResponse } from "../../types";
import { apiSlice } from "../apiSlice";

export const paymentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPayment: builder.mutation<ApiResponse<any>, CreatePaymentPayload>({
      query: (body) => ({
        url: "/payments",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Purchases", "Sales", "Suppliers", "Payments"],
    }),
    getPayments: builder.query<ApiResponse<Payment[]>, GetPaymentsParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append("page", params.page.toString());
        if (params.limit) searchParams.append("limit", params.limit.toString());
        if (params.type) searchParams.append("type", params.type);
        if (params.method) searchParams.append("method", params.method);

        const queryString = searchParams.toString();
        return `/payments${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["Payments", "Purchases", "Sales", "Suppliers"],
    }),

    getPaymentById: builder.query<ApiResponse<Payment>, number>({
      query: (id) => `/payments/${id}`,
      providesTags: ["Payments", "Purchases", "Sales", "Suppliers"],
    }),
  }),
});

export const {
  useCreatePaymentMutation,
  useGetPaymentsQuery,
  useGetPaymentByIdQuery,
} = paymentsApi;
