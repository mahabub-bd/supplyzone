import { ApexOptions } from "apexcharts";
import { TrendingUp } from "lucide-react";
import Chart from "react-apexcharts";
import { useGetLast30DaysAnalyticsQuery } from "../../features/sale/saleApi";
import Loading from "../common/Loading";

export default function Last30DaysSalesChart() {
  const { data, isLoading, isError } = useGetLast30DaysAnalyticsQuery();

  const analytics = data?.data;

  // Format dates and prepare chart data
  const dates =
    analytics?.dailySales?.map((sale) => {
      const date = new Date(sale.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }) || [];

  const salesData = analytics?.dailySales?.map((sale) => sale.total) || [];
  const ordersData = analytics?.dailySales?.map((sale) => sale.orders) || [];

  const options: ApexOptions = {
    colors: ["#465fff", "#34d399"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "area",
      height: 350,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    xaxis: {
      categories: dates,
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
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100],
      },
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
          formatter: (value) => `${value}`,
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
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Last 30 Days Sales Performance
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Sales
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ৳{analytics.totalSales.toLocaleString()}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Orders
            </p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {analytics.totalOrders}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/10">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Average Order Value
            </p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2">
              ৳
              {analytics.averageOrderValue.toLocaleString("en-US", {
                maximumFractionDigits: 2,
              })}
              <TrendingUp className="w-5 h-5" />
            </p>
          </div>
        </div>
      </div>

      <Chart options={options} series={series} type="area" height={350} />
    </div>
  );
}
