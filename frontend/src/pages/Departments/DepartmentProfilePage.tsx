import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import DepartmentProfile from "./components/DepartmentProfile";

export default function DepartmentProfilePage() {
  return (
    <div>
      <PageMeta title="Department Profile" description="Department Profile Details" />
      <PageBreadcrumb pageTitle="Department Profile" />

      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/3">
        <DepartmentProfile />
      </div>
    </div>
  );
}