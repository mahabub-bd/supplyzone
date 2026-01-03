import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import EmployeeList from "./components/EmployeeList";

export default function EmployeePage() {
  return (
    <div>
      <PageMeta title="Employees" description="Employees" />
      <PageBreadcrumb pageTitle="Employees" />

      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/3">
        <EmployeeList />
      </div>
    </div>
  );
}
