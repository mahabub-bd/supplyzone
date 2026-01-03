import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ReportList from "./components/ReportList";

export default function ReportsPage() {
  return (
    <div>
      {/* Page SEO Meta */}
      <PageMeta title="Reports" description="Manage and generate business reports" />

      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Reports" />

      {/* Page Container */}
      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/5">
        {/* Report List Component */}
        <ReportList />
      </div>
    </div>
  );
}
