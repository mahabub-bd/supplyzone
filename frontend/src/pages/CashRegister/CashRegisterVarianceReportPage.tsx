import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Download,
  Eye,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import React, { useState } from "react";

import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

import { formatCurrencyEnglish } from "../../utlis";
import { useGetCashRegistersQuery, useGetVarianceReportQuery } from "../../features/cash-register/cashRegisterApi";
import { CashRegister } from "../../types/cashregister";

const CashRegisterVarianceReportPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegister, setSelectedRegister] = useState<number | null>(null);
  const [showVarianceModal, setShowVarianceModal] = useState(false);

  // Query all registers
  const { data: registersResponse, isLoading: registersLoading } =
    useGetCashRegistersQuery({
      status: "closed",
    });

  const registers = (registersResponse?.data || []) as CashRegister[];

  // Query variance report
  const {
    data: varianceResponse,
    isLoading: varianceLoading,
    error,
  } = useGetVarianceReportQuery(selectedRegister!, { skip: !selectedRegister });

  const varianceReport = varianceResponse?.data;

  // Filter registers based on search
  const filteredRegisters = registers.filter(
    (register) =>
      register.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (register.register_code || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      register.branch?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewVariance = (register: CashRegister) => {
    setSelectedRegister(register.id);
    setShowVarianceModal(true);
  };

  const getVarianceStatusBadge = (variance: number) => {
    if (variance === 0) {
      return { color: "success" as const, text: "Balanced", icon: CheckCircle };
    } else if (variance > 0) {
      return { color: "warning" as const, text: "Overage", icon: TrendingUp };
    } else {
      return { color: "error" as const, text: "Shortage", icon: TrendingDown };
    }
  };

  if (registersLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cash Register Variance Reports
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Analyze cash register variances and audit trails
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search registers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Registers
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {registers.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Closed Registers
              </p>
              <p className="text-2xl font-bold text-green-600">
                {registers.filter((r) => r.status === "closed").length}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Variance
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {/* TODO: Calculate from variance reports */}
                {formatCurrencyEnglish(0)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Alerts</p>
              <p className="text-2xl font-bold text-orange-600">
                {/* TODO: Count registers with significant variance */}0
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Registers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/5">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/5">
                <TableRow>
                  <TableCell isHeader className="table-header">
                    Register Code
                  </TableCell>
                  <TableCell isHeader className="table-header">
                    Register Name
                  </TableCell>
                  <TableCell isHeader className="table-header">
                    Opened At
                  </TableCell>
                  <TableCell isHeader className="table-header">
                    Closed At
                  </TableCell>
                  <TableCell isHeader className="table-header">
                    Final Balance
                  </TableCell>
                  <TableCell isHeader className="table-header text-right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredRegisters.length > 0 ? (
                  filteredRegisters.map((register) => (
                    <TableRow key={register.id}>
                      <TableCell className="table-body font-medium">
                        {register.register_code || "N/A"}
                      </TableCell>
                      <TableCell className="table-body">
                        <div>
                          <div className="font-medium">{register.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {register.branch?.name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="table-body">
                        <div className="text-sm">
                          <div className="text-gray-900 dark:text-white">
                            {register.opened_at
                              ? new Date(
                                  register.opened_at
                                ).toLocaleDateString()
                              : "N/A"}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {register.opened_at
                              ? new Date(
                                  register.opened_at
                                ).toLocaleTimeString()
                              : "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="table-body">
                        <div className="text-sm">
                          <div className="text-gray-900 dark:text-white">
                            {register.closed_at
                              ? new Date(
                                  register.closed_at
                                ).toLocaleDateString()
                              : "N/A"}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {register.closed_at
                              ? new Date(
                                  register.closed_at
                                ).toLocaleTimeString()
                              : "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="table-body">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrencyEnglish(
                            Number(register.current_balance)
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="table-body">
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewVariance(register)}
                            disabled={!register.closed_at}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-6 text-center text-gray-500 dark:text-gray-400"
                    >
                      No closed registers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Variance Report Modal */}
      <Modal
        isOpen={showVarianceModal}
        onClose={() => setShowVarianceModal(false)}
        title="Cash Register Variance Report"
      >
        {varianceLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">
              Failed to load variance report. Please try again.
            </p>
          </div>
        ) : varianceReport ? (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Opening Balance
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrencyEnglish(
                    Number(varianceReport.opening_balance)
                  )}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Expected Balance
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrencyEnglish(varianceReport.expected_balance)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Counted Balance
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrencyEnglish(varianceReport.counted_balance)}
                </p>
              </div>
              <div
                className={`p-4 rounded-lg ${
                  varianceReport.variance === null
                    ? "bg-gray-50 dark:bg-gray-800"
                    : varianceReport.variance === 0
                    ? "bg-green-50 dark:bg-green-900/20"
                    : varianceReport.variance > 0
                    ? "bg-yellow-50 dark:bg-yellow-900/20"
                    : "bg-red-50 dark:bg-red-900/20"
                }`}
              >
                <p className="text-sm mb-1">Variance</p>
                <div className="flex items-center gap-2">
                  {varianceReport.variance !== null &&
                    varianceReport.variance !== 0 &&
                    React.createElement(
                      getVarianceStatusBadge(varianceReport.variance).icon,
                      {
                        className: "h-5 w-5",
                        style: {
                          color:
                            varianceReport.variance > 0 ? "#EAB308" : "#EF4444",
                        },
                      }
                    )}
                  <p
                    className={`text-lg font-semibold ${
                      varianceReport.variance === null
                        ? "text-gray-600 dark:text-gray-400"
                        : varianceReport.variance === 0
                        ? "text-green-600 dark:text-green-400"
                        : varianceReport.variance > 0
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {varianceReport.variance === null
                      ? "N/A"
                      : `${
                          varianceReport.variance >= 0 ? "+" : ""
                        }${formatCurrencyEnglish(varianceReport.variance)}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Transaction Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Cash In
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Sales:
                      </span>
                      <span className="font-medium">
                        {formatCurrencyEnglish(varianceReport.cash_in.sales)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Cash In Transactions:
                      </span>
                      <span className="font-medium">
                        {formatCurrencyEnglish(varianceReport.cash_in.cash_in)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Adjustments:
                      </span>
                      <span className="font-medium">
                        {formatCurrencyEnglish(
                          varianceReport.cash_in.adjustments
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Cash Out
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Refunds:
                      </span>
                      <span className="font-medium">
                        {formatCurrencyEnglish(varianceReport.cash_out.refunds)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Cash Out Transactions:
                      </span>
                      <span className="font-medium">
                        {formatCurrencyEnglish(
                          varianceReport.cash_out.cash_out
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Adjustments:
                      </span>
                      <span className="font-medium">
                        {formatCurrencyEnglish(
                          varianceReport.cash_out.adjustments
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {varianceReport.notes && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Notes
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {varianceReport.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowVarianceModal(false)}
              >
                Close
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default CashRegisterVarianceReportPage;
