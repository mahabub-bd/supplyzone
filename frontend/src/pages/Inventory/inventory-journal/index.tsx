import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import InventoryJournalList from "./InventoryJournalList";

export default function InventoryJournalPage() {
  return (
    <div>
      <PageMeta
        title="Inventory Journal"
        description="View inventory ledger with debit, credit, and balance"
      />
      <PageBreadcrumb pageTitle="Inventory Journal" />

      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Inventory Journal
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Track all inventory transactions with running balance ledger
            </p>
          </div>
        </div>

        <InventoryJournalList />
      </div>
    </div>
  );
}
