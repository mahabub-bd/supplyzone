import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentList from "./components/ComponentList";

export default function ComponentPage() {
  return (
    <div>
      <PageMeta title="Components List" description="Components List" />
      <PageBreadcrumb pageTitle="Components" />

      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/3">
        <ComponentList />
      </div>
    </div>
  );
}
