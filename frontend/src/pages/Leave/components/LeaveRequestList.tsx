import {
  Calendar,
  CalendarDays,
  CheckCircle,
  Clock,
  Eye,
  Filter,
  PenTool,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import Loading from "../../../components/common/Loading";
import PageHeader from "../../../components/common/PageHeader";
import DatePicker from "../../../components/form/date-picker";
import { SelectField } from "../../../components/form/form-elements/SelectFiled";
import Input from "../../../components/form/input/InputField";
import Badge from "../../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useGetBranchesQuery } from "../../../features/branch/branchApi";
import { useGetEmployeesQuery } from "../../../features/employee/employeeApi";
import {
  useDeleteLeaveRequestMutation,
  useGetLeaveRequestsQuery,
  useGetLeaveSummaryQuery,
} from "../../../features/leave/leaveApi";
import { useHasPermission } from "../../../hooks/useHasPermission";
import { useModal } from "../../../hooks/useModal";
import { LeaveStatus, LeaveType } from "../../../types";
import {
  formatDate,
  getLeaveTypeColor,
  getStatusColorLeave,
} from "../../../utlis";
import LeaveRequestModal from "./LeaveRequestModal";

const leaveTypeOptions = [
  { id: "annual", name: "Annual Leave" },
  { id: "sick", name: "Sick Leave" },
  { id: "maternity", name: "Maternity Leave" },
  { id: "paternity", name: "Paternity Leave" },
  { id: "unpaid", name: "Unpaid Leave" },
  { id: "compassionate", name: "Compassionate Leave" },
];

const leaveStatusOptions = [
  { id: "pending", name: "Pending" },
  { id: "approved", name: "Approved" },
  { id: "rejected", name: "Rejected" },
  { id: "cancelled", name: "Cancelled" },
];

export default function LeaveRequestList() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // 🔹 Use the useModal hook for modal state management
  const formModal = useModal();
  const deleteModal = useModal();

  const [leaveRequestToDelete, setLeaveRequestToDelete] = useState<{
    id: number;
    employeeName: string;
  } | null>(null);

  const { data, isLoading, isError } = useGetLeaveRequestsQuery({
    employee_id: selectedEmployee ? Number(selectedEmployee) : undefined,
    branch_id: selectedBranch ? Number(selectedBranch) : undefined,
    status: selectedStatus as LeaveStatus,
    leave_type: selectedLeaveType as LeaveType,
    start_date: startDate ? startDate.toISOString().split("T")[0] : undefined,
    end_date: endDate ? endDate.toISOString().split("T")[0] : undefined,
  });

  const { data: summaryData } = useGetLeaveSummaryQuery({
    year: new Date().getFullYear(),
    start_date: startDate ? startDate.toISOString().split("T")[0] : undefined,
    end_date: endDate ? endDate.toISOString().split("T")[0] : undefined,
    branch_id: selectedBranch ? Number(selectedBranch) : undefined,
    employee_id: selectedEmployee ? Number(selectedEmployee) : undefined,
  });

  const { data: employeesData } = useGetEmployeesQuery();
  const { data: branchesData } = useGetBranchesQuery();
  const [deleteLeaveRequest] = useDeleteLeaveRequestMutation();

  const leaveRequests = data?.data || [];
  const employees = employeesData?.data || [];
  const branches = branchesData?.data || [];
  const summary = summaryData?.data;

  const canUpdate = useHasPermission("hrm.leave_requests.update");
  const canDelete = useHasPermission("hrm.leave_requests.delete");

  // Filter leave requests based on search input
  const filteredLeaveRequests = leaveRequests.filter((request) => {
    const searchLower = searchInput.toLowerCase();
    const employeeName = request.employee
      ? `${request.employee.first_name} ${request.employee.last_name}`.toLowerCase()
      : "";
    return (
      employeeName.includes(searchLower) ||
      request.reason?.toLowerCase().includes(searchLower) ||
      request.leave_type?.toLowerCase().includes(searchLower)
    );
  });

  const openDeleteDialog = (id: number, employeeName: string) => {
    setLeaveRequestToDelete({ id, employeeName });
    deleteModal.openModal();
  };

  const confirmDelete = async () => {
    if (!leaveRequestToDelete) return;

    try {
      await deleteLeaveRequest(leaveRequestToDelete.id).unwrap();
      toast.success("Leave request deleted successfully");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete leave request");
    } finally {
      deleteModal.closeModal();
      setLeaveRequestToDelete(null);
    }
  };

  if (isLoading) return <Loading message="Loading Leave Requests" />;

  if (isError)
    return <p className="p-6 text-red-500">Failed to fetch leave requests.</p>;

  return (
    <>
      <PageHeader
        title="Leave Requests"
        icon={<Calendar size={16} />}
        addLabel="New Leave Request"
        onAdd={formModal.openModal}
        permission="leave.create"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Total Requests Card */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-200 dark:border-white/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Total Requests
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                {summary?.total_requests || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Calendar
                className="text-blue-600 dark:text-blue-400"
                size={24}
              />
            </div>
          </div>
        </div>

        {/* Pending Requests Card */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-200 dark:border-white/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Pending Requests
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                {summary?.pending_requests || 0}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Clock
                className="text-yellow-600 dark:text-yellow-400"
                size={24}
              />
            </div>
          </div>
        </div>

        {/* Approved Requests Card */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-200 dark:border-white/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Approved Requests
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                {summary?.approved_requests || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircle
                className="text-green-600 dark:text-green-400"
                size={24}
              />
            </div>
          </div>
        </div>

        {/* Days Taken Card */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-200 dark:border-white/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Days Taken
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                {summary?.total_days_taken || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <CalendarDays
                className="text-purple-600 dark:text-purple-400"
                size={24}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 space-y-4">
        {/* Search and Date Filters Bar */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
              size={20}
            />
            <Input
              type="text"
              placeholder="Search by employee name or reason..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>

          <DatePicker
            id="leave-start-date"
            mode="single"
            value={startDate}
            onChange={(date) => setStartDate(date as Date | null)}
            placeholder="Start Date"
            disableFuture={false}
          />

          <DatePicker
            id="leave-end-date"
            mode="single"
            value={endDate}
            onChange={(date) => setEndDate(date as Date | null)}
            placeholder="End Date"
            disableFuture={false}
          />

          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
            <Filter size={16} />
            Filters
          </button>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <SelectField
            label=""
            data={[
              { id: "", name: "All Employees" },
              ...employees.map((emp) => ({
                id: emp.id,
                name: `${emp.first_name} ${emp.last_name}`,
              })),
            ]}
            value={selectedEmployee}
            onChange={setSelectedEmployee}
          />

          <SelectField
            label=""
            data={[
              { id: "", name: "All Branches" },
              ...branches.map((branch) => ({
                id: branch.id,
                name: branch.name,
              })),
            ]}
            value={selectedBranch}
            onChange={setSelectedBranch}
          />

          <SelectField
            label=""
            data={[{ id: "", name: "All Status" }, ...leaveStatusOptions]}
            value={selectedStatus}
            onChange={setSelectedStatus}
          />

          <SelectField
            label=""
            data={[{ id: "", name: "All Leave Types" }, ...leaveTypeOptions]}
            value={selectedLeaveType}
            onChange={setSelectedLeaveType}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-[#1e1e1e]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/5">
              <TableRow>
                <TableCell isHeader>Employee</TableCell>
                <TableCell isHeader>ID</TableCell>
                <TableCell isHeader className="hidden sm:table-cell">
                  Leave Type
                </TableCell>
                <TableCell isHeader className="hidden md:table-cell">
                  Duration
                </TableCell>
                <TableCell isHeader className="hidden lg:table-cell">
                  Days
                </TableCell>
                <TableCell isHeader className="hidden xl:table-cell">
                  Reason
                </TableCell>
                <TableCell isHeader>Status</TableCell>
                <TableCell isHeader className="text-right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredLeaveRequests.length > 0 ? (
                filteredLeaveRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="table-body font-medium">
                      <div>
                        <div>
                          {request.employee
                            ? `${request.employee.first_name} ${request.employee.last_name}`
                            : "N/A"}
                        </div>

                        {request.branch && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {request.branch.name}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.employee?.employee_code && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {request.employee.employee_code}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="table-body hidden sm:table-cell">
                      <Badge
                        color={getLeaveTypeColor(request.leave_type)}
                        size="sm"
                      >
                        {leaveTypeOptions.find(
                          (type) => type.id === request.leave_type
                        )?.name || request.leave_type}
                      </Badge>
                    </TableCell>

                    <TableCell className="table-body hidden md:table-cell">
                      <div className="text-sm">
                        <div>{formatDate(request.start_date)}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          to {formatDate(request.end_date)}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="table-body hidden lg:table-cell">
                      <span className="text-sm font-medium">
                        {request.days_count}
                      </span>
                    </TableCell>

                    <TableCell className="table-body hidden xl:table-cell">
                      <div
                        className="max-w-xs truncate text-sm"
                        title={request.reason}
                      >
                        {request.reason}
                      </div>
                    </TableCell>

                    <TableCell className="table-body">
                      <Badge
                        color={getStatusColorLeave(request.status)}
                        size="sm"
                      >
                        {leaveStatusOptions.find(
                          (status) => status.id === request.status
                        )?.name || request.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-2 py-3 sm:px-4">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => {
                            // Navigate to detail view
                            navigate(`/hrm/leave-requests/${request.id}`);
                          }}
                          className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg dark:text-gray-400 dark:hover:bg-gray-700"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {canUpdate && (
                          <button
                            onClick={() => {
                              // TODO: Open edit modal
                              toast.info(
                                "Edit functionality will be implemented"
                              );
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg dark:text-blue-400 dark:hover:bg-blue-900/20"
                            title="Edit"
                          >
                            <PenTool size={16} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() =>
                              openDeleteDialog(
                                request.id,
                                request.employee
                                  ? `${request.employee.first_name} ${request.employee.last_name}`
                                  : "Unknown Employee"
                              )
                            }
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg dark:text-red-400 dark:hover:bg-red-900/20"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    {searchInput ||
                    selectedEmployee ||
                    selectedStatus ||
                    selectedLeaveType
                      ? "No leave requests match your search"
                      : "No leave requests found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Leave Request Modal */}
      <LeaveRequestModal
        isOpen={formModal.isOpen}
        onClose={formModal.closeModal}
      />

      {/* Delete Confirmation Dialog */}
      {canDelete && (
        <ConfirmDialog
          isOpen={deleteModal.isOpen}
          title="Delete Leave Request"
          message={`Are you sure you want to delete the leave request for "${leaveRequestToDelete?.employeeName}"?`}
          confirmLabel="Yes, Delete"
          cancelLabel="Cancel"
          onConfirm={confirmDelete}
          onCancel={deleteModal.closeModal}
        />
      )}
    </>
  );
}
