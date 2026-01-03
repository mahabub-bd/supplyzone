import {
  Calculator,
  DollarSign,
  Package,
  Percent,
  RotateCcw,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

import Loading from "@/components/common/Loading";
import PageHeader from "@/components/common/PageHeader";

import StatCard from "@/components/ui/badge/StatCard";
import Button from "@/components/ui/button";
import { useLazyGetProfitLossReportQuery } from "@/features/report/reportApi";
import { ProfitLossReportData } from "@/types/report";
import ReportFilters, {
  useDateRangeCalculation,
} from "../common/ReportFilters";
import { useBranchOptions } from "../hooks/useBranchOptions";

export default function ProfitLossReportView() {
  const [dateRange, setDateRange] = useState<string>("custom");
  const [branchId, setBranchId] = useState<number | undefined>();

  const [fetchReport, { data, isLoading, isError }] =
    useLazyGetProfitLossReportQuery();

  // Auto-calculate dates based on date range preset
  const { startDate: autoStartDate, endDate: autoEndDate } =
    useDateRangeCalculation(dateRange);

  // Fetch branches
  const branchOptions = useBranchOptions();

  const handleGenerateReport = async () => {
    if (!autoStartDate || !autoEndDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    try {
      // Format dates to YYYY-MM-DD using local date components (not UTC)
      const formatDateLocal = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      // Build params: only include dateRange if it's not custom
      // If dateRange is a preset (like last_year), only send dateRange without dates
      // If dateRange is custom, only send start/end dates without dateRange
      const params: any = {
        branch_id: branchId,
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

      toast.success("Profit & Loss report generated successfully");
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to generate profit & loss report"
      );
    }
  };

  const handleReset = () => {
    setDateRange("custom");
    setBranchId(undefined);
    toast.info("Filters have been reset");
  };

  const reportData = data?.data as ProfitLossReportData | undefined;

  return (
    <>
      <PageHeader
        title="Profit & Loss Report"
        subtitle="Generate and view profit & loss reports"
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
      {isLoading && <Loading message="Generating profit & loss report..." />}

      {/* Error State */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          Failed to load profit & loss report. Please try again.
        </div>
      )}

      {/* Report Data Display */}
      {reportData && reportData.summary && (
        <div className="space-y-4">
          {/* Revenue & Profit Metrics */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard
              icon={DollarSign}
              title="Revenue"
              value={`৳${(reportData.summary.revenue || 0).toLocaleString()}`}
              bgColor="green"
              badge={{
                icon: TrendingUp,
                text: "Gross",
                color: "success",
              }}
              compact
            />

            <StatCard
              icon={Package}
              title="COGS"
              value={`৳${(reportData.summary.cogs || 0).toLocaleString()}`}
              bgColor="orange"
              badge={{
                text: "Cost",
                color: "warning",
              }}
              compact
            />

            <StatCard
              icon={TrendingUp}
              title="Gross Profit"
              value={`৳${(
                reportData.summary.grossProfit || 0
              ).toLocaleString()}`}
              bgColor="blue"
              badge={{
                text: `${
                  reportData.summary.grossProfitMargin?.toFixed(1) || 0
                }%`,
                color: "info",
              }}
              compact
            />

            <StatCard
              icon={TrendingUp}
              title="Net Profit"
              value={`৳${(reportData.summary.netProfit || 0).toLocaleString()}`}
              bgColor="indigo"
              badge={{
                icon: TrendingUp,
                text: "Bottom",
                color: "success",
              }}
              compact
            />
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard
              icon={ShoppingCart}
              title="Purchases"
              value={`৳${(reportData.summary.purchases || 0).toLocaleString()}`}
              bgColor="purple"
              badge={{
                text: "Orders",
                color: "default",
              }}
              compact
            />

            <StatCard
              icon={TrendingDown}
              title="Expenses"
              value={`৳${(
                reportData.summary.totalExpenses || 0
              ).toLocaleString()}`}
              bgColor="red"
              badge={{
                text: "Operating",
                color: "error",
              }}
              compact
            />

            <StatCard
              icon={TrendingUp}
              title="Operating Profit"
              value={`৳${(
                reportData.summary.operatingProfit || 0
              ).toLocaleString()}`}
              bgColor="cyan"
              badge={{
                text: "EBIT",
                color: "info",
              }}
              compact
            />

            <StatCard
              icon={Percent}
              title="Gross Margin"
              value={`${
                reportData.summary.grossProfitMargin?.toFixed(1) || 0
              }%`}
              bgColor="green"
              badge={{
                icon: TrendingUp,
                text: "Margin",
                color: "success",
              }}
              compact
            />
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={Percent}
              title="Total Discount"
              value={`৳${(
                reportData.summary.totalDiscount || 0
              ).toLocaleString()}`}
              bgColor="pink"
              badge={{
                text: "Discounts",
                color: "default",
              }}
              compact
            />

            <StatCard
              icon={Calculator}
              title="Total Tax"
              value={`৳${(reportData.summary.totalTax || 0).toLocaleString()}`}
              bgColor="indigo"
              badge={{
                text: "Tax",
                color: "info",
              }}
              compact
            />
          </div>

          {/* Profit & Loss Summary */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Profit & Loss Summary
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {/* Revenue Section */}
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Revenue
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    ৳{(reportData.summary.revenue || 0).toLocaleString()}
                  </p>
                </div>

                {/* Cost of Goods Sold */}
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Less: Cost of Goods Sold
                    </p>
                  </div>
                  <p className="text-base font-semibold text-orange-600 dark:text-orange-400">
                    ৳{(reportData.summary.cogs || 0).toLocaleString()}
                  </p>
                </div>

                {/* Gross Profit */}
                <div className="flex justify-between items-center py-2 px-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded">
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                      Gross Profit
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {reportData.summary.grossProfitMargin?.toFixed(1) || 0}%
                      margin
                    </p>
                  </div>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    ৳{(reportData.summary.grossProfit || 0).toLocaleString()}
                  </p>
                </div>

                {/* Discounts */}
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Less: Discounts
                    </p>
                  </div>
                  <p className="text-base font-semibold text-red-600 dark:text-red-400">
                    ৳{(reportData.summary.totalDiscount || 0).toLocaleString()}
                  </p>
                </div>

                {/* Taxes */}
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Plus: Taxes
                    </p>
                  </div>
                  <p className="text-base font-semibold text-green-600 dark:text-green-400">
                    ৳{(reportData.summary.totalTax || 0).toLocaleString()}
                  </p>
                </div>

                {/* Total Expenses */}
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Less: Expenses
                    </p>
                  </div>
                  <p className="text-base font-semibold text-red-600 dark:text-red-400">
                    ৳{(reportData.summary.totalExpenses || 0).toLocaleString()}
                  </p>
                </div>

                {/* Operating Profit */}
                <div className="flex justify-between items-center py-2 px-3 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                      Operating Profit (EBIT)
                    </p>
                  </div>
                  <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                    ৳
                    {(reportData.summary.operatingProfit || 0).toLocaleString()}
                  </p>
                </div>

                {/* Net Profit */}
                <div className="flex justify-between items-center py-3 px-4 bg-linear-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg">
                  <div>
                    <p className="font-bold text-base text-gray-900 dark:text-white">
                      Net Profit
                    </p>
                  </div>
                  <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    ৳{(reportData.summary.netProfit || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
