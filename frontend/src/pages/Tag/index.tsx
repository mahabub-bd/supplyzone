import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import TagList from "./components/TagList";

export default function TagPage() {
  return (
    <div>
      <PageMeta title="Tags" description="Tags List" />
      <PageBreadcrumb pageTitle="Tags" />
      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/5">
        <TagList />
      </div>
    </div>
  );
}
