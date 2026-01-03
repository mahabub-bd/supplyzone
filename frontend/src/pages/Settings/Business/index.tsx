import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import BusinessSettings from "./BusinessSettings";

export default function BusinessSettingsPage() {
  return (
    <div>
      {/* 🔹 Page SEO Meta */}
      <PageMeta
        title="Business Settings"
        description="Configure your business information and preferences"
      />

      {/* 🔹 Breadcrumb */}
      <PageBreadcrumb pageTitle="Business Settings" />

      {/* 🔹 Page Container */}
      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/5">
        {/* 🔹 Business Settings Form Component */}
        <BusinessSettings />
      </div>
    </div>
  );
}
