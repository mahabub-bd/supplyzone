import { BaseEntity, BaseEntityOptionalUpdate, PaginationParams } from "./index";
import { BranchBasic } from "./branch";
import { EmployeeBasic } from "./hrm";

// ============================================================================
// LEAVE MANAGEMENT
// ============================================================================

export enum LeaveStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
}

export enum LeaveType {
  ANNUAL = "annual",
  SICK = "sick",
  MATERNITY = "maternity",
  PATERNITY = "paternity",
  UNPAID = "unpaid",
  COMPASSIONATE = "compassionate",
}

export interface LeaveBalanceDetails {
  annual: string;
  sick: string;
  maternity: string;
  paternity: string;
  unpaid: string;
  compassionate: string;
  study: string;
}

export interface LeaveRequest extends BaseEntityOptionalUpdate {
  start_date: string;
  end_date: string;
  days_count: string;
  leave_type: LeaveType;
  status: LeaveStatus;
  reason: string;
  rejection_reason?: string | null;
  approved_date?: string | null;
  approver_notes?: string | null;
  employee?: EmployeeBasic;
  branch?: BranchBasic;
  currentApproverId?: number | null;
  currentApprovalLevel?: number | null;
  totalApprovalLevels?: number | null;
  completedApprovalLevels: number;
  isFullyApproved: boolean;
  requiresMultiLevelApproval: boolean;
  leave_balance?: {
    employee_id: number;
    year: number;
    entitlements: LeaveBalanceDetails;
    used: LeaveBalanceDetails;
    available: LeaveBalanceDetails;
  };
}

export interface CreateLeaveRequestPayload {
  start_date: string;
  end_date: string;
  leave_type: LeaveType;
  reason: string;
  employee_id: number;
  branch_id: number;
}

export interface UpdateLeaveRequestPayload {
  start_date?: string;
  end_date?: string;
  leave_type?: LeaveType;
  reason?: string;
  employee_id?: number;
  branch_id?: number;
}

export interface GetLeaveRequestsParams extends PaginationParams {
  employee_id?: number;
  status?: LeaveStatus;
  leave_type?: LeaveType;
  start_date?: string;
  end_date?: string;
  branch_id?: number;
}

export interface LeaveBalance {
  employee_id: number;
  annual_leave: {
    total: number;
    used: number;
    remaining: number;
  };
  sick_leave: {
    total: number;
    used: number;
    remaining: number;
  };
  maternity_leave: {
    total: number;
    used: number;
    remaining: number;
  };
  paternity_leave: {
    total: number;
    used: number;
    remaining: number;
  };
  unpaid_leave: {
    taken: number;
  };
  compassionate_leave: {
    taken: number;
  };
}

export interface LeaveSummary {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  cancelled_requests: number;
  status_breakdown: {
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
  };
  type_breakdown: {
    annual: number;
    sick: number;
    maternity: number;
    paternity: number;
    unpaid: number;
    compassionate: number;
    study: number;
  };
  total_days_taken: number;
  employees_on_leave: number;
  year: number;
  monthly_breakdown: Array<{
    month: string;
    year: number;
    total_requests: number;
    approved_requests: number;
    rejected_requests: number;
  }>;
}

// ============================================================================
// LEAVE APPROVAL
// ============================================================================

export interface LeaveApproval extends BaseEntity {
  leave_request_id: number;
  approver_id: number;
  action: "approve" | "reject";
  approver_notes?: string;
  rejection_reason?: string;
  approver?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface ApproveLeaveRequestPayload {
  approverNotes?: string;
}

export interface RejectLeaveRequestPayload {
  rejectionReason: string;
}

export interface LeaveApprovalHistory {
  leave_request_id: number;
  approvals: LeaveApproval[];
  current_step: number;
  total_steps: number;
  status: LeaveStatus;
}

export interface PendingLeaveApprovals {
  pending_requests: Array<{
    id: number;
    employee: {
      id: number;
      first_name: string;
      last_name: string;
      employee_code: string;
    };
    leave_type: LeaveType;
    start_date: string;
    end_date: string;
    days_count: number;
    reason: string;
    requested_at: string;
    workflow_current_step: number;
    workflow_total_steps: number;
  }>;
  total_count: number;
}

export interface LeaveApprovalDashboardStats {
  pending_approvals: number;
  approvals_today: number;
  rejections_today: number;
  average_response_time: number;
  pending_urgent: number;
  monthly_approvals: Array<{
    month: string;
    year: number;
    approved: number;
    rejected: number;
    total: number;
  }>;
}
