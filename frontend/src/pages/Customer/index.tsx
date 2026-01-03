import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import CustomerList from "./components/CustomerList";


export default function CustomerPage() {
    return (
        <div>
            <PageMeta title="Customer List" description="Customer List" />
            <PageBreadcrumb pageTitle="Customers" />

            <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/3">
                <CustomerList />
            </div>
        </div>
    );
}