import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import CustomerGroupList from "./components/CustomerGroupList";

export default function CustomerGroupPage() {
  return (
    <div>
      <PageMeta title="Customer Group" description="Manage Customer Groups" />
      <PageBreadcrumb pageTitle="Customer Groups" />

      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/3">
        <CustomerGroupList />
      </div>
    </div>
  );
}
