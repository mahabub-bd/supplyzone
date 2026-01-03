import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ExpenseReportView from "./components/ExpenseReportView";

export default function ExpenseReportPage() {
  return (
    <div>
      {/* Page SEO Meta */}
      <PageMeta
        title="Expense Report"
        description="View and generate expense reports"
      />

      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Expense Report" />

      {/* Page Container */}
      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/5">
        {/* Expense Report View */}
        <ExpenseReportView />
      </div>
    </div>
  );
}
