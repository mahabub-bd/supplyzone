import { useParams } from "react-router-dom";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import PurchaseDetail from "./PurchaseDetail";

export default function PurchaseDetailPage() {
  const { id } = useParams();

  return (
    <div>
      <PageMeta title="Purchase Details" description="Purchase Details" />
      <PageBreadcrumb pageTitle={`Purchase #${id}`} />

      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/3">
        <PurchaseDetail purchaseId={id as string} />
      </div>
    </div>
  );
}
