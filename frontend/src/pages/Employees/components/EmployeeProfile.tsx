import {
  Briefcase,
  Building,
  Calendar,
  DollarSign,
  Edit,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  User,
  UserMinus,
  UserX,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../../components/common/Loading";
import DatePicker from "../../../components/form/date-picker";
import Badge from "../../../components/ui/badge/Badge";
import Button from "../../../components/ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  useGetAttendanceByEmployeeIdQuery,
  useGetEmployeeByIdQuery,
  useGetPayrollHistoryByEmployeeIdQuery,
} from "../../../features/employee/employeeApi";
import { useHasPermission } from "../../../hooks/useHasPermission";
import { EmployeeStatus } from "../../../types";
import {
  formatDate,
  formatDateTime,
  getDesignationLevelColor,
  getEmployeeTypeColor,
  getStatusColor,
} from "../../../utlis";
import EmployeeFormModal from "./EmployeeFormModal";
import ResignEmployeeModal from "./ResignEmployeeModal";
import TerminateEmployeeModal from "./TerminateEmployeeModal";

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const employeeId = id;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showAttendanceFilters, setShowAttendanceFilters] = useState(false);
  const [attendanceDateRange, setAttendanceDateRange] = useState<
    [Date, Date] | null
  >(null);
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
  const [isResignModalOpen, setIsResignModalOpen] = useState(false);

  const canUpdate = useHasPermission("employee.update");
  const canTerminate = useHasPermission("employee.terminate");
  const canProcessResignation = useHasPermission("employee.resign");

  const canViewPayroll = useHasPermission("payroll.view");
  const canViewAttendance = useHasPermission("attendance.view");

  const {
    data: employeeData,
    isLoading,
    error,
  } = useGetEmployeeByIdQuery(employeeId!, {
    skip: !employeeId,
  });
  const { data: payrollData } = useGetPayrollHistoryByEmployeeIdQuery(
    employeeId!,
    {
      skip: !employeeId || !canViewPayroll,
    }
  );
  const { data: attendanceData, refetch: refetchAttendance } =
    useGetAttendanceByEmployeeIdQuery(
      {
        id: employeeId!,
        params: {
          start_date: attendanceDateRange
            ? attendanceDateRange[0].toISOString().split("T")[0]
            : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
          end_date: attendanceDateRange
            ? attendanceDateRange[1].toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
        },
      },
      {
        skip: !employeeId || !canViewAttendance,
      }
    );

  const employee = employeeData?.data;
  const payrollHistory = payrollData?.data || [];
  const attendanceRecords = attendanceData?.data || [];

  if (isLoading) return <Loading message="Loading employee profile..." />;
  if (error || !employee) {
    return (
      <div className="p-6">
        <div className="text-red-500">Failed to load employee profile.</div>
        <Button onClick={() => navigate("/employees")} className="mt-4">
          Back to Employees
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Employee Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {employee.first_name} {employee.last_name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canUpdate && (
            <Button size="sm" onClick={() => setIsEditModalOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}

          {canProcessResignation &&
            employee.status === EmployeeStatus.ACTIVE && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsResignModalOpen(true)}
              >
                <UserMinus className="h-4 w-4 mr-2" />
                Resign
              </Button>
            )}

          {canTerminate && employee.status === EmployeeStatus.ACTIVE && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsTerminateModalOpen(true)}
              className="text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
            >
              <UserX className="h-4 w-4 mr-2" />
              Terminate
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/employees")}
          >
            Back to Employees
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Personal Info */}
        <div className="space-y-6">
          {/* Personal Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Personal Information
              </h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {employee.first_name[0]}
                  {employee.last_name[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {employee.first_name} {employee.last_name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {employee.employee_code}
                  </p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <Badge color={getStatusColor(employee.status)} size="sm">
                      {employee.status.replace("_", " ")}
                    </Badge>
                    <Badge
                      color={getEmployeeTypeColor(employee.employee_type)}
                      size="sm"
                    >
                      {employee.employee_type.replace("_", " ")}
                    </Badge>
                    {employee.designation?.level && (
                      <Badge
                        color={getDesignationLevelColor(
                          employee.designation.level
                        )}
                        size="sm"
                        variant="light"
                      >
                        {employee.designation.level
                          .replace("_", " ")
                          .toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{employee.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{employee.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{employee.address}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>DOB: {formatDate(employee.date_of_birth)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Hired: {formatDate(employee.hire_date)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Work Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Work Information
              </h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Building className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Department:</span>
                <span>{employee.department?.name || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Designation:</span>
                <span>{employee.designation?.title || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Base Salary:</span>
                <span>{parseFloat(employee.base_salary).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Building className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Branch:</span>
                <span>{employee.branch?.name || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span className="font-medium">User Account:</span>
                <span>{employee.user?.username || "N/A"}</span>
              </div>
              {employee.user?.roles && employee.user.roles.length > 0 && (
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Roles:</span>
                  <div className="flex gap-1 flex-wrap">
                    {employee.user.roles.map((role) => (
                      <Badge key={role.id} size="sm" variant="light" color="primary">
                        {role.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {employee.user?.last_login_at && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Last Login:</span>
                  <span>{formatDateTime(employee.user.last_login_at)}</span>
                </div>
              )}
              {employee.designation?.level && (
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Hierarchy Level:</span>
                  <Badge
                    color={getDesignationLevelColor(employee.designation.level)}
                    size="sm"
                  >
                    {employee.designation.level.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Reporting Manager Card */}
          {employee.__reportingManager__ && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Reporting Manager
                </h3>
              </div>
              <div className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                    {employee.__reportingManager__.first_name[0]}
                    {employee.__reportingManager__.last_name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {employee.__reportingManager__.first_name} {employee.__reportingManager__.last_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {employee.__reportingManager__.employee_code}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {employee.__reportingManager__.designation?.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {employee.__reportingManager__.department?.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subordinates Card */}
          {employee.__subordinates__ && employee.__subordinates__.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Direct Reports ({employee.__subordinates__.length})
                </h3>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-3">
                  {employee.__subordinates__.map((subordinate) => (
                    <div key={subordinate.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {subordinate.first_name[0]}
                        {subordinate.last_name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          {subordinate.first_name} {subordinate.last_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {subordinate.designation?.title} • {subordinate.department?.name}
                        </p>
                      </div>
                      <Badge
                        color={getStatusColor(subordinate.status)}
                        size="sm"
                      >
                        {subordinate.status.replace("_", " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notes Card */}
          {employee.notes && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notes
                </h3>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {employee.notes}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Attendance */}
          {canViewAttendance && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Attendance Records
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {attendanceDateRange
                        ? `${formatDate(
                            attendanceDateRange[0].toISOString()
                          )} - ${formatDate(
                            attendanceDateRange[1].toISOString()
                          )}`
                        : "Last 30 days"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setShowAttendanceFilters(!showAttendanceFilters)
                      }
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {showAttendanceFilters ? "Hide Filters" : "Date Range"}
                    </Button>
                    {attendanceDateRange && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAttendanceDateRange(null);
                          setShowAttendanceFilters(false);
                        }}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Date Range Filter */}
              {showAttendanceFilters && (
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <DatePicker
                        id="attendance-date-range"
                        mode="range"
                        label="Select Date Range"
                        placeholder="Select date range"
                        value={attendanceDateRange}
                        onChange={(dates) => {
                          if (
                            dates &&
                            Array.isArray(dates) &&
                            dates.length === 2
                          ) {
                            setAttendanceDateRange([dates[0], dates[1]]);
                          }
                        }}
                        disableFuture={false}
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (attendanceDateRange) {
                          refetchAttendance();
                        }
                      }}
                      disabled={!attendanceDateRange}
                    >
                      Apply Filter
                    </Button>
                  </div>
                </div>
              )}

              {attendanceRecords.length > 0 ? (
                <div className="px-6 py-4">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableCell isHeader>Date</TableCell>
                          <TableCell isHeader>Check In</TableCell>
                          <TableCell isHeader>Check Out</TableCell>
                          <TableCell isHeader>Hours</TableCell>
                          <TableCell isHeader>Overtime</TableCell>
                          <TableCell isHeader>Status</TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendanceRecords.slice(0, 10).map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{formatDate(record.date)}</TableCell>
                            <TableCell>{record.check_in || "-"}</TableCell>
                            <TableCell>{record.check_out || "-"}</TableCell>
                            <TableCell>{record.regular_hours || "-"}</TableCell>
                            <TableCell>
                              {record.overtime_hours || "-"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                color={
                                  record.status === "present"
                                    ? "success"
                                    : record.status === "absent"
                                    ? "error"
                                    : record.status === "late"
                                    ? "warning"
                                    : "info"
                                }
                                size="sm"
                              >
                                {record.status.replace("_", " ")}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="px-6 py-4">
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No attendance records found for the selected period</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recent Payroll */}
          {canViewPayroll && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Payroll History
                </h3>
              </div>
              {payrollHistory.length > 0 ? (
                <div className="px-6 py-4">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableCell isHeader>Period</TableCell>
                          <TableCell isHeader>Basic Salary</TableCell>
                          <TableCell isHeader>Allowance</TableCell>
                          <TableCell isHeader>Deduction</TableCell>
                          <TableCell isHeader>Net Salary</TableCell>
                          <TableCell isHeader>Status</TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payrollHistory.slice(0, 6).map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>
                              {record.month} {record.year}
                            </TableCell>
                            <TableCell>
                              $
                              {parseFloat(record.basic_salary).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              ${parseFloat(record.allowance).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              ${parseFloat(record.deduction).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              ${parseFloat(record.net_salary).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                color={
                                  record.status === "paid"
                                    ? "success"
                                    : record.status === "failed"
                                    ? "error"
                                    : "warning"
                                }
                                size="sm"
                              >
                                {record.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="px-6 py-4">
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No payroll history found</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EmployeeFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          employee={employee}
        />
      )}

      {/* Terminate Modal */}
      {isTerminateModalOpen && (
        <TerminateEmployeeModal
          isOpen={isTerminateModalOpen}
          onClose={() => setIsTerminateModalOpen(false)}
          employee={employee}
          onSuccess={() => {
            // Refetch employee data to update status
            window.location.reload();
          }}
        />
      )}

      {/* Resign Modal */}
      {isResignModalOpen && (
        <ResignEmployeeModal
          isOpen={isResignModalOpen}
          onClose={() => setIsResignModalOpen(false)}
          employee={employee}
          onSuccess={() => {
            // Refetch employee data to update status
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
