import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import PurchaseList from "./components/PurchaseList";

export default function PurchasePage() {
  return (
    <div>
      <PageMeta title="Purchases" description="Purchase List" />
      <PageBreadcrumb pageTitle="Purchases" />

      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/3">
        <PurchaseList />
      </div>
    </div>
  );
}
