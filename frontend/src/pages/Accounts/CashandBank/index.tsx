import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import AccountListPage from "../AccountList/components/AccountList";

export default function CashandBank() {
  return (
    <div>
      <PageMeta
        title="Cash and Bank Accounts"
        description="Cash and Bank Accounts"
      />
      <PageBreadcrumb pageTitle="Cash and Bank Accounts" />

      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/3">
        <AccountListPage isCashBank />
      </div>
    </div>
  );
}
