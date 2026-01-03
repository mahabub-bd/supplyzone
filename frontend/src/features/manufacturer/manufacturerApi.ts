import { ApiResponse } from "../../types";
import {
  Manufacturer,
  CreateManufacturerPayload,
  UpdateManufacturerPayload,
  ManufacturerFilters,
} from "../../types/manufacturer";
import { apiSlice } from "../apiSlice";

export const manufacturerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔹 GET ALL MANUFACTURERS
    getManufacturers: builder.query<ApiResponse<Manufacturer[]>, ManufacturerFilters>({
      query: (params) => {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append("page", params.page.toString());
        if (params.limit) searchParams.append("limit", params.limit.toString());
        if (params.search) searchParams.append("search", params.search);
        if (params.status !== undefined) searchParams.append("status", params.status.toString());
        if (params.city) searchParams.append("city", params.city);
        if (params.country) searchParams.append("country", params.country);

        return {
          url: `/manufacturers?${searchParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Manufacturers"],
    }),

    // 🔹 GET MANUFACTURER BY ID
    getManufacturerById: builder.query<ApiResponse<Manufacturer>, string | number>({
      query: (id) => ({
        url: `/manufacturers/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Manufacturers", id }],
    }),

    // 🔹 CREATE MANUFACTURER
    createManufacturer: builder.mutation<ApiResponse<Manufacturer>, CreateManufacturerPayload>({
      query: (body) => ({
        url: "/manufacturers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Manufacturers"],
    }),

    // 🔹 UPDATE MANUFACTURER
    updateManufacturer: builder.mutation<ApiResponse<Manufacturer>, UpdateManufacturerPayload>({
      query: ({ id, body }) => ({
        url: `/manufacturers/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Manufacturers",
        { type: "Manufacturers", id },
      ],
    }),

    // 🔹 DELETE MANUFACTURER
    deleteManufacturer: builder.mutation<
      ApiResponse<{ message: string }>,
      string | number
    >({
      query: (id) => ({
        url: `/manufacturers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Manufacturers"],
    }),
  }),
});

// 🔥 Export hooks
export const {
  useGetManufacturersQuery,
  useGetManufacturerByIdQuery,
  useCreateManufacturerMutation,
  useUpdateManufacturerMutation,
  useDeleteManufacturerMutation,
} = manufacturerApi;