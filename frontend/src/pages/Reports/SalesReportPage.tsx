import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import SalesReportView from "./components/sales-report/SalesReportView";

export default function SalesReportPage() {
  return (
    <div>
      {/* Page SEO Meta */}
      <PageMeta
        title="Sales Report"
        description="View and generate sales reports"
      />

      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Sales Report" />

      {/* Page Container */}
      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/5">
        {/* Sales Report View */}
        <SalesReportView />
      </div>
    </div>
  );
}
