import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import ProfitLossReportView from "./components/profit-loss/ProfitLossReportView";

export default function ProfitLossReportPage() {
  return (
    <div>
      {/* Page SEO Meta */}
      <PageMeta
        title="Profit & Loss Report"
        description="View and generate profit & loss reports"
      />

      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Profit & Loss Report" />

      {/* Page Container */}
      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/5">
        {/* Profit & Loss Report View */}
        <ProfitLossReportView />
      </div>
    </div>
  );
}
