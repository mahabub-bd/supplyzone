import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import SummaryReportView from "./components/SummaryReportView";

export default function SummaryReportPage() {
  return (
    <div>
      {/* Page SEO Meta */}
      <PageMeta
        title="Summary Report"
        description="View and generate summary reports"
      />

      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Summary Report" />

      {/* Page Container */}
      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/5">
        {/* Summary Report View */}
        <SummaryReportView />
      </div>
    </div>
  );
}
