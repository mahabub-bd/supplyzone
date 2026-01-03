import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ProductsReportView from "./components/ProductsReportView";

export default function ProductsReportPage() {
  return (
    <div>
      {/* Page SEO Meta */}
      <PageMeta
        title="Products Report"
        description="View and generate products reports"
      />

      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Products Report" />

      {/* Page Container */}
      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/5">
        {/* Products Report View */}
        <ProductsReportView />
      </div>
    </div>
  );
}
