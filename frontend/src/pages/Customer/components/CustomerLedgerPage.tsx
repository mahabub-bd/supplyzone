import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../../components/common/Loading";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import LedgerSummaryCard from "../../../components/common/LedgerSummaryCard";
import Badge from "../../../components/ui/badge/Badge";
import Pagination from "../../../components/ui/pagination/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useGetCustomerLedgerQuery } from "../../../features/accounts/accountsApi";
import { useGetCustomerByIdQuery } from "../../../features/customer/customerApi";
import { formatCurrencyEnglish, formatDateTime } from "../../../utlis";

export default function CustomerLedgerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  if (!id) {
    return (
      <div className="p-6">
        <p className="text-red-500">Customer ID is required</p>
      </div>
    );
  }

  const { data: customerData, isLoading: customerLoading } =
    useGetCustomerByIdQuery(id);
  const {
    data: ledgerData,
    isLoading: ledgerLoading,
    isError,
  } = useGetCustomerLedgerQuery({
    customerId: parseInt(id),
    date: selectedDate,
    page: currentPage,
    limit,
  });

  const customer = customerData?.data;
  const ledger = ledgerData?.data;
  const entries = ledger?.entries || [];
  const meta = ledgerData?.meta;

  const isLoading = customerLoading || ledgerLoading;

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) return <Loading message="Loading customer ledger..." />;
  if (isError || !ledger || !customer) {
    return (
      <div className="p-6">
        <p className="text-red-500">Failed to load customer ledger.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Page SEO Meta */}
      <PageMeta
        title={`${customer.name} Ledger`}
        description="View customer transaction history and ledger"
      />

      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle={`${customer.name} Ledger`} />

      {/* Page Container */}
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/5">
        {/* Header */}
        <LedgerSummaryCard
          entity={{
            name: customer.name,
            code: customer.customer_code,
            phone: customer.phone,
            email: customer.email,
          }}
          ledger={ledger}
          totalTransactions={entries.length}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onBack={() => navigate(-1)}
          formatCurrency={formatCurrencyEnglish}
          type="customer"
        />

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
                      <p className="text-sm">
                        No transactions recorded for this customer
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
                        color={
                          entry.reference_type === "sale"
                            ? "success"
                            : entry.reference_type === "sale_payment"
                            ? "primary"
                            : entry.reference_type === "sale_return"
                            ? "warning"
                            : entry.reference_type === "customer_refund"
                            ? "info"
                            : "primary"
                        }
                        className="capitalize"
                      >
                        {entry.reference_type?.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900 dark:text-white">
                      {entry.reference_id ? (
                        entry.reference_type === "sale" ? (
                          <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
                            #{entry.reference_id}
                          </span>
                        ) : entry.reference_type === "sale_payment" ? (
                          <span className="text-green-600 hover:text-green-800 cursor-pointer">
                            #{entry.reference_id}
                          </span>
                        ) : (
                          `#${entry.reference_id}`
                        )
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell
                      className={`font-medium ${
                        entry.debit > 0
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-500"
                      }`}
                    >
                      {entry.debit > 0
                        ? formatCurrencyEnglish(entry.debit)
                        : "-"}
                    </TableCell>
                    <TableCell
                      className={`font-medium ${
                        entry.credit > 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-500"
                      }`}
                    >
                      {entry.credit > 0
                        ? formatCurrencyEnglish(entry.credit)
                        : "-"}
                    </TableCell>
                    <TableCell
                      className={`font-medium ${
                        entry.running_balance >= 0
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {formatCurrencyEnglish(Math.abs(entry.running_balance))}
                      {entry.running_balance > 0 && " (Receivable)"}
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
