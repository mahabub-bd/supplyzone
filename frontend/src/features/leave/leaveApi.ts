import { apiSlice } from "../apiSlice";
import {
  ApiResponse,
  LeaveRequest,
  CreateLeaveRequestPayload,
  UpdateLeaveRequestPayload,
  GetLeaveRequestsParams,
  LeaveBalance,
  LeaveSummary,
  LeaveApprovalHistory,
  PendingLeaveApprovals,
  LeaveApprovalDashboardStats,
  ApproveLeaveRequestPayload,
  RejectLeaveRequestPayload,
} from "../../types";

export const leaveApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE LEAVE REQUEST
    createLeaveRequest: builder.mutation<ApiResponse<LeaveRequest>, CreateLeaveRequestPayload>({
      query: (body) => ({
        url: "/hrm/leave-requests",
        method: "POST",
        body,
      }),
      invalidatesTags: ["LeaveRequests", "LeaveBalance"],
    }),

    // GET ALL LEAVE REQUESTS
    getLeaveRequests: builder.query<ApiResponse<LeaveRequest[]>, GetLeaveRequestsParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();

        if (params?.employee_id)
          queryParams.append("employee_id", params.employee_id.toString());
        if (params?.status) queryParams.append("status", params.status);
        if (params?.leave_type) queryParams.append("leave_type", params.leave_type);
        if (params?.start_date) queryParams.append("start_date", params.start_date);
        if (params?.end_date) queryParams.append("end_date", params.end_date);
        if (params?.branch_id) queryParams.append("branch_id", params.branch_id.toString());
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());

        return `/hrm/leave-requests${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      },
      providesTags: ["LeaveRequests"],
    }),

    // GET LEAVE BALANCE
    getLeaveBalance: builder.query<ApiResponse<LeaveBalance>, number>({
      query: (employee_id) => `/hrm/leave-requests/balance/${employee_id}`,
      providesTags: ["LeaveBalance"],
    }),

    // GET LEAVE SUMMARY REPORT
    getLeaveSummary: builder.query<ApiResponse<LeaveSummary>, GetLeaveRequestsParams & { year?: number }>({
      query: (params) => {
        const queryParams = new URLSearchParams();

        if (params?.year) queryParams.append("year", params.year.toString());
        if (params?.start_date) queryParams.append("start_date", params.start_date);
        if (params?.end_date) queryParams.append("end_date", params.end_date);
        if (params?.branch_id) queryParams.append("branch_id", params.branch_id.toString());
        if (params?.employee_id) queryParams.append("employee_id", params.employee_id.toString());

        return `/hrm/leave-requests/report/summary${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      },
      providesTags: ["LeaveSummary"],
    }),

    // GET SPECIFIC LEAVE REQUEST
    getLeaveRequestById: builder.query<ApiResponse<LeaveRequest>, number | string>({
      query: (id) => `/hrm/leave-requests/${id}`,
      providesTags: (_result, _error, id) => [{ type: "LeaveRequests", id }],
    }),

    // UPDATE LEAVE REQUEST
    updateLeaveRequest: builder.mutation<ApiResponse<LeaveRequest>, { id: number; body: UpdateLeaveRequestPayload }>({
      query: ({ id, body }) => ({
        url: `/hrm/leave-requests/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "LeaveRequests", id },
        "LeaveRequests",
        "LeaveBalance",
      ],
    }),

    // DELETE LEAVE REQUEST
    deleteLeaveRequest: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/hrm/leave-requests/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["LeaveRequests", "LeaveBalance"],
    }),

    // CANCEL LEAVE REQUEST
    cancelLeaveRequest: builder.mutation<ApiResponse<LeaveRequest>, number>({
      query: (id) => ({
        url: `/hrm/leave-requests/${id}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "LeaveRequests", id },
        "LeaveRequests",
      ],
    }),

    // APPROVE LEAVE REQUEST
    approveLeaveRequest: builder.mutation<ApiResponse<LeaveRequest>, { leaveRequestId: number; body?: ApproveLeaveRequestPayload }>({
      query: ({ leaveRequestId, body }) => ({
        url: `/hrm/leave-approvals/${leaveRequestId}/approve`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { leaveRequestId }) => [
        { type: "LeaveRequests", id: leaveRequestId },
        "LeaveRequests",
        "PendingApprovals",
        "LeaveApprovalDashboard",
      ],
    }),

    // REJECT LEAVE REQUEST
    rejectLeaveRequest: builder.mutation<ApiResponse<LeaveRequest>, { leaveRequestId: number; body: RejectLeaveRequestPayload }>({
      query: ({ leaveRequestId, body }) => ({
        url: `/hrm/leave-approvals/${leaveRequestId}/reject`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { leaveRequestId }) => [
        { type: "LeaveRequests", id: leaveRequestId },
        "LeaveRequests",
        "PendingApprovals",
        "LeaveApprovalDashboard",
      ],
    }),

    // GET LEAVE APPROVAL HISTORY
    getLeaveApprovalHistory: builder.query<ApiResponse<LeaveApprovalHistory>, number | string>({
      query: (leaveRequestId) => `/hrm/leave-approvals/${leaveRequestId}/history`,
      providesTags: (_result, _error, leaveRequestId) => [{ type: "LeaveApprovalHistory", id: leaveRequestId }],
    }),

    // GET PENDING LEAVE APPROVALS
    getPendingLeaveApprovals: builder.query<ApiResponse<PendingLeaveApprovals>, void>({
      query: () => "/hrm/leave-approvals/pending",
      providesTags: ["PendingApprovals"],
    }),

    // INITIALIZE LEAVE APPROVAL WORKFLOW
    initializeLeaveApprovalWorkflow: builder.mutation<ApiResponse<void>, number>({
      query: (leaveRequestId) => ({
        url: `/hrm/leave-approvals/${leaveRequestId}/initialize`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, leaveRequestId) => [{ type: "LeaveRequests", id: leaveRequestId }],
    }),

    // GET LEAVE APPROVAL DASHBOARD STATS
    getLeaveApprovalDashboardStats: builder.query<ApiResponse<LeaveApprovalDashboardStats>, void>({
      query: () => "/hrm/leave-approvals/dashboard/stats",
      providesTags: ["LeaveApprovalDashboard"],
    }),

    // GET LEAVE REQUEST APPROVAL STATUS
    getLeaveRequestApprovalStatus: builder.query<ApiResponse<any>, number | string>({
      query: (id) => `/hrm/leave-requests/${id}/approval-status/minimal`,
      providesTags: (_result, _error, id) => [{ type: "LeaveRequests", id }],
    }),
  }),
});

// Export hooks
export const {
  useCreateLeaveRequestMutation,
  useGetLeaveRequestsQuery,
  useGetLeaveBalanceQuery,
  useGetLeaveSummaryQuery,
  useGetLeaveRequestByIdQuery,
  useUpdateLeaveRequestMutation,
  useDeleteLeaveRequestMutation,
  useCancelLeaveRequestMutation,
  useApproveLeaveRequestMutation,
  useRejectLeaveRequestMutation,
  useGetLeaveApprovalHistoryQuery,
  useGetPendingLeaveApprovalsQuery,
  useInitializeLeaveApprovalWorkflowMutation,
  useGetLeaveApprovalDashboardStatsQuery,
  useGetLeaveRequestApprovalStatusQuery,
} = leaveApi;