import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import PermissionList from "./components/PermissionList";

export default function PermissionsPage() {
  return (
    <div>
      <PageMeta title="Permissions" description="Permissions" />
      <PageBreadcrumb pageTitle="Permissions" />

      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/3">
        <PermissionList />
      </div>
    </div>
  );
}
