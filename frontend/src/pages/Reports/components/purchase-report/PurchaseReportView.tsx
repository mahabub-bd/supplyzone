import {
  Calculator,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Truck,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

import Loading from "@/components/common/Loading";
import PageHeader from "@/components/common/PageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/common/Table";

import StatCard from "@/components/ui/badge/StatCard";
import Button from "@/components/ui/button";
import { useLazyGetPurchaseReportQuery } from "@/features/report/reportApi";
import { formatDate } from "@/utlis";
import ReportFilters, { useDateRangeCalculation } from "../common/ReportFilters";
import { useBranchOptions } from "../hooks/useBranchOptions";
import { useSupplierOptions } from "../hooks/useSupplierOptions";
import { useWarehouseOptions } from "../hooks/useWarehouseOptions";
import { PurchaseReportData } from "@/types/report";



export default function PurchaseReportView() {
  const [dateRange, setDateRange] = useState<string>("custom");
  const [branchId, setBranchId] = useState<number | undefined>();
  const [supplierId, setSupplierId] = useState<number | undefined>();
  const [warehouseId, setWarehouseId] = useState<number | undefined>();

  const [fetchReport, { data, isLoading, isError }] =
    useLazyGetPurchaseReportQuery();

  // Auto-calculate dates based on date range preset
  const { startDate: autoStartDate, endDate: autoEndDate } =
    useDateRangeCalculation(dateRange);

  // Fetch branches, suppliers, and warehouses
  const warehouseOptions = useWarehouseOptions();
  const branchOptions = useBranchOptions();
  const supplierOptions = useSupplierOptions();

  const handleGenerateReport = async () => {
    if (!autoStartDate || !autoEndDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    try {
      // Format dates to YYYY-MM-DD using local date components (not UTC)
      const formatDateLocal = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // Build params: only include dateRange if it's not custom
      // If dateRange is a preset (like last_year), only send dateRange without dates
      // If dateRange is custom, only send start/end dates without dateRange
      const params: any = {
        branch_id: branchId,
        supplier_id: supplierId,
        warehouse_id: warehouseId,
      };

      if (dateRange === "custom") {
        // Manual date selection: only send start/end dates
        params.start_date = formatDateLocal(autoStartDate);
        params.end_date = formatDateLocal(autoEndDate);
      } else {
        // Preset selected: only send dateRange
        params.dateRange = dateRange;
      }

      await fetchReport(params).unwrap();

      toast.success("Purchase report generated successfully");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to generate purchase report");
    }
  };

  const handleReset = () => {
    setDateRange("custom");
    setBranchId(undefined);
    setSupplierId(undefined);
    setWarehouseId(undefined);
    toast.info("Filters have been reset");
  };

  const reportData = data?.data as PurchaseReportData | undefined;

  return (
    <>
      <PageHeader
        title="Purchase Report"
        subtitle="Generate and view purchase reports"
      />

      {/* Filters */}
      <ReportFilters
        startDate={autoStartDate}
        endDate={autoEndDate}
        onStartDateChange={() => {}}
        onEndDateChange={() => {}}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        filters={[
          {
            label: "Branch",
            value: branchId?.toString() || "",
            onChange: (val) => setBranchId(val ? parseInt(val) : undefined),
            options: branchOptions,
            placeholder: "All Branches",
          },
          {
            label: "Supplier",
            value: supplierId?.toString() || "",
            onChange: (val) => setSupplierId(val ? parseInt(val) : undefined),
            options: supplierOptions,
            placeholder: "All Suppliers",
          },
          {
            label: "Warehouse",
            value: warehouseId?.toString() || "",
            onChange: (val) => setWarehouseId(val ? parseInt(val) : undefined),
            options: warehouseOptions,
            placeholder: "All Warehouses",
          },
        ]}
        actions={
          <div className="flex items-end gap-2 w-full">
            <Button
              onClick={handleGenerateReport}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Generating..." : "Generate"}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              disabled={isLoading}
              className="whitespace-nowrap"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        }
      />

      {/* Loading State */}
      {isLoading && <Loading message="Generating purchase report..." />}

      {/* Error State */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          Failed to load purchase report. Please try again.
        </div>
      )}

      {/* Report Data Display */}
      {reportData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          {reportData.summary && (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  icon={ShoppingCart}
                  title="Total Orders"
                  value={reportData.summary.totalOrders || 0}
                  bgColor="blue"
                  badge={{
                    icon: Truck,
                    text: "POs",
                    color: "info",
                  }}
                  compact
                />

                <StatCard
                  icon={Package}
                  title="Total Items"
                  value={reportData.summary.totalItems || 0}
                  bgColor="purple"
                  badge={{
                    text: "Items",
                    color: "default",
                  }}
                  compact
                />

                <StatCard
                  icon={DollarSign}
                  title="Total Value"
                  value={`৳${(
                    reportData.summary.totalValue || 0
                  ).toLocaleString()}`}
                  bgColor="green"
                  badge={{
                    icon: TrendingUp,
                    text: "Gross",
                    color: "success",
                  }}
                  compact
                />

                <StatCard
                  icon={TrendingUp}
                  title="Net Value"
                  value={`৳${(
                    reportData.summary.netValue || 0
                  ).toLocaleString()}`}
                  bgColor="indigo"
                  badge={{
                    text: "After Deductions",
                    color: "info",
                  }}
                  compact
                />
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <StatCard
                  icon={Calculator}
                  title="Total Tax"
                  value={`৳${(
                    reportData.summary.totalTax || 0
                  ).toLocaleString()}`}
                  bgColor="pink"
                  badge={{
                    text: "Tax",
                    color: "default",
                  }}
                  compact
                />

                <StatCard
                  icon={DollarSign}
                  title="Total Discount"
                  value={`৳${(
                    reportData.summary.totalDiscount || 0
                  ).toLocaleString()}`}
                  bgColor="orange"
                  badge={{
                    text: "Discounts",
                    color: "warning",
                  }}
                  compact
                />

                <StatCard
                  icon={Package}
                  title="Avg Order Value"
                  value={`৳${(
                    (reportData.summary.totalValue || 0) /
                    (reportData.summary.totalOrders || 1)
                  ).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
                  bgColor="blue"
                  badge={{
                    text: "Per Order",
                    color: "info",
                  }}
                  compact
                />
              </div>
            </>
          )}

          {/* Details Table */}
          {reportData.details && reportData.details.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Purchase Details
                </h3>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell isHeader>PO Number</TableCell>
                      <TableCell isHeader>Date</TableCell>
                      <TableCell isHeader>Supplier</TableCell>
                      <TableCell isHeader>Warehouse</TableCell>
                      <TableCell isHeader>Status</TableCell>
                      <TableCell isHeader className="text-right">
                        Quantity
                      </TableCell>
                      <TableCell isHeader className="text-right">
                        Total Value
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.details.map((detail: any, index: number) => (
                      <TableRow
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <TableCell className="font-medium text-gray-900 dark:text-white whitespace-nowrap">
                          {detail.poNumber}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {formatDate(detail.orderDate)}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          <div
                            className="max-w-xs truncate"
                            title={detail.supplierName}
                          >
                            {detail.supplierName}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          <div
                            className="max-w-xs truncate"
                            title={detail.warehouseName}
                          >
                            {detail.warehouseName}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              detail.status === "fully_received"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : detail.status === "partially_received"
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : detail.status === "pending"
                                ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            }`}
                          >
                            {detail.status.replace(/_/g, " ").toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400 text-right whitespace-nowrap">
                          {detail.quantity}
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 dark:text-white text-right whitespace-nowrap">
                          ৳{detail.totalValue}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
