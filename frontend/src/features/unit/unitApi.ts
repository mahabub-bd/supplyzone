import { ApiResponse } from "../../types";
import {
  CreateUnitRequest,
  Unit,
  UpdateUnitRequest,
} from "../../types/product";
import { apiSlice } from "../apiSlice";

export const unitApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUnits: builder.query<ApiResponse<Unit[]>, void>({
      query: () => "/units",
      providesTags: ["Unit"],
    }),

    getUnitById: builder.query<ApiResponse<Unit>, number>({
      query: (id) => `/units/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Unit", id }],
    }),

    createUnit: builder.mutation<ApiResponse<Unit>, CreateUnitRequest>({
      query: (data) => ({
        url: "/units",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Unit"],
    }),

    updateUnit: builder.mutation<ApiResponse<Unit>, UpdateUnitRequest>({
      query: ({ id, ...data }) => ({
        url: `/units/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: "Unit", id }, "Unit"],
    }),

    deleteUnit: builder.mutation<ApiResponse<any>, number>({
      query: (id) => ({
        url: `/units/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Unit"],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetUnitsQuery,
  useGetUnitByIdQuery,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useDeleteUnitMutation,
} = unitApi;
