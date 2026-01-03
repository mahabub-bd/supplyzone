import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import LeaveRequestList from "./components/LeaveRequestList";

export default function LeaveRequestPage() {
  return (
    <div>
      <PageMeta
        title="Leave Requests"
        description="Employee leave requests management"
      />
      <PageBreadcrumb pageTitle="Leave Requests" />

      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/3">
        <LeaveRequestList />
      </div>
    </div>
  );
}