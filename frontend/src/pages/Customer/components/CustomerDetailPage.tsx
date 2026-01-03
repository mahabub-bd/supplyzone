import { useParams } from "react-router-dom";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import CustomerDetail from "./CustomerDetail";


export default function CustomerDetailPage() {
  const { id } = useParams();

  return (
    <div>
      <PageMeta title="Customer Details" description="Customer Details" />
      <PageBreadcrumb pageTitle={`Customer #${id}`} />

      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/3">
        <CustomerDetail customerId={id as string} />
      </div>
    </div>
  );
}
