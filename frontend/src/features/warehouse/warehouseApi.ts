import { ApiResponse } from "../../types";
import { Warehouse } from "../../types/branch";
import { apiSlice } from "../apiSlice";
export interface UpdateWarehousePayload {
  id: number | string;
  body: Partial<Warehouse>;
}
export const warehouseApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 📄 Get all warehouses
    getWarehouses: builder.query<ApiResponse<Warehouse[]>, void>({
      query: () => ({ url: "/warehouse", method: "GET" }),
      providesTags: ["Warehouses"],
    }),

    // 🔍 Get single warehouse
    getWarehouseById: builder.query<ApiResponse<Warehouse>, number>({
      query: (id) => ({ url: `/warehouse/${id}`, method: "GET" }),
      providesTags: (_res, _err, id) => [{ type: "Warehouses", id }],
    }),

    // ➕ Create new warehouse
    createWarehouse: builder.mutation<
      ApiResponse<Warehouse>,
      Partial<Warehouse>
    >({
      query: (body) => ({ url: "/warehouse", method: "POST", body }),
      invalidatesTags: ["Warehouses"],
    }),

    // ✏ Update warehouse
    updateWarehouse: builder.mutation<
      ApiResponse<Warehouse>,
      UpdateWarehousePayload
    >({
      query: ({ id, body }) => ({
        url: `/warehouse/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Warehouses", id },
        "Warehouses",
      ],
    }),

    // ❌ Delete warehouse
    deleteWarehouse: builder.mutation<ApiResponse<{ message: string }>, number>(
      {
        query: (id) => ({ url: `/warehouse/${id}`, method: "DELETE" }),
        invalidatesTags: ["Warehouses"],
      }
    ),
  }),
  overrideExisting: false,
});

export const {
  useGetWarehousesQuery,
  useGetWarehouseByIdQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
} = warehouseApi;
