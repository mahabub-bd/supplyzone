import { ApiResponse } from "../../types";
import {
  Customer,
  CustomerQueryParams,
  UpdateCustomerPayload,
} from "../../types/customer";
import { apiSlice } from "../apiSlice";

// For Customer Update

export const customersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔹 GET ALL CUSTOMERS (with search & pagination)
    getCustomers: builder.query<
      ApiResponse<Customer[]>,
      CustomerQueryParams | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();

        if (params?.search) searchParams.append("search", params.search);
        if (params?.page) searchParams.append("page", String(params.page));
        if (params?.limit) searchParams.append("limit", String(params.limit));

        const queryString = searchParams.toString();
        return {
          url: `/customers${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Customers" as const,
                id,
              })),
              { type: "Customers", id: "LIST" },
            ]
          : [{ type: "Customers", id: "LIST" }],
    }),

    // 🔹 GET CUSTOMER BY ID
    getCustomerById: builder.query<ApiResponse<Customer>, string | number>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Customers", id }],
    }),

    // 🔹 CREATE CUSTOMER
    createCustomer: builder.mutation<ApiResponse<Customer>, Partial<Customer>>({
      query: (body) => ({
        url: "/customers",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Customers", id: "LIST" }],
    }),

    // 🔹 UPDATE CUSTOMER
    updateCustomer: builder.mutation<
      ApiResponse<Customer>,
      UpdateCustomerPayload
    >({
      query: ({ id, body }) => ({
        url: `/customers/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Customers", id: "LIST" },
        { type: "Customers", id },
      ],
    }),

    // 🔹 DELETE CUSTOMER
    deleteCustomer: builder.mutation<
      ApiResponse<{ message: string }>,
      string | number
    >({
      query: (id) => ({
        url: `/customers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Customers", id: "LIST" }],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customersApi;
