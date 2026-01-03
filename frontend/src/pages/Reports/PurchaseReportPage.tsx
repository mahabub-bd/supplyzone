import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import PurchaseReportView from "./components/purchase-report/PurchaseReportView";


export default function PurchaseReportPage() {
  return (
    <div>
      {/* Page SEO Meta */}
      <PageMeta
        title="Purchase Report"
        description="View and generate purchase reports"
      />

      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Purchase Report" />

      {/* Page Container */}
      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/5">
        {/* Purchase Report View */}
        <PurchaseReportView />
      </div>
    </div>
  );
}
