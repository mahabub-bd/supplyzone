import { CheckCircle, Clock, Search, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import Loading from "../../../components/common/Loading";
import PageHeader from "../../../components/common/PageHeader";
import Input from "../../../components/form/input/InputField";
import Badge from "../../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  useApproveLeaveRequestMutation,
  useGetPendingLeaveApprovalsQuery,
  useRejectLeaveRequestMutation,
} from "../../../features/leave/leaveApi";
import { useHasPermission } from "../../../hooks/useHasPermission";
import { formatDate, getLeaveTypeColor } from "../../../utlis";

const leaveTypeLabels = {
  annual: "Annual Leave",
  sick: "Sick Leave",
  maternity: "Maternity Leave",
  paternity: "Paternity Leave",
  unpaid: "Unpaid Leave",
  compassionate: "Compassionate Leave",
};

export default function LeaveApprovalsList() {
  const [searchInput, setSearchInput] = useState("");
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [approverNotes, setApproverNotes] = useState("");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  const { data, isLoading, isError, refetch } = useGetPendingLeaveApprovalsQuery();
  const [approveLeaveRequest, { isLoading: isApproving }] = useApproveLeaveRequestMutation();
  const [rejectLeaveRequest, { isLoading: isRejecting }] = useRejectLeaveRequestMutation();

  const pendingApprovals = data?.data?.pending_requests || [];

  const canApprove = useHasPermission("hrm.leave_approvals.approve");

  // Filter pending approvals based on search input
  const filteredApprovals = pendingApprovals.filter((request) => {
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

  const handleApprove = async () => {
    if (!selectedLeaveRequest) return;

    try {
      await approveLeaveRequest({
        leaveRequestId: selectedLeaveRequest,
        body: { approverNotes: approverNotes || undefined },
      }).unwrap();
      toast.success("Leave request approved successfully");
      setShowApprovalModal(false);
      setApproverNotes("");
      setSelectedLeaveRequest(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to approve leave request");
    }
  };

  const handleReject = async () => {
    if (!selectedLeaveRequest || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      await rejectLeaveRequest({
        leaveRequestId: selectedLeaveRequest,
        body: { rejectionReason },
      }).unwrap();
      toast.success("Leave request rejected successfully");
      setShowRejectionModal(false);
      setRejectionReason("");
      setSelectedLeaveRequest(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to reject leave request");
    }
  };

  const openApprovalModal = (id: number) => {
    setSelectedLeaveRequest(id);
    setShowApprovalModal(true);
  };

  const openRejectionModal = (id: number) => {
    setSelectedLeaveRequest(id);
    setShowRejectionModal(true);
  };

  if (isLoading) return <Loading message="Loading Pending Approvals" />;

  if (isError)
    return (
      <p className="p-6 text-red-500">Failed to fetch pending approvals.</p>
    );

  return (
    <>
      <PageHeader
        title="Leave Approvals"
        icon={<CheckCircle size={16} />}
      />

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative max-w-md">
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
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-[#1e1e1e]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/5">
              <TableRow>
                <TableCell isHeader>Employee</TableCell>
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
                <TableCell isHeader>Workflow</TableCell>
                <TableCell isHeader className="text-right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredApprovals.length > 0 ? (
                filteredApprovals.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="table-body font-medium">
                      <div>
                        <div>
                          {request.employee
                            ? `${request.employee.first_name} ${request.employee.last_name}`
                            : "N/A"}
                        </div>
                        {request.employee?.employee_code && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {request.employee.employee_code}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Requested: {formatDate(request.requested_at)}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="table-body hidden sm:table-cell">
                      <Badge
                        color={getLeaveTypeColor(request.leave_type)}
                        size="sm"
                      >
                        {leaveTypeLabels[request.leave_type as keyof typeof leaveTypeLabels] ||
                          request.leave_type}
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
                      <span className="text-sm font-medium">{request.days_count}</span>
                    </TableCell>

                    <TableCell className="table-body hidden xl:table-cell">
                      <div className="max-w-xs truncate text-sm" title={request.reason}>
                        {request.reason}
                      </div>
                    </TableCell>

                    <TableCell className="table-body">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-yellow-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Step {request.workflow_current_step} of {request.workflow_total_steps}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-2 py-3 sm:px-4">
                      <div className="flex justify-end gap-1">
                        {canApprove && (
                          <>
                            <button
                              onClick={() => openApprovalModal(request.id)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg dark:text-green-400 dark:hover:bg-green-900/20"
                              title="Approve"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => openRejectionModal(request.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg dark:text-red-400 dark:hover:bg-red-900/20"
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    {searchInput
                      ? "No pending approvals match your search"
                      : "No pending leave approvals"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md dark:bg-[#1e1e1e]">
            <h3 className="text-lg font-semibold mb-4">Approve Leave Request</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Approver Notes (Optional)
              </label>
              <textarea
                value={approverNotes}
                onChange={(e) => setApproverNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-[#2a2a2a] dark:border-white/10"
                rows={3}
                placeholder="Add any notes for this approval..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setApproverNotes("");
                  setSelectedLeaveRequest(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isApproving ? "Approving..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md dark:bg-[#1e1e1e]">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <XCircle className="text-red-500" size={20} />
              Reject Leave Request
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-[#2a2a2a] dark:border-white/10"
                rows={4}
                placeholder="Please provide a reason for rejection..."
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setRejectionReason("");
                  setSelectedLeaveRequest(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isRejecting || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isRejecting ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}