import { useState } from "react";
import Loading from "../../../../components/common/Loading";
import { SelectField } from "../../../../components/form/form-elements/SelectFiled";
import Pagination from "../../../../components/ui/pagination/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import {
  useGetAccountJournalQuery,
  useGetAccountsQuery,
} from "../../../../features/accounts/accountsApi";

export default function JournalList() {
  const [selectedAccountCode, setSelectedAccountCode] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError } = useGetAccountJournalQuery({
    accountCode: selectedAccountCode || undefined,
    page: currentPage,
    limit,
  });
  const { data: accountsData } = useGetAccountsQuery();
  const journal = data?.data || [];
  const meta = data?.meta;
  const accounts = accountsData?.data || [];

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Transform accounts data for SelectField
  const accountOptions = accounts.map((account: any) => ({
    id: account.code,
    name: `${account.name} (${account.code})`,
  }));

  // Reset page when account code changes
  const handleAccountChange = (value: string) => {
    setSelectedAccountCode(value);
    setCurrentPage(1);
  };

  if (isLoading) return <Loading message="Loading journal entries..." />;
  if (isError)
    return <p className="text-red-500 p-4">Failed to load journal entries.</p>;
  return (
    <>
      <div className="mb-4">
        <SelectField
          label="Filter by Account"
          data={accountOptions}
          value={selectedAccountCode}
          onChange={handleAccountChange}
          allowEmpty={true}
          emptyLabel="All Accounts"
          placeholder="Select an account"
        />
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-[#1e1e1e]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader>Reference</TableCell>
                <TableCell isHeader>Date</TableCell>
                <TableCell isHeader>Account</TableCell>
                <TableCell isHeader>Debit</TableCell>
                <TableCell isHeader>Credit</TableCell>
                <TableCell isHeader>Narration</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {journal.map((tx: any) =>
                tx.entries.map((entry: any, index: number) => (
                  <TableRow key={`${tx.transaction_id}-${index}`}>
                    {index === 0 && (
                      <>
                        <TableCell
                          rowSpan={tx.entries.length}
                          className="px-4 py-3 text-sm capitalize text-left text-gray-800 dark:text-gray-100"
                        >
                          {tx.reference_type} #{tx.reference_id}
                        </TableCell>
                        <TableCell
                          rowSpan={tx.entries.length}
                          className="px-4 py-3 text-sm text-left text-gray-800 dark:text-gray-100"
                        >
                          {new Date(tx.date).toLocaleDateString()}
                        </TableCell>
                      </>
                    )}

                    <TableCell className="px-4 py-3 text-sm text-left text-gray-800 dark:text-gray-100">
                      {entry.account_name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-right font-semibold text-green-600 dark:text-green-400">
                      {Number(entry.debit) > 0
                        ? Number(entry.debit).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400">
                      {Number(entry.credit) > 0
                        ? Number(entry.credit).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-left text-gray-800 dark:text-gray-100">
                      {entry.narration || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <Pagination
          meta={{
            currentPage: meta.page,
            totalPages: meta.totalPages,
            total: meta.total,
          }}
          onPageChange={handlePageChange}
          currentPageItems={journal.length}
          itemsPerPage={limit}
        />
      )}
    </>
  );
}
