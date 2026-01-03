import {
  ApiResponse,
  Department,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
  DepartmentEmployeeCount,
} from "../../types";

import { apiSlice } from "../apiSlice";

export interface GetDepartmentsParams {
  search?: string;
  status?: "active" | "inactive";
}

export const departmentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET ALL DEPARTMENTS with search and status query
    getDepartments: builder.query<
      ApiResponse<Department[]>,
      GetDepartmentsParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append("search", params.search);
        if (params?.status) queryParams.append("status", params.status);

        return {
          url: `/departments${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["Departments"],
    }),

    // GET DEPARTMENT BY ID
    getDepartmentById: builder.query<
      ApiResponse<Department>,
      string | number
    >({
      query: (id) => ({
        url: `/departments/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Departments", id }],
    }),

    // CREATE DEPARTMENT
    createDepartment: builder.mutation<
      ApiResponse<Department>,
      CreateDepartmentPayload
    >({
      query: (body) => ({
        url: "/departments",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Departments"],
    }),

    // UPDATE DEPARTMENT
    updateDepartment: builder.mutation<
      ApiResponse<Department>,
      UpdateDepartmentPayload
    >({
      query: ({ id, ...body }) => ({
        url: `/departments/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Departments",
        { type: "Departments", id },
      ],
    }),

    // DELETE DEPARTMENT
    deleteDepartment: builder.mutation<
      ApiResponse<{ message: string }>,
      string | number
    >({
      query: (id) => ({
        url: `/departments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Departments"],
    }),

    // GET EMPLOYEE COUNT FOR DEPARTMENT
    getDepartmentEmployeeCount: builder.query<
      ApiResponse<DepartmentEmployeeCount>,
      string | number
    >({
      query: (id) => ({
        url: `/departments/${id}/employee-count`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [
        { type: "Departments", id: `${id}-count` },
      ],
    }),

    // GET DEPARTMENT WITH EMPLOYEES
    getDepartmentWithEmployees: builder.query<
      ApiResponse<Department>,
      string | number
    >({
      query: (id) => ({
        url: `/departments/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [
        { type: "Departments", id: `${id}-employees` },
      ],
    }),
  }),
});

export const {
  useGetDepartmentsQuery,
  useGetDepartmentByIdQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useGetDepartmentEmployeeCountQuery,
  useGetDepartmentWithEmployeesQuery,
} = departmentApi;
