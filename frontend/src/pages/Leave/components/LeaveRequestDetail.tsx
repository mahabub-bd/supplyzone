import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import Loading from "../../../components/common/Loading";
import TextArea from "../../../components/form/input/TextArea";
import Badge from "../../../components/ui/badge/Badge";
import Button from "../../../components/ui/button";
import { Modal } from "../../../components/ui/modal";
import {
  useApproveLeaveRequestMutation,
  useGetLeaveRequestApprovalStatusQuery,
  useGetLeaveRequestByIdQuery,
  useRejectLeaveRequestMutation,
} from "../../../features/leave/leaveApi";
import { useHasPermission } from "../../../hooks/useHasPermission";
import {
  formatDate,
  getLeaveTypeColor,
  getStatusColorLeave,
} from "../../../utlis";

const leaveTypeLabels = {
  annual: "Annual Leave",
  sick: "Sick Leave",
  maternity: "Maternity Leave",
  paternity: "Paternity Leave",
  unpaid: "Unpaid Leave",
  compassionate: "Compassionate Leave",
};

const statusLabels = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

interface ApprovalFormData {
  approver_notes: string;
}

interface RejectionFormData {
  rejection_reason: string;
}

export default function LeaveRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [leaveRequest, setLeaveRequest] = useState<any>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  const { register: registerApproval, handleSubmit: handleSubmitApproval, reset: resetApproval } =
    useForm<ApprovalFormData>({
      defaultValues: {
        approver_notes: "",
      },
    });

  const { register: registerRejection, handleSubmit: handleSubmitRejection, reset: resetRejection, watch } =
    useForm<RejectionFormData>({
      defaultValues: {
        rejection_reason: "",
      },
    });

  const rejectionReason = watch("rejection_reason");

  const { data, isLoading, isError } = useGetLeaveRequestByIdQuery(id || "", {
    skip: !id,
  });

  const { data: approvalStatusData } = useGetLeaveRequestApprovalStatusQuery(
    id || "",
    {
      skip: !id,
    }
  );

  const [approveLeaveRequest, { isLoading: isApproving }] =
    useApproveLeaveRequestMutation();
  const [rejectLeaveRequest, { isLoading: isRejecting }] =
    useRejectLeaveRequestMutation();

  const canApprove = useHasPermission("leave.approve");

  useEffect(() => {
    if (data?.data) {
      setLeaveRequest(data.data);
    }
  }, [data]);

  const handleApprove = async (data: ApprovalFormData) => {
    if (!id) return;

    try {
      await approveLeaveRequest({
        leaveRequestId: Number(id),
        body: { approverNotes: data.approver_notes || undefined },
      }).unwrap();
      toast.success("Leave request approved successfully");
      setShowApprovalModal(false);
      resetApproval();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to approve leave request");
    }
  };

  const handleReject = async (data: RejectionFormData) => {
    if (!id || !data.rejection_reason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      await rejectLeaveRequest({
        leaveRequestId: Number(id),
        body: { rejectionReason: data.rejection_reason },
      }).unwrap();
      toast.success("Leave request rejected successfully");
      setShowRejectionModal(false);
      resetRejection();
      navigate("/hrm/leave-approvals");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to reject leave request");
    }
  };

  if (isLoading) return <Loading message="Loading Leave Request Details" />;

  if (isError) {
    return (
      <div className="p-6">
        <Button
          onClick={() => navigate("/hrm/leave-requests")}
          className="mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Leave Requests
        </Button>
        <p className="text-red-500">Failed to load leave request details.</p>
      </div>
    );
  }

  if (!leaveRequest) {
    return (
      <div className="p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/hrm/leave-requests")}
          className="mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Leave Requests
        </Button>
        <p className="text-gray-500">Leave request not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between">
        {/* Action Buttons */}
        {canApprove && leaveRequest.status === "pending" && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowRejectionModal(true)}
              className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <XCircle size={16} className="mr-2" />
              Reject
            </Button>
            <Button
              size="sm"
              onClick={() => setShowApprovalModal(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle size={16} className="mr-2" />
              Approve
            </Button>
          </div>
        )}
        <Button
          size="sm"
          onClick={() => navigate("/hrm/leave-requests")}
          className="mb-6"
        >
          <ArrowLeft size={12} className="mr-2" />
          Leave Requests List
        </Button>
      </div>
      {/* Back Button */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Leave Request Header */}
          <div className="bg-white rounded-xl p-6 dark:bg-[#1e1e1e] border border-gray-200 dark:border-white/5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Leave Request Details
                </h1>
                <div className="flex items-center gap-2">
                  <Badge
                    color={getStatusColorLeave(leaveRequest.status)}
                    size="sm"
                  >
                    {statusLabels[
                      leaveRequest.status as keyof typeof statusLabels
                    ] || leaveRequest.status}
                  </Badge>
                  <Badge
                    color={getLeaveTypeColor(leaveRequest.leave_type)}
                    size="sm"
                  >
                    {leaveTypeLabels[
                      leaveRequest.leave_type as keyof typeof leaveTypeLabels
                    ] || leaveRequest.leave_type}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Duration and Days */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Duration
                </label>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-sm">
                    {formatDate(leaveRequest.start_date)} -{" "}
                    {formatDate(leaveRequest.end_date)}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Days
                </label>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-sm font-medium">
                    {leaveRequest.days_count} days
                  </span>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="mt-4">
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Reason for Leave
              </label>
              <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                {leaveRequest.reason || "No reason provided"}
              </p>
            </div>

            {/* Approval Details */}
            {(leaveRequest.approver_notes ||
              leaveRequest.rejection_reason ||
              leaveRequest.approved_date) && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Approval Details
                </h3>
                {leaveRequest.approved_date && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <strong>Approved Date:</strong>{" "}
                    {formatDate(leaveRequest.approved_date)}
                  </p>
                )}
                {leaveRequest.approver_notes && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <strong>Approver Notes:</strong>{" "}
                    {leaveRequest.approver_notes}
                  </p>
                )}
                {leaveRequest.rejection_reason && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Rejection Reason:</strong>{" "}
                    {leaveRequest.rejection_reason}
                  </p>
                )}
              </div>
            )}

            {/* Workflow Information */}
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Requested on: {formatDate(leaveRequest.created_at)}</span>
              {leaveRequest.updated_at && (
                <span>Last updated: {formatDate(leaveRequest.updated_at)}</span>
              )}
            </div>
          </div>

          {/* Leave Balance Information */}
          {leaveRequest.leave_balance && (
            <div className="bg-white rounded-xl p-6 dark:bg-[#1e1e1e] border border-gray-200 dark:border-white/5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Leave Balance ({leaveRequest.leave_balance.year})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(leaveRequest.leave_balance.entitlements)
                  .filter(([type]) => {
                    // Hide maternity leave for male employees
                    if (
                      leaveRequest.employee?.gender === "male" &&
                      type === "maternity"
                    ) {
                      return false;
                    }
                    return true;
                  })
                  .map(([type, entitlement]) => {
                    const used =
                      Number(
                        leaveRequest.leave_balance.used[
                          type as keyof typeof leaveRequest.leave_balance.used
                        ]
                      ) || 0;
                    const available =
                      Number(
                        leaveRequest.leave_balance.available[
                          type as keyof typeof leaveRequest.leave_balance.available
                        ]
                      ) || 0;
                    return (
                      <div
                        key={type}
                        className="border border-gray-200 dark:border-white/5 rounded-lg p-3"
                      >
                        <h3 className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300 mb-2">
                          {leaveTypeLabels[
                            type as keyof typeof leaveTypeLabels
                          ]?.replace(" Leave", "") || type}
                        </h3>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Entitled:
                            </span>
                            <span className="font-medium">
                              {Number(entitlement) || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Used:
                            </span>
                            <span className="font-medium text-orange-600">
                              {used}
                            </span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-white/5">
                            <span className="text-gray-600 dark:text-400">
                              Available:
                            </span>
                            <span className="font-medium text-green-600">
                              {available}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Employee Information */}
          <div className="bg-white rounded-xl p-6 dark:bg-[#1e1e1e] border border-gray-200 dark:border-white/5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Employee Information
            </h2>
            {leaveRequest.employee && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center dark:bg-blue-900/20">
                    <User
                      size={20}
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {leaveRequest.employee.first_name}{" "}
                      {leaveRequest.employee.last_name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {leaveRequest.employee.employee_code}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      Email:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {leaveRequest.employee.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      Phone:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {leaveRequest.employee.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      Department:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {leaveRequest.employee.department?.name || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      Designation:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {leaveRequest.employee.designation?.title || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      Status:
                    </span>
                    <span className="capitalize text-gray-900 dark:text-white">
                      {leaveRequest.employee.status}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Branch Information */}
          {leaveRequest.branch && (
            <div className="bg-white rounded-xl p-6 dark:bg-[#1e1e1e] border border-gray-200 dark:border-white/5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Branch Information
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {leaveRequest.branch.name}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {leaveRequest.branch.address}
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Code:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {leaveRequest.branch.code}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Phone:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {leaveRequest.branch.phone}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Email:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {leaveRequest.branch.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Approval Status */}
          {approvalStatusData?.data && (
            <div className="bg-white rounded-xl p-6 dark:bg-[#1e1e1e] border border-gray-200 dark:border-white/5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Approval Status
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Status:
                  </span>
                  <Badge
                    color={
                      approvalStatusData.data.status === "approved"
                        ? "success"
                        : approvalStatusData.data.status === "rejected"
                        ? "error"
                        : "warning"
                    }
                    size="sm"
                  >
                    {approvalStatusData.data.status.charAt(0).toUpperCase() +
                      approvalStatusData.data.status.slice(1)}
                  </Badge>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Approval Level:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {approvalStatusData.data.currentApprovalLevel} of{" "}
                    {approvalStatusData.data.totalApprovalLevels}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Fully Approved:
                  </span>
                  <span
                    className={`font-medium ${
                      approvalStatusData.data.isFullyApproved
                        ? "text-green-600"
                        : "text-orange-600"
                    }`}
                  >
                    {approvalStatusData.data.isFullyApproved ? "Yes" : "No"}
                  </span>
                </div>

                {approvalStatusData.data.currentApproverName && (
                  <div className="pt-3 border-t border-gray-200 dark:border-white/5">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Current Approver:
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {approvalStatusData.data.currentApproverName}
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200 dark:border-white/5 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Leave Type:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {leaveTypeLabels[
                        approvalStatusData.data
                          .leaveType as keyof typeof leaveTypeLabels
                      ] || approvalStatusData.data.leaveType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Duration:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {formatDate(approvalStatusData.data.startDate)} -{" "}
                      {formatDate(approvalStatusData.data.endDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Days:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {approvalStatusData.data.daysCount} days
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Workflow Status */}
          {(leaveRequest.currentApprovalLevel !== null ||
            leaveRequest.totalApprovalLevels !== null) && (
            <div className="bg-white rounded-xl p-6 dark:bg-[#1e1e1e] border border-gray-200 dark:border-white/5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Workflow Status
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Current Step:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {leaveRequest.currentApprovalLevel || 0} of{" "}
                    {leaveRequest.totalApprovalLevels || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Completed Steps:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {leaveRequest.completedApprovalLevels}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Multi-level:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {leaveRequest.requiresMultiLevelApproval ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false);
          resetApproval();
        }}
        title="Approve Leave Request"
        description="Are you sure you want to approve this leave request?"
        className="max-w-md"
      >
        <form onSubmit={handleSubmitApproval(handleApprove)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Approver Notes (Optional)
            </label>
            <TextArea
              {...registerApproval("approver_notes")}
              rows={3}
              placeholder="Add any notes for this approval..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowApprovalModal(false);
                resetApproval();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isApproving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isApproving ? "Approving..." : "Approve"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Rejection Modal */}
      <Modal
        isOpen={showRejectionModal}
        onClose={() => {
          setShowRejectionModal(false);
          resetRejection();
        }}
        title="Reject Leave Request"
        description="Please provide a reason for rejecting this leave request"
        className="max-w-md"
      >
        <form onSubmit={handleSubmitRejection(handleReject)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <TextArea
              {...registerRejection("rejection_reason")}
              rows={4}
              placeholder="Please provide a reason for rejection..."
              error={!rejectionReason.trim()}
              hint={
                rejectionReason.trim() === ""
                  ? "Rejection reason is required"
                  : ""
              }
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowRejectionModal(false);
                resetRejection();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isRejecting || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRejecting ? "Rejecting..." : "Reject"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
