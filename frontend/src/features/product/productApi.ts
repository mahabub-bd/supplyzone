import { ApiResponse } from "../../types";
import { Product, ProductFilters, ProductRequest, UpdateProductPayload } from "../../types/product";
import {
  buildQueryString,
  generateItemTag,
  generateListTags,
  invalidateItemAndList,
} from "../../utlis";
import { apiSlice } from "../apiSlice";



export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔹 GET ALL PRODUCTS
    getProducts: builder.query<ApiResponse<Product[]>, ProductFilters>({
      query: (params) => {
        const queryString = buildQueryString(params);
        return {
          url: `/product?${queryString}`,
          method: "GET",
        };
      },
      providesTags: (result) => generateListTags(result, "Products"),
    }),

    // 🔹 GET PRODUCT BY ID
    getProductById: builder.query<ApiResponse<Product>, string | number>({
      query: (id) => ({
        url: `/product/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => generateItemTag("Products", id),
    }),

    // 🔹 CREATE PRODUCT
    createProduct: builder.mutation<ApiResponse<Product>, ProductRequest>({
      query: (body) => ({
        url: "/product",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),

    // 🔹 UPDATE PRODUCT
    updateProduct: builder.mutation<ApiResponse<Product>, UpdateProductPayload>(
      {
        query: ({ id, body }) => ({
          url: `/product/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: (_result, _error, { id }) =>
          invalidateItemAndList("Products", id),
      }
    ),

    // 🔹 DELETE PRODUCT
    deleteProduct: builder.mutation<
      ApiResponse<{ message: string }>,
      string | number
    >({
      query: (id) => ({
        url: `/product/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) =>
        invalidateItemAndList("Products", id),
    }),

    // 🔹 GET COMPONENT PRODUCTS
    getComponentProducts: builder.query<
      ApiResponse<Product[]>,
      { page?: number; limit?: number }
    >({
      query: (params) => {
        const queryString = buildQueryString({
          page: params.page || 1,
          limit: params.limit || 20,
        });
        return {
          url: `/product/type/component?${queryString}`,
          method: "GET",
        };
      },
      providesTags: (result) => generateListTags(result, "Products"),
    }),

    // 🔹 GET FINISHED GOOD PRODUCTS
    getFinishedGoodProducts: builder.query<
      ApiResponse<Product[]>,
      { page?: number; limit?: number }
    >({
      query: (params) => {
        const queryString = buildQueryString({
          page: params.page || 1,
          limit: params.limit || 20,
        });
        return {
          url: `/product/type/finished-good?${queryString}`,
          method: "GET",
        };
      },
      providesTags: (result) => generateListTags(result, "Products"),
    }),
  }),
});

// 🔥 Export hooks
export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetComponentProductsQuery,
  useGetFinishedGoodProductsQuery,
} = productApi;
