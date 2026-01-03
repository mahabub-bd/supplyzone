
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import InventoryListBatchWise from "./InventoryList";

export default function InventoryPageBatchWise() {
  return (
    <div>
      <PageMeta title="Inventory" description="Inventory Stock List" />
      <PageBreadcrumb pageTitle="Inventory" />

      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/3">
        <InventoryListBatchWise />
      </div>
    </div>
  );
}
