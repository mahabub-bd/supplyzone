import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import InventoryReportView from "./components/InventoryReportView";

export default function InventoryReportPage() {
  return (
    <div>
      {/* Page SEO Meta */}
      <PageMeta
        title="Inventory Report"
        description="View and generate inventory reports"
      />

      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Inventory Report" />

      {/* Page Container */}
      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/5">
        {/* Inventory Report View */}
        <InventoryReportView />
      </div>
    </div>
  );
}
