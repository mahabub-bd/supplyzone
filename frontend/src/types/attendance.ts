import { BaseEntityOptionalUpdate, DateRangeParams, PaginationParams } from "./index";
import { Branch } from "./branch";
import { Employee } from "./hrm";

// ============================================================================
// ATTENDANCE
// ============================================================================

export type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "half_day"
  | "leave";

export interface AttendanceRecord extends BaseEntityOptionalUpdate {
  employee_id?: number;
  date: string;
  check_in: string | null;
  check_out: string | null;
  break_start?: string | null;
  break_end?: string | null;
  regular_hours: string;
  overtime_hours: string;
  status: AttendanceStatus;
  notes?: string | null;
  employee?: Employee;
  branch?: Branch;
}

export interface CheckInPayload {
  employee_id: number;
  branch_id: number;
  check_in_time: string;
}

export interface CheckOutPayload {
  employee_id: number;
  branch_id: number;
  check_out_time: string;
}

export interface BulkAttendanceRecord {
  employee_id: number;
  date: string;
  status: AttendanceStatus;
  check_in?: string;
  check_out?: string;
  regular_hours?: number;
  overtime_hours?: number;
  notes?: string;
}

export interface BulkAttendancePayload {
  attendance_records: BulkAttendanceRecord[];
  branch_id: number;
}

export interface UpdateAttendancePayload {
  id: number;
  date?: string;
  check_in?: string;
  check_out?: string;
  break_start?: string;
  break_end?: string;
  status?: AttendanceStatus;
  regular_hours?: string;
  overtime_hours?: string;
  notes?: string;
}

export interface GetAttendanceParams extends DateRangeParams {}

export interface GetAttendanceListParams extends PaginationParams {
  employee_id?: number;
  branch_id?: number;
  start_date?: string;
  end_date?: string;
  status?: AttendanceStatus;
}

export interface AttendanceSummaryParams extends DateRangeParams {
  branch_id?: number;
  department?: number;
}

export interface OvertimeReportParams extends DateRangeParams {
  branch_id?: number;
}

export interface AttendanceSummary {
  total_records: number;
  total_employees: number;
  status_breakdown: {
    present: number;
    absent: number;
    late: number;
    half_day: number;
    on_leave: number;
  };
  total_regular_hours: string;
  total_overtime_hours: string;
}

export interface OvertimeReport {
  total_overtime_hours: number;
  total_employees_with_overtime: number;
  employee_breakdown: Array<{
    employee_id: number;
    employee_name: string;
    total_overtime_hours: string;
    days_with_overtime: number;
    average_overtime_per_day: string;
    total_regular_hours: string;
  }>;
}
