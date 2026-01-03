import { ApiResponse } from "../../types";
import {
  ConvertQuotationToSalePayload,
  CreateQuotationPayload,
  GetQuotationsParams,
  Quotation,
  QuotationAnalytics,
  UpdateQuotationPayload,
  UpdateQuotationStatusPayload,
} from "../../types/quotation";
import { apiSlice } from "../apiSlice";

export const quotationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET QUOTATION LIST (Paginated)
    getQuotations: builder.query<
      ApiResponse<Quotation[]>,
      GetQuotationsParams | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();

        if (params) {
          if (params.page) searchParams.append("page", params.page.toString());
          if (params.limit)
            searchParams.append("limit", params.limit.toString());
          if (params.status) searchParams.append("status", params.status);
          if (params.customer_id)
            searchParams.append("customer_id", params.customer_id.toString());
          if (params.branch_id)
            searchParams.append("branch_id", params.branch_id.toString());
          if (params.start_date)
            searchParams.append("start_date", params.start_date);
          if (params.end_date) searchParams.append("end_date", params.end_date);
          if (params.search) searchParams.append("search", params.search);
        }

        return {
          url: `/quotations/list${
            searchParams.toString() ? `?${searchParams}` : ""
          }`,
          method: "GET",
        };
      },
      providesTags: ["Quotations"],
    }),

    // GET QUOTATION BY ID
    getQuotationById: builder.query<ApiResponse<Quotation>, number>({
      query: (id) => ({
        url: `/quotations/${id}`,
        method: "GET",
      }),
      providesTags: (_r, _e, id) => [{ type: "Quotations", id }],
    }),

    // CREATE QUOTATION
    createQuotation: builder.mutation<
      ApiResponse<Quotation>,
      CreateQuotationPayload
    >({
      query: ({ body }) => ({
        url: "/quotations",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Quotations"],
    }),

    // UPDATE QUOTATION
    updateQuotation: builder.mutation<
      ApiResponse<Quotation>,
      UpdateQuotationPayload
    >({
      query: ({ id, body }) => ({
        url: `/quotations/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        "Quotations",
        { type: "Quotations", id },
      ],
    }),

    // UPDATE QUOTATION STATUS
    updateQuotationStatus: builder.mutation<
      ApiResponse<Quotation>,
      UpdateQuotationStatusPayload
    >({
      query: ({ id, body }) => ({
        url: `/quotations/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        "Quotations",
        { type: "Quotations", id },
      ],
    }),

    // CONVERT QUOTATION TO SALE
    convertQuotationToSale: builder.mutation<
      ApiResponse<any>,
      ConvertQuotationToSalePayload
    >({
      query: ({ id, body }) => ({
        url: `/quotations/${id}/convert-to-sale`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        "Quotations",
        { type: "Quotations", id },
        "Sales",
      ],
    }),

    // DELETE QUOTATION
    deleteQuotation: builder.mutation<ApiResponse<{ message: string }>, number>(
      {
        query: (id) => ({
          url: `/quotations/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Quotations"],
      }
    ),

    // GET QUOTATION ANALYTICS - LAST 30 DAYS
    getQuotationAnalytics: builder.query<ApiResponse<QuotationAnalytics>, void>({
      query: () => ({
        url: "/quotations/analytics/last-30-days",
        method: "GET",
      }),
      providesTags: ["Quotations"],
    }),
  }),
});

export const {
  useGetQuotationsQuery,
  useGetQuotationByIdQuery,
  useCreateQuotationMutation,
  useUpdateQuotationMutation,
  useUpdateQuotationStatusMutation,
  useConvertQuotationToSaleMutation,
  useDeleteQuotationMutation,
  useGetQuotationAnalyticsQuery,
} = quotationsApi;
