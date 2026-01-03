import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import StockReportView from "./components/StockReportView";

export default function StockReportPage() {
  return (
    <div>
      {/* Page SEO Meta */}
      <PageMeta
        title="Stock Report"
        description="View and generate stock reports"
      />

      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Stock Report" />

      {/* Page Container */}
      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/5">
        {/* Stock Report View */}
        <StockReportView />
      </div>
    </div>
  );
}
