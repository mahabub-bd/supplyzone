import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ReceiptSettings from "./ReceiptSettings";

export default function ReceiptSettingsPage() {
  return (
    <div>
      {/* 🔹 Page SEO Meta */}
      <PageMeta
        title="Receipt Settings"
        description="Configure receipt appearance and preview settings"
      />

      {/* 🔹 Breadcrumb */}
      <PageBreadcrumb pageTitle="Receipt Settings" />

      {/* 🔹 Page Container */}
      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/5">
        {/* 🔹 Receipt Settings Component */}
        <ReceiptSettings />
      </div>
    </div>
  );
}
