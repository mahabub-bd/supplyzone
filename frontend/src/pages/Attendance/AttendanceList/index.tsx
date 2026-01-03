import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import AttendanceList from "./components/AttendanceList";

export default function AttendanceListPage() {
  return (
    <div>
      <PageMeta title="Attendance" description="Manage employee attendance" />
      <PageBreadcrumb pageTitle="Attendance" />

      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/3">
        <AttendanceList />
      </div>
    </div>
  );
}
