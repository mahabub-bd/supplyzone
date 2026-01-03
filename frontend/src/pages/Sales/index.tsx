import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import SaleList from "./components/SalesList";


export default function SalesPage() {
    return (
        <div>
            {/* 🔹 Page SEO Meta */}
            <PageMeta title="Sales List" description="Sales List" />

            {/* 🔹 Breadcrumb */}
            <PageBreadcrumb pageTitle="Sales" />

            {/* 🔹 Page Container */}
            <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/5">
                {/* 🔹 Sale Table Component */}
                <SaleList />
            </div>
        </div>
    );
}
