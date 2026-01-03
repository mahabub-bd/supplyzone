import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import OvertimeReportView from "./components/OvertimeReportView";

export default function OvertimeReportPage() {
  return (
    <div>
      <PageMeta
        title="Overtime Report"
        description="Employee overtime report"
      />
      <PageBreadcrumb pageTitle="Overtime Report" />

      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/3">
        <OvertimeReportView />
      </div>
    </div>
  );
}
