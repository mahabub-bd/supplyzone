import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import BackupList from "./components/BackupList";

export default function BackupPage() {
  return (
    <div>
      <PageMeta title="Database Backup" description="Backup Management" />
      <PageBreadcrumb pageTitle="Database Backup" />

      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/3">
        <BackupList />
      </div>
    </div>
  );
}