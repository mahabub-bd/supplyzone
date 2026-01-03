import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ProductList from "./components/ProductList";

export default function ProductPage() {
  return (
    <div>
      <PageMeta title="Products List" description="Products List" />
      <PageBreadcrumb pageTitle="Products" />

      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/3">
        <ProductList />
      </div>
    </div>
  );
}
