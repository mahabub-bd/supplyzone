import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import AttendanceSummaryReport from "./components/AttendanceSummaryReport";

export default function AttendanceSummaryPage() {
  return (
    <div>
      <PageMeta
        title="Attendance Summary"
        description="Employee attendance summary report"
      />
      <PageBreadcrumb pageTitle="Attendance Summary" />

      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/3">
        <AttendanceSummaryReport />
      </div>
    </div>
  );
}
