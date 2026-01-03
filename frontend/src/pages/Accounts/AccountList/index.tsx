import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import AccountList from "./components/AccountList";

export default function AccountListPage() {
  return (
    <div>
      <PageMeta title="Account List" description="Chart of Accounts" />
      <PageBreadcrumb pageTitle="Accounts" />

      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/3">
        <AccountList />
      </div>
    </div>
  );
}
