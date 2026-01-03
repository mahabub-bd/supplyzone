import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ExpenseCategoryList from "./components/ExpenseCategoryList";

export default function ExpenseCategoryPage() {
  return (
    <div>
      <PageMeta
        title="Expense Category List"
        description="Expense Category List"
      />
      <PageBreadcrumb pageTitle="Expense Category" />

      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/3">
        <ExpenseCategoryList />
      </div>
    </div>
  );
}
