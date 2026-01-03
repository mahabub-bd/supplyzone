import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import CategoryList from "./components/CategoryList";

export default function CategoryPage() {
  return (
    <div>
      <PageMeta title="Categories" description="Category List" />
      <PageBreadcrumb pageTitle="Categories" />

      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/5">
        <CategoryList />
      </div>
    </div>
  );
}
