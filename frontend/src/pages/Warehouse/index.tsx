import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import WarehouseList from "./components/WarehouseList";

export default function WarehousePage() {
  return (
    <div>
      <PageMeta title="Warehouses" description="Warehouse List" />
      <PageBreadcrumb pageTitle="Warehouses" />
      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/5">
        <WarehouseList />
      </div>
    </div>
  );
}
