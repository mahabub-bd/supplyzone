import {
  ArrowDownCircle,
  ArrowUpCircle,
  Eye,
  Filter,
  Search,
} from "lucide-react";
import React, { useMemo, useState } from "react";

import DatePicker from "../../components/form/date-picker";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useGetCashRegisterTransactionsQuery } from "../../features/cash-register/cashRegisterApi";

import { formatCurrencyEnglish, formatDateTime } from "../../utlis";
import { CashRegisterTransaction } from "../../types/cashregister";

const CashRegisterTransactionsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    | "all"
    | "adjustment"
    | "sale"
    | "cash_in"
    | "cash_out"
    | "opening_balance"
    | "closing_balance"
  >("all");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [currentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] =
    useState<CashRegisterTransaction | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const itemsPerPage = 20;

  // Query transactions
  const {
    data: transactionsResponse,
    isLoading,
    error,
  } = useGetCashRegisterTransactionsQuery({
    transaction_type:
      typeFilter !== "all"
        ? (typeFilter as
            | "adjustment"
            | "sale"
            | "cash_in"
            | "cash_out"
            | "opening_balance"
            | "closing_balance")
        : undefined,
    start_date: startDate ? startDate.toISOString().split("T")[0] : undefined,
    end_date: endDate ? endDate.toISOString().split("T")[0] : undefined,
    page: currentPage,
    limit: itemsPerPage,
  });

  const transactions = transactionsResponse?.data || [];
  const pagination = transactionsResponse?.meta;

  // Filter transactions based on search
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.id.toString().includes(searchTerm.toLowerCase()) ||
          transaction.cash_register?.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          String(transaction.reference_no || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.sale?.invoice_no
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [transactions, searchTerm]);

  const handleViewDetails = (transaction: CashRegisterTransaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case "sale":
        return { color: "success" as const, text: "Sale", icon: "↑" };
      case "refund":
        return { color: "error" as const, text: "Refund", icon: "↓" };
      case "cash_in":
        return { color: "primary" as const, text: "Cash In", icon: "↑" };
      case "cash_out":
        return { color: "warning" as const, text: "Cash Out", icon: "↓" };
      case "adjustment":
        return { color: "info" as const, text: "Adjustment", icon: "↻" };
      case "opening_balance":
        return { color: "success" as const, text: "Opening", icon: "↗" };
      case "closing_balance":
        return { color: "light" as const, text: "Closing", icon: "↘" };
      default:
        return { color: "light" as const, text: type, icon: "•" };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">
          Failed to load transactions. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cash Counter Transactions
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            View and track all cash Counter transactions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Select
              value={typeFilter}
              onChange={(value) => setTypeFilter(value as typeof typeFilter)}
              options={[
                { value: "all", label: "All Types" },
                { value: "sale", label: "Sales" },
                { value: "refund", label: "Refunds" },
                { value: "cash_in", label: "Cash In" },
                { value: "cash_out", label: "Cash Out" },
                { value: "adjustment", label: "Adjustments" },
                { value: "opening_balance", label: "Openings" },
                { value: "closing_balance", label: "Closings" },
              ]}
            />
          </div>
          <div className="flex gap-2">
            <DatePicker
              id="start-date-filter"
              value={startDate}
              onChange={(date) => setStartDate(date as Date | null)}
              placeholder="Start date"
              disableFuture={false}
            />
            <DatePicker
              id="end-date-filter"
              value={endDate}
              onChange={(date) => setEndDate(date as Date | null)}
              placeholder="End date"
              disableFuture={false}
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Transactions
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {transactions.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Cash In
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrencyEnglish(
                  transactions
                    .filter((t) =>
                      ["sale", "cash_in", "opening_balance"].includes(
                        t.transaction_type
                      )
                    )
                    .reduce((sum, t) => sum + Number(t.amount), 0)
                )}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <ArrowUpCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Cash Out
              </p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrencyEnglish(
                  transactions
                    .filter((t) =>
                      ["refund", "cash_out"].includes(t.transaction_type)
                    )
                    .reduce((sum, t) => sum + Number(t.amount), 0)
                )}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <ArrowDownCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Adjustments
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {
                  transactions.filter(
                    (t) => t.transaction_type === "adjustment"
                  ).length
                }
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Filter className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/5">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/5">
                <TableRow>
                  <TableCell isHeader className="table-header">
                    ID
                  </TableCell>
                  <TableCell isHeader className="table-header">
                    Counter
                  </TableCell>
                  <TableCell isHeader className="table-header">
                    Branch
                  </TableCell>
                  <TableCell isHeader className="table-header">
                    Type
                  </TableCell>
                  <TableCell isHeader className="table-header">
                    Amount
                  </TableCell>
                  <TableCell isHeader className="table-header">
                    Balance After
                  </TableCell>
                  <TableCell isHeader className="table-header">
                    Date & Time
                  </TableCell>
                  <TableCell isHeader className="table-header">
                    Created By
                  </TableCell>
                  <TableCell isHeader className="table-header text-right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => {
                    const badge = getTransactionTypeBadge(
                      transaction.transaction_type
                    );
                    const isPositive =
                      transaction.transaction_type === "sale" ||
                      transaction.transaction_type === "cash_in" ||
                      transaction.transaction_type === "opening_balance";

                    return (
                      <TableRow key={transaction.id}>
                        <TableCell className="table-body">
                          <span className="font-mono text-sm text-gray-900 dark:text-white">
                            #{transaction.id}
                          </span>
                        </TableCell>
                        <TableCell className="table-body">
                          {transaction.cash_register?.name}
                        </TableCell>
                        <TableCell>
                          {transaction.cash_register?.branch?.name}
                        </TableCell>
                        <TableCell className="table-body">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{badge.icon}</span>
                            <Badge color={badge.color} size="sm">
                              {badge.text}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="table-body">
                          <span
                            className={`font-semibold ${
                              isPositive ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {isPositive ? "+" : "-"}
                            {formatCurrencyEnglish(Number(transaction.amount))}
                          </span>
                        </TableCell>
                        <TableCell className="table-body">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatCurrencyEnglish(
                              Number(transaction.running_balance)
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="table-body">
                          {formatDateTime(transaction.created_at)}
                        </TableCell>
                        <TableCell className="table-body">
                          {transaction.user?.full_name || "N/A"}
                        </TableCell>
                        <TableCell className="table-body">
                          <div className="flex justify-start">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(transaction)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-6 text-center text-gray-500 dark:text-gray-400"
                    >
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {pagination && (
          <div className="mt-4 flex justify-center text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {Math.ceil(pagination.total / itemsPerPage)}
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      <Modal
        className="max-w-2xl"
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Transaction Details"
      >
        {selectedTransaction && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Transaction ID
                </label>
                <p className="font-mono text-sm text-gray-900 dark:text-white">
                  #{selectedTransaction.id}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <Badge
                  color={
                    getTransactionTypeBadge(
                      selectedTransaction.transaction_type
                    ).color
                  }
                >
                  {
                    getTransactionTypeBadge(
                      selectedTransaction.transaction_type
                    ).text
                  }
                </Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrencyEnglish(Number(selectedTransaction.amount))}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Balance After
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrencyEnglish(
                    Number(selectedTransaction.running_balance)
                  )}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cash Register
                </label>
                <p className="text-gray-900 dark:text-white">
                  {selectedTransaction.cash_register?.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedTransaction.cash_register?.branch?.name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date & Time
                </label>
                <p className="text-gray-900 dark:text-white">
                  {formatDateTime(selectedTransaction.created_at)}
                </p>
              </div>
              {selectedTransaction.user && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Created By
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedTransaction.user.full_name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedTransaction.user.username || "N/A"}
                  </p>
                </div>
              )}
              {selectedTransaction.reference_no && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reference
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedTransaction.reference_no}
                  </p>
                </div>
              )}
              {selectedTransaction.sale && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sale Invoice
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedTransaction.sale.invoice_no}
                  </p>
                </div>
              )}
            </div>

            {selectedTransaction.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <p className="text-gray-900 dark:text-white">
                  {selectedTransaction.description}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CashRegisterTransactionsPage;
