import { apiSlice } from "../apiSlice";

export const customerGroupApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCustomerGroups: builder.query({
      query: () => `/customer-groups`,
      providesTags: ["CustomerGroups"],
    }),

    getCustomerGroupById: builder.query({
      query: (id) => `/customer-groups/${id}`,
      providesTags: (_res, _err, id) => [{ type: "CustomerGroups", id }],
    }),

    createCustomerGroup: builder.mutation({
      query: (body) => ({
        url: `/customer-groups`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["CustomerGroups"],
    }),

    updateCustomerGroup: builder.mutation({
      query: ({ id, body }) => ({
        url: `/customer-groups/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["CustomerGroups"],
    }),

    deleteCustomerGroup: builder.mutation({
      query: (id) => ({
        url: `/customer-groups/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CustomerGroups"],
    }),
  }),
});

export const {
  useGetCustomerGroupsQuery,
  useGetCustomerGroupByIdQuery,
  useCreateCustomerGroupMutation,
  useUpdateCustomerGroupMutation,
  useDeleteCustomerGroupMutation,
} = customerGroupApi;
