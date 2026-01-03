import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import EmployeeProfile from "./components/EmployeeProfile";

export default function EmployeeProfilePage() {
  return (
    <div>
      <PageMeta title="Employee Profile" description="Employee Profile Details" />
      <PageBreadcrumb pageTitle="Employee Profile" />

      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/3">
        <EmployeeProfile />
      </div>
    </div>
  );
}