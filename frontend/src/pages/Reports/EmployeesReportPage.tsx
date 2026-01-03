import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import EmployeesReportView from "./components/EmployeesReportView";

export default function EmployeesReportPage() {
  return (
    <div>
      {/* Page SEO Meta */}
      <PageMeta
        title="Employees Report"
        description="View and generate employees reports"
      />

      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Employees Report" />

      {/* Page Container */}
      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/5">
        {/* Employees Report View */}
        <EmployeesReportView />
      </div>
    </div>
  );
}
