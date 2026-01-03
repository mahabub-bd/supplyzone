import {
  ApiResponse,
  AttendanceRecord,
  CreateEmployeePayload,
  Employee,
  GetAttendanceParams,
  GetEmployeesParams,
  PayrollHistory,
  UpdateEmployeePayload,
} from "../../types";

import { apiSlice } from "../apiSlice";

export const employeeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET ALL EMPLOYEES
    getEmployees: builder.query<
      ApiResponse<Employee[]>,
      GetEmployeesParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append("search", params.search);
        if (params?.status) queryParams.append("status", params.status);
        if (params?.department_id)
          queryParams.append("department_id", params.department_id.toString());
        if (params?.designation_id)
          queryParams.append(
            "designation_id",
            params.designation_id.toString()
          );
        if (params?.branch_id)
          queryParams.append("branch_id", params.branch_id.toString());
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());

        return {
          url: `/hrm/employees${
            queryParams.toString() ? `?${queryParams.toString()}` : ""
          }`,
          method: "GET",
        };
      },
      providesTags: ["Employees"],
    }),

    // GET EMPLOYEE BY ID
    getEmployeeById: builder.query<ApiResponse<Employee>, string | number>({
      query: (id) => ({
        url: `/hrm/employees/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Employees", id }],
    }),

    // CREATE EMPLOYEE
    createEmployee: builder.mutation<
      ApiResponse<Employee>,
      CreateEmployeePayload
    >({
      query: (body) => ({
        url: "/hrm/employees",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Employees"],
    }),

    // UPDATE EMPLOYEE
    updateEmployee: builder.mutation<
      ApiResponse<Employee>,
      UpdateEmployeePayload
    >({
      query: ({ id, ...body }) => ({
        url: `/hrm/employees/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Employees",
        { type: "Employees", id },
      ],
    }),

    // DELETE EMPLOYEE
    deleteEmployee: builder.mutation<
      ApiResponse<{ message: string }>,
      string | number
    >({
      query: (id) => ({
        url: `/hrm/employees/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Employees"],
    }),

    // GET PAYROLL HISTORY BY EMPLOYEE ID
    getPayrollHistoryByEmployeeId: builder.query<
      ApiResponse<PayrollHistory[]>,
      string | number
    >({
      query: (id) => ({
        url: `/hrm/employees/${id}/payroll-history`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [
        { type: "Employees", id: `${id}-payroll` },
      ],
    }),

    // GET ATTENDANCE BY EMPLOYEE ID
    getAttendanceByEmployeeId: builder.query<
      ApiResponse<AttendanceRecord[]>,
      { id: string | number; params: GetAttendanceParams }
    >({
      query: ({ id, params }) => {
        const queryParams = new URLSearchParams();
        queryParams.append("start_date", params.start_date);
        queryParams.append("end_date", params.end_date);

        return {
          url: `/hrm/employees/${id}/attendance?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: (_result, _error, { id }) => [
        { type: "Employees", id: `${id}-attendance` },
      ],
    }),

    // TERMINATE EMPLOYEE
    terminateEmployee: builder.mutation<
      ApiResponse<Employee>,
      { id: string | number; termination_date: string; reason: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/hrm/employees/${id}/terminate`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Employees",
        { type: "Employees", id },
      ],
    }),

    // RESIGN EMPLOYEE
    resignEmployee: builder.mutation<
      ApiResponse<Employee>,
      {
        id: string | number;
        resignation_date: string;
        reason: string;
        notes?: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/hrm/employees/${id}/resign`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Employees",
        { type: "Employees", id },
      ],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useGetPayrollHistoryByEmployeeIdQuery,
  useGetAttendanceByEmployeeIdQuery,
  useTerminateEmployeeMutation,
  useResignEmployeeMutation,
} = employeeApi;
