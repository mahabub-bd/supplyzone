import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import PaymentList from "./PaymentList";

export default function PaymentsPage() {
  return (
    <div>
      <PageMeta title="Payment List" description="View all payments" />
      <PageBreadcrumb pageTitle="Payment List" />

      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/3">
        <PaymentList />
      </div>
    </div>
  );
}
