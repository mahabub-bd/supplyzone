import { ApiResponse } from "../../types";
import {
  CreateProductionOrderPayload,
  ProductionFilters,
  ProductionOrder,
  ProductionOrderLog,
  ProductionOrderStats,
  UpdateProductionOrderPayload,
} from "../../types/production";
import { apiSlice } from "../apiSlice";

export const productionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔹 GET ALL PRODUCTION ORDERS
    getProductionOrders: builder.query<
      ApiResponse<ProductionOrder[]>,
      ProductionFilters
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append("page", params.page.toString());
        if (params.limit) searchParams.append("limit", params.limit.toString());
        if (params.search) searchParams.append("search", params.search);
        if (params.status) searchParams.append("status", params.status);
        if (params.priority) searchParams.append("priority", params.priority);
        if (params.brand_id)
          searchParams.append("brand_id", params.brand_id.toString());
        if (params.warehouse_id)
          searchParams.append("warehouse_id", params.warehouse_id.toString());
        if (params.start_date) searchParams.append("start_date", params.start_date);
        if (params.end_date) searchParams.append("end_date", params.end_date);

        return {
          url: `/production?${searchParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["ProductionOrders"],
    }),

    // 🔹 GET PRODUCTION ORDER BY ID
    getProductionOrderById: builder.query<
      ApiResponse<ProductionOrder>,
      string | number
    >({
      query: (id) => ({
        url: `/production/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "ProductionOrders", id }],
    }),

    // 🔹 GET PRODUCTION ORDER STATS
    getProductionOrderStats: builder.query<ApiResponse<ProductionOrderStats>, void>({
      query: () => ({
        url: "/production/stats",
        method: "GET",
      }),
      providesTags: ["ProductionOrderStats"],
    }),

    // 🔹 GET PRODUCTION ORDER LOGS
    getProductionOrderLogs: builder.query<
      ApiResponse<ProductionOrderLog[]>,
      string | number
    >({
      query: (id) => ({
        url: `/production/${id}/logs`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [
        { type: "ProductionOrderLogs", id },
      ],
    }),

    // 🔹 CREATE PRODUCTION ORDER
    createProductionOrder: builder.mutation<
      ApiResponse<ProductionOrder>,
      CreateProductionOrderPayload
    >({
      query: (body) => ({
        url: "/production",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ProductionOrders", "ProductionOrderStats"],
    }),

    // 🔹 UPDATE PRODUCTION ORDER
    updateProductionOrder: builder.mutation<
      ApiResponse<ProductionOrder>,
      UpdateProductionOrderPayload
    >({
      query: ({ id, body }) => ({
        url: `/production/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "ProductionOrders",
        "ProductionOrderStats",
        { type: "ProductionOrders", id },
        { type: "ProductionOrderLogs", id },
      ],
    }),

    // 🔹 DELETE PRODUCTION ORDER
    deleteProductionOrder: builder.mutation<
      ApiResponse<{ message: string }>,
      string | number
    >({
      query: (id) => ({
        url: `/production/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ProductionOrders", "ProductionOrderStats"],
    }),
  }),
});

// 🔥 Export hooks
export const {
  useGetProductionOrdersQuery,
  useGetProductionOrderByIdQuery,
  useGetProductionOrderStatsQuery,
  useGetProductionOrderLogsQuery,
  useCreateProductionOrderMutation,
  useUpdateProductionOrderMutation,
  useDeleteProductionOrderMutation,
} = productionApi;