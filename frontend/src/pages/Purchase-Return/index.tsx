import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import PurchaseReturnList from "./components/PurchaseReturnList";

export default function PurchaseReturnPage() {
  return (
    <div>
      <PageMeta title="Purchases Return" description="Purchase ReturnList" />
      <PageBreadcrumb pageTitle="Purchases Return" />

      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/3">
        <PurchaseReturnList />
      </div>
    </div>
  );
}
