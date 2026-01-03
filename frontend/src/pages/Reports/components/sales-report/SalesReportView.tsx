import {
  ArrowUp,
  Calculator,
  DollarSign,
  Package,
  Percent,
  ShoppingBag,
  TrendingUp,
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

import Checkbox from "@/components/form/input/Checkbox";
import StatCard from "@/components/ui/badge/StatCard";
import Button from "@/components/ui/button";
import { useLazyGetSalesReportQuery } from "@/features/report/reportApi";
import { formatDate } from "@/utlis";

import { SalesReportData } from "@/types/report";
import ComparisonSection from "../common/ComparisonSection";
import ReportFilters, {
  useDateRangeCalculation,
} from "../common/ReportFilters";
import { useBranchOptions } from "../hooks/useBranchOptions";
import { useCustomerOptions } from "../hooks/useCustomerOptions";
import { useProductOptions } from "../hooks/useProductOptions";

export default function SalesReportView() {
  const [dateRange, setDateRange] = useState<string>("custom");
  const [branchId, setBranchId] = useState<number | undefined>();
  const [customerId, setCustomerId] = useState<number | undefined>();
  const [productId, setProductId] = useState<number | undefined>();
  const [includeComparison, setIncludeComparison] = useState<boolean>(false);

  const [fetchReport, { data, isLoading, isError }] =
    useLazyGetSalesReportQuery();

  // Auto-calculate dates based on date range preset
  const { startDate: autoStartDate, endDate: autoEndDate } =
    useDateRangeCalculation(dateRange);

  // Fetch branches, customers, and products
  const branchOptions = useBranchOptions();
  const customerOptions = useCustomerOptions();
  const productOptions = useProductOptions();

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
      // If dateRange is custom, only send from/to dates without dateRange
      const params: any = {
        branch_id: branchId,
        customer_id: customerId,
        product_id: productId,
        includeComparison,
      };

      if (dateRange === "custom") {
        // Manual date selection: only send from/to dates
        params.fromDate = formatDateLocal(autoStartDate);
        params.toDate = formatDateLocal(autoEndDate);
      } else {
        // Preset selected: only send dateRange
        params.dateRange = dateRange;
      }

      await fetchReport(params).unwrap();

      toast.success("Sales report generated successfully");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to generate sales report");
    }
  };

  const handleReset = () => {
    setDateRange("custom");
    setBranchId(undefined);
    setCustomerId(undefined);
    setProductId(undefined);
    setIncludeComparison(false);
    toast.info("Filters have been reset");
  };

  const reportData = data?.data as SalesReportData | undefined;

  return (
    <>
      <PageHeader
        title="Sales Report"
        subtitle="Generate and view sales reports"
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
            label: "Customer",
            value: customerId?.toString() || "",
            onChange: (val) => setCustomerId(val ? parseInt(val) : undefined),
            options: customerOptions,
            placeholder: "All Customers",
          },
          {
            label: "Product",
            value: productId?.toString() || "",
            onChange: (val) => setProductId(val ? parseInt(val) : undefined),
            options: productOptions,
            placeholder: "All Products",
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
            <Checkbox
              id="include-comparison"
              label="Compare"
              checked={includeComparison}
              onChange={setIncludeComparison}
            />
          </div>
        }
      />

      {/* Loading State */}
      {isLoading && <Loading message="Generating sales report..." />}

      {/* Error State */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          Failed to load sales report. Please try again.
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
                  icon={ShoppingBag}
                  title="Total Orders"
                  value={reportData.summary.totalOrders || 0}
                  bgColor="blue"
                  badge={{
                    icon: ArrowUp,
                    text: "All Time",
                    color: "info",
                  }}
                  compact
                />

                <StatCard
                  icon={Package}
                  title="Total Items Sold"
                  value={reportData.summary.totalItemsSold || 0}
                  bgColor="purple"
                  badge={{
                    text: "Items",
                    color: "default",
                  }}
                  compact
                />

                <StatCard
                  icon={DollarSign}
                  title="Total Revenue"
                  value={`৳${(
                    reportData.summary.totalRevenue || 0
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
                  title="Net Revenue"
                  value={`৳${(
                    reportData.summary.netRevenue || 0
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
                  icon={Percent}
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
                  title="Average Order Value"
                  value={`৳${(
                    reportData.summary.averageOrderValue || 0
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

          {/* Comparison Section */}
          {includeComparison && reportData.comparison && (
            <ComparisonSection comparison={reportData.comparison} />
          )}

          {/* Details Table */}
          {reportData.details && reportData.details.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Sales Details
                </h3>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell isHeader>Invoice No</TableCell>
                      <TableCell isHeader>Date</TableCell>
                      <TableCell isHeader>Customer</TableCell>
                      <TableCell isHeader>Product</TableCell>
                      <TableCell isHeader className="text-right">
                        Quantity
                      </TableCell>
                      <TableCell isHeader className="text-right">
                        Unit Price
                      </TableCell>
                      <TableCell isHeader className="text-right">
                        Total
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
                          {detail.invoiceNo}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {formatDate(detail.saleDate)}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          <div
                            className="max-w-xs truncate"
                            title={detail.customerName}
                          >
                            {detail.customerName}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          <div
                            className="max-w-xs truncate"
                            title={detail.productName}
                          >
                            {detail.productName}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400 text-right whitespace-nowrap">
                          {detail.quantity}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400 text-right whitespace-nowrap">
                          ৳{detail.unitPrice}
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 dark:text-white text-right whitespace-nowrap">
                          ৳{detail.lineTotal}
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
