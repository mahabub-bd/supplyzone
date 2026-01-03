import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import UnitList from "./components/UnitList";

export default function UnitPage() {
  return (
    <div>
      <PageMeta title="Unit List" description="Unit List" />
      <PageBreadcrumb pageTitle="Units" />

      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/3">
        <UnitList />
      </div>
    </div>
  );
}
