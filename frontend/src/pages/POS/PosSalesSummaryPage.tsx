import {
  Banknote,
  CreditCard,
  DollarSign,
  ShoppingCart,
  Smartphone,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import Loading from "../../components/common/Loading";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import StatCard from "../../components/common/stat-card";

import DatePicker from "../../components/form/date-picker";
import { useGetPosSalesSummaryQuery } from "../../features/pos/posApi";
import { formatCurrencyEnglish } from "../../utlis";
import PaymentBox from "./PaymentBox";

export default function PosSalesSummaryPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data, isLoading, isError, refetch } = useGetPosSalesSummaryQuery({});

  const salesData = data?.data;

  return (
    <div>
      {/* 🔹 Page SEO Meta */}
      <PageMeta
        title="Today's POS Sales Summary"
        description="View today's POS sales summary and payment breakdown"
      />

      {/* 🔹 Breadcrumb */}
      <PageBreadcrumb pageTitle="Today's POS Sales" />

      {/* 🔹 Page Container */}
      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/5">
        {/* 🔹 Date Selector */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Sales Summary
          </h2>
          <div className="flex items-center gap-3">
            <div className="w-64">
              <DatePicker
                id="sales-date-picker"
                mode="single"
                value={selectedDate}
                onChange={(date) => {
                  if (date instanceof Date) {
                    setSelectedDate(date);
                  }
                }}
                placeholder="Select date"
                disableFuture={true}
                label="Date"
                isInLine={true}
              />
            </div>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors shadow-sm"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* 🔹 Loading State */}
        {isLoading && <Loading message="Loading Sale.." />}

        {/* 🔹 Error State */}
        {isError && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-red-500 text-lg mb-2">
                Failed to load sales summary
              </p>
              <p className="text-gray-500 text-sm">
                Please try again later or contact support
              </p>
            </div>
          </div>
        )}

        {/* 🔹 Display Data */}
        {!isLoading && !isError && salesData && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
              <StatCard
                icon={ShoppingCart}
                title="Total Sales"
                value={`${salesData.total_sales}`}
                bgColor="indigo"
              />

              <StatCard
                icon={DollarSign}
                title="Total Revenue"
                value={formatCurrencyEnglish(salesData.total_revenue)}
                bgColor="green"
              />

              <StatCard
                icon={Wallet}
                title="Cash Payments"
                value={formatCurrencyEnglish(salesData.payment_breakdown.cash)}
                bgColor="blue"
              />

              <StatCard
                icon={CreditCard}
                title="Card Payments"
                value={formatCurrencyEnglish(salesData.payment_breakdown.card)}
                bgColor="purple"
              />
            </div>

            {/* 🔹 Payment Breakdown */}
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                Payment Method Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PaymentBox
                  icon={
                    <Banknote className="text-blue-600 dark:text-blue-400" />
                  }
                  bg="bg-blue-100 dark:bg-blue-800/50"
                  label="Cash"
                  amount={formatCurrencyEnglish(
                    salesData.payment_breakdown.cash
                  )}
                />
                <PaymentBox
                  icon={
                    <CreditCard className="text-purple-600 dark:text-purple-400" />
                  }
                  bg="bg-purple-100 dark:bg-purple-800/50"
                  label="Card"
                  amount={formatCurrencyEnglish(
                    salesData.payment_breakdown.card
                  )}
                />
                <PaymentBox
                  icon={
                    <Smartphone className="text-green-600 dark:text-green-400" />
                  }
                  bg="bg-green-100 dark:bg-green-800/50"
                  label="Mobile"
                  amount={formatCurrencyEnglish(
                    salesData.payment_breakdown.mobile
                  )}
                />
              </div>
            </div>

            {/* 🔹 Summary Info */}
            <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing sales data for{" "}
                <span className="font-semibold text-gray-800 dark:text-white">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
