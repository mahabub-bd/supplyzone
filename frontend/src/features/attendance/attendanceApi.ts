import { apiSlice } from "../apiSlice";
import {
  ApiResponse,
  AttendanceRecord,
  AttendanceSummary,
  AttendanceSummaryParams,
  BulkAttendancePayload,
  CheckInPayload,
  CheckOutPayload,
  GetAttendanceListParams,
  OvertimeReport,
  OvertimeReportParams,
  UpdateAttendancePayload,
} from "../../types";

export const attendanceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // CHECK-IN
    checkIn: builder.mutation<ApiResponse<AttendanceRecord>, CheckInPayload>({
      query: (body) => ({
        url: "/hrm/attendance/check-in",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Attendance"],
    }),

    // CHECK-OUT
    checkOut: builder.mutation<ApiResponse<AttendanceRecord>, CheckOutPayload>({
      query: (body) => ({
        url: "/hrm/attendance/check-out",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Attendance"],
    }),

    // GET ALL ATTENDANCE RECORDS
    getAttendanceList: builder.query<
      ApiResponse<AttendanceRecord[]>,
      GetAttendanceListParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();

        if (params?.employee_id)
          queryParams.append("employee_id", params.employee_id.toString());
        if (params?.branch_id)
          queryParams.append("branch_id", params.branch_id.toString());
        if (params?.start_date)
          queryParams.append("start_date", params.start_date);
        if (params?.end_date) queryParams.append("end_date", params.end_date);
        if (params?.status) queryParams.append("status", params.status);
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());

        return {
          url: `/hrm/attendance${
            queryParams.toString() ? `?${queryParams.toString()}` : ""
          }`,
          method: "GET",
        };
      },
      providesTags: ["Attendance"],
    }),

    // GET ATTENDANCE BY ID
    getAttendanceById: builder.query<
      ApiResponse<AttendanceRecord>,
      string | number
    >({
      query: (id) => ({
        url: `/hrm/attendance/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Attendance", id }],
    }),

    // UPDATE ATTENDANCE
    updateAttendance: builder.mutation<
      ApiResponse<AttendanceRecord>,
      UpdateAttendancePayload
    >({
      query: ({ id, ...body }) => ({
        url: `/hrm/attendance/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Attendance",
        { type: "Attendance", id },
      ],
    }),

    // DELETE ATTENDANCE
    deleteAttendance: builder.mutation<
      ApiResponse<{ message: string }>,
      string | number
    >({
      query: (id) => ({
        url: `/hrm/attendance/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Attendance"],
    }),

    // BULK CREATE ATTENDANCE
    bulkCreateAttendance: builder.mutation<
      ApiResponse<AttendanceRecord[]>,
      BulkAttendancePayload
    >({
      query: (body) => ({
        url: "/hrm/attendance/bulk",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Attendance"],
    }),

    // GET ATTENDANCE SUMMARY REPORT
    getAttendanceSummary: builder.query<
      ApiResponse<AttendanceSummary>,
      AttendanceSummaryParams
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        queryParams.append("start_date", params.start_date);
        queryParams.append("end_date", params.end_date);
        if (params.branch_id)
          queryParams.append("branch_id", params.branch_id.toString());
        if (params.department)
          queryParams.append("department", params.department.toString());

        return {
          url: `/hrm/attendance/report/summary?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Attendance"],
    }),

    // GET OVERTIME REPORT
    getOvertimeReport: builder.query<
      ApiResponse<OvertimeReport>,
      OvertimeReportParams
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        queryParams.append("start_date", params.start_date);
        queryParams.append("end_date", params.end_date);
        if (params.branch_id)
          queryParams.append("branch_id", params.branch_id.toString());

        return {
          url: `/hrm/attendance/report/overtime?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Attendance"],
    }),
  }),
});

export const {
  useCheckInMutation,
  useCheckOutMutation,
  useGetAttendanceListQuery,
  useGetAttendanceByIdQuery,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
  useBulkCreateAttendanceMutation,
  useGetAttendanceSummaryQuery,
  useGetOvertimeReportQuery,
} = attendanceApi;
