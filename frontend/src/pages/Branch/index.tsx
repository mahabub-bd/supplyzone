import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import BranchList from "./components/BranchList";


export default function BranchPage() {
  return (
    <div>
      <PageMeta title="Branch List" description="Branch List" />
      <PageBreadcrumb pageTitle="Branch" />

      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/3">
        <BranchList />
      </div>
    </div>
  );
}