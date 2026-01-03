import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import UserList from "./components/UserList";

export default function UsersPage() {
  return (
    <div>
      <PageMeta title="Users List" description="Users List" />

      <PageBreadcrumb pageTitle="Users" />

      <div className="flex flex-col gap-5  min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/3">
        {/* User Table */}
        <UserList />
      </div>
    </div>
  );
}
