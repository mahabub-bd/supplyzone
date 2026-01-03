import { ApexOptions } from "apexcharts";
import { useState } from "react";
import Chart from "react-apexcharts";

import { Calendar } from "lucide-react";
import { useGetMonthWiseAnalyticsQuery } from "../../features/sale/saleApi";
import Loading from "../common/Loading";

export default function YearlyMonthWiseSalesChart() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { data, isLoading, isError } = useGetMonthWiseAnalyticsQuery({
    year: selectedYear,
  });

  const analytics = data?.data;

  // Prepare month numbers for x-axis
  const monthNumbers = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Create a map of existing data (using month number as key)
  const salesMap = new Map(
    analytics?.monthlySales?.map((sale) => [sale.month, sale]) || []
  );

  // Fill in missing months with 0
  const salesData = monthNumbers.map((_, index) => {
    const monthNumber = index + 1;
    const monthData = salesMap.get(monthNumber);
    return monthData ? monthData.total : 0;
  });

  const ordersData = monthNumbers.map((_, index) => {
    const monthNumber = index + 1;
    const monthData = salesMap.get(monthNumber);
    return monthData ? monthData.orders : 0;
  });

  const options: ApexOptions = {
    colors: ["#465fff", "#f59e0b"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 380,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: monthNumbers,
      labels: {
        style: {
          colors: "#9ca3af",
        },
      },
    },

    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: {
        colors: "#9ca3af",
      },
    },
    fill: {
      opacity: 1,
    },
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 4,
    },
    tooltip: {
      theme: "light",
      y: [
        {
          formatter: (value) => `৳${value.toLocaleString()}`,
        },
        {
          formatter: (value) => `${value} `,
        },
      ],
    },
  };

  const series = [
    {
      name: "Sales",
      data: salesData,
    },
    {
      name: "Orders",
      data: ordersData,
    },
  ];

  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  if (isLoading) {
    return <Loading message="Loadings..." />;
  }

  if (isError || !analytics) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/10 p-6">
        <p className="text-red-600 dark:text-red-400">
          Failed to load sales analytics
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Month-Wise Sales Analysis
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Yearly breakdown of sales and orders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-linear-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Yearly Sales
          </p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            ৳{analytics.totalYearlySales.toLocaleString()}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-linear-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Yearly Orders
          </p>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
            {analytics.totalYearlyOrders}
          </p>
        </div>
      </div>

      <Chart options={options} series={series} type="bar" height={380} />
    </div>
  );
}
