import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../../components/common/Loading";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Badge from "../../../components/ui/badge/Badge";
import Button from "../../../components/ui/button/Button";
import Pagination from "../../../components/ui/pagination/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useGetCashBankLedgerQuery } from "../../../features/accounts/accountsApi";
import { formatCurrencyEnglish, formatDateTime } from "../../../utlis";

export default function AccountLedgerPage() {
  const { accountCode } = useParams<{ accountCode: string }>();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  if (!accountCode) {
    return (
      <div className="p-6">
        <p className="text-red-500">Account code is required</p>
      </div>
    );
  }

  const { data, isLoading, isError } = useGetCashBankLedgerQuery({
    code: accountCode,
    page: currentPage,
    limit,
  });

  const ledgerData = data?.data;
  const meta = data?.meta;
  const entries = ledgerData?.entries || [];

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) return <Loading message="Loading account ledger..." />;
  if (isError || !ledgerData)
    return (
      <div className="p-6">
        <p className="text-red-500">Failed to load account ledger.</p>
      </div>
    );

  return (
    <div>
      {/* Page SEO Meta */}
      <PageMeta
        title={`${ledgerData.account_name} Ledger`}
        description="View account transaction history"
      />

      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle={`${ledgerData.account_name} Ledger`} />

      {/* Page Container */}
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/5">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between ">
            <div className="flex flex-end items-center gap-6  ">
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>
                  Account Code: <strong>{ledgerData.account_code}</strong>
                </span>
                <Badge
                  size="sm"
                  variant="light"
                  color={
                    ledgerData.type === "asset"
                      ? "primary"
                      : ledgerData.type === "liability"
                      ? "warning"
                      : ledgerData.type === "equity"
                      ? "info"
                      : "primary"
                  }
                >
                  {ledgerData.type}
                </Badge>
                <Badge
                  size="sm"
                  variant="light"
                  color={
                    ledgerData.isCash
                      ? "success"
                      : ledgerData.isBank
                      ? "primary"
                      : "light"
                  }
                >
                  {ledgerData.isCash
                    ? "Cash Account"
                    : ledgerData.isBank
                    ? "Bank Account"
                    : "Regular Account"}
                </Badge>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              startIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              Back to Accounts
            </Button>
          </div>

          {/* Balance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Opening Balance
              </p>
              <p
                className={`text-xl font-bold ${
                  ledgerData.opening_balance >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatCurrencyEnglish(Math.abs(ledgerData.opening_balance))}
                {ledgerData.opening_balance < 0 && " (Dr)"}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Current Balance
              </p>
              <p
                className={`text-xl font-bold ${
                  ledgerData.closing_balance >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatCurrencyEnglish(Math.abs(ledgerData.closing_balance))}
                {ledgerData.closing_balance < 0 && " (Dr)"}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total Transactions
              </p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">
                {entries.length}
              </p>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader>Date & Time</TableCell>
                <TableCell isHeader>Reference Type</TableCell>
                <TableCell isHeader>Reference ID</TableCell>
                <TableCell isHeader>Debit</TableCell>
                <TableCell isHeader>Credit</TableCell>
                <TableCell isHeader>Running Balance</TableCell>
                <TableCell isHeader>Narration</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400">
                      <p className="text-lg font-medium mb-1">
                        No transactions found
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry: any, index: number) => (
                  <TableRow
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <TableCell>
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {formatDateTime(entry.date)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        size="sm"
                        variant="light"
                        color="primary"
                        className="capitalize"
                      >
                        {entry.reference_type?.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900 dark:text-white">
                      {entry.reference_id || "N/A"}
                    </TableCell>
                    <TableCell
                      className={`font-medium  ${
                        entry.debit > 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-500"
                      }`}
                    >
                      {entry.debit > 0
                        ? formatCurrencyEnglish(entry.debit)
                        : "-"}
                    </TableCell>
                    <TableCell
                      className={`font-medium  ${
                        entry.credit > 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-gray-500"
                      }`}
                    >
                      {entry.credit > 0
                        ? formatCurrencyEnglish(entry.credit)
                        : "-"}
                    </TableCell>
                    <TableCell
                      className={`font-medium  ${
                        entry.running_balance >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatCurrencyEnglish(Math.abs(entry.running_balance))}
                      {entry.running_balance < 0 && " (Dr)"}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {entry.narration || "No narration"}
                      </p>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
            currentPageItems={entries.length}
            itemsPerPage={limit}
          />
        )}
      </div>
    </div>
  );
}
