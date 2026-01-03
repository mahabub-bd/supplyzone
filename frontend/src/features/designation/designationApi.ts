import {
  ApiResponse,
  CreateDesignationPayload,
  Designation,
  DesignationHierarchy,
  PaginatedResponse,
  UpdateDesignationPayload,
} from "../../types";

import { apiSlice } from "../apiSlice";

export const designationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET ALL DESIGNATIONS
    getDesignations: builder.query<
      ApiResponse<PaginatedResponse<Designation>>,
      void
    >({
      query: () => ({
        url: "/designations",
        method: "GET",
      }),
      providesTags: ["Designations"],
    }),

    // GET DESIGNATION BY ID
    getDesignationById: builder.query<
      ApiResponse<Designation>,
      string | number
    >({
      query: (id) => ({
        url: `/designations/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Designations", id }],
    }),

    // CREATE DESIGNATION
    createDesignation: builder.mutation<
      ApiResponse<Designation>,
      CreateDesignationPayload
    >({
      query: (body) => ({
        url: "/designations",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Designations"],
    }),

    // UPDATE DESIGNATION
    updateDesignation: builder.mutation<
      ApiResponse<Designation>,
      UpdateDesignationPayload
    >({
      query: ({ id, ...body }) => ({
        url: `/designations/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Designations",
        { type: "Designations", id },
      ],
    }),

    // DELETE DESIGNATION
    deleteDesignation: builder.mutation<
      ApiResponse<{ message: string }>,
      string | number
    >({
      query: (id) => ({
        url: `/designations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Designations"],
    }),

    // GET DESIGNATION HIERARCHY
    getDesignationHierarchy: builder.query<
      ApiResponse<DesignationHierarchy[]>,
      void
    >({
      query: () => ({
        url: "/designations/hierarchy",
        method: "GET",
      }),
      providesTags: ["Designations"],
    }),

    // ASSIGN EMPLOYEE TO DESIGNATION
    assignEmployeeToDesignation: builder.mutation<
      ApiResponse<{ message: string }>,
      { designationId: number; employeeId: number }
    >({
      query: ({ designationId, employeeId }) => ({
        url: `/designations/${designationId}/assign-employee/${employeeId}`,
        method: "POST",
      }),
      invalidatesTags: ["Designations", "Employees"],
    }),

    // GET DESIGNATIONS BY LEVEL
    getDesignationsByLevel: builder.query<ApiResponse<Designation[]>, string>({
      query: (level) => ({
        url: `/designations/by-level/${level}`,
        method: "GET",
      }),
      providesTags: (_result, _error, level) => [
        { type: "Designations", id: `level-${level}` },
      ],
    }),
  }),
});

export const {
  useGetDesignationsQuery,
  useGetDesignationByIdQuery,
  useCreateDesignationMutation,
  useUpdateDesignationMutation,
  useDeleteDesignationMutation,
  useGetDesignationHierarchyQuery,
  useAssignEmployeeToDesignationMutation,
  useGetDesignationsByLevelQuery,
} = designationApi;
