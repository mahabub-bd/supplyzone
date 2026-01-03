import { ApiResponse} from "../../types";
import { Supplier } from "../../types/supplier";
import { apiSlice } from "../apiSlice";

export interface UpdateSupplierPayload {
  id: string | number;
  body: Partial<Supplier>;
}

export const suppliersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET ALL SUPPLIERS
    getSuppliers: builder.query<ApiResponse<Supplier[]>, void>({
      query: () => ({
        url: "/suppliers",
        method: "GET",
      }),
      providesTags: ["Suppliers"],
    }),

    // GET SUPPLIER BY ID
    getSupplierById: builder.query<ApiResponse<Supplier>, string | number>({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Suppliers", id }],
    }),

    // CREATE SUPPLIER
    createSupplier: builder.mutation<ApiResponse<Supplier>, Partial<Supplier>>({
      query: (body) => ({
        url: "/suppliers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Suppliers"],
    }),

    // UPDATE SUPPLIER
    updateSupplier: builder.mutation<
      ApiResponse<Supplier>,
      UpdateSupplierPayload
    >({
      query: ({ id, body }) => ({
        url: `/suppliers/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Suppliers",
        { type: "Suppliers", id },
      ],
    }),

    // DELETE SUPPLIER
    deleteSupplier: builder.mutation<
      ApiResponse<{ message: string }>,
      string | number
    >({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Suppliers"],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useGetSupplierByIdQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = suppliersApi;
