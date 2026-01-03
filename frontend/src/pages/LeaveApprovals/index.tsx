import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import LeaveApprovalsList from "./components/LeaveApprovalsList";

export default function LeaveApprovalsPage() {
  return (
    <div>
      <PageMeta
        title="Leave Approvals"
        description="Approve or reject employee leave requests"
      />
      <PageBreadcrumb pageTitle="Leave Approvals" />

      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/3">
        <LeaveApprovalsList />
      </div>
    </div>
  );
}