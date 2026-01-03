import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import RoleList from "./components/RoleList";

export default function RolesPage() {
  return (
    <div>
      <PageMeta title="Roles List" description="Roles List" />

      <PageBreadcrumb pageTitle="Roles" />

      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/3">
        <RoleList />
      </div>
    </div>
  );
}
