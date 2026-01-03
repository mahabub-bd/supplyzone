import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import SupplierList from "./components/SupplierList";

export default function SuppliersPage() {
  return (
    <div>
      <PageMeta title="Suppliers List" description="Suppliers List" />
      <PageBreadcrumb pageTitle="Suppliers" />

      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/3">
        <SupplierList />
      </div>
    </div>
  );
}
