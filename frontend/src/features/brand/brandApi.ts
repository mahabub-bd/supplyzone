import { ApiResponse, Brand } from "../../types";

import { apiSlice } from "../apiSlice";

// For Brand Update
export interface UpdateBrandPayload {
  id: string | number;
  body: Partial<Brand>;
}

export const brandsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔹 GET ALL BRANDS
    getBrands: builder.query<ApiResponse<Brand[]>, void>({
      query: () => ({
        url: "/brand",
        method: "GET",
      }),
      providesTags: ["Brands"],
    }),

    // 🔹 GET BRAND BY ID
    getBrandById: builder.query<ApiResponse<Brand>, string | number>({
      query: (id) => ({
        url: `/brand/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Brands", id }],
    }),

    // 🔹 CREATE BRAND
    createBrand: builder.mutation<ApiResponse<Brand>, Partial<Brand>>({
      query: (body) => ({
        url: "/brand",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Brands"],
    }),

    // 🔹 UPDATE BRAND
    updateBrand: builder.mutation<ApiResponse<Brand>, UpdateBrandPayload>({
      query: ({ id, body }) => ({
        url: `/brand/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Brands",
        { type: "Brands", id },
      ],
    }),

    // 🔹 DELETE BRAND
    deleteBrand: builder.mutation<
      ApiResponse<{ message: string }>,
      string | number
    >({
      query: (id) => ({
        url: `/brand/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Brands"],
    }),
  }),
});

export const {
  useGetBrandsQuery,
  useGetBrandByIdQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandsApi;
