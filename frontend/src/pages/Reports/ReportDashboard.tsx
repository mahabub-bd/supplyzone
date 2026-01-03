import {
  BarChart3,
  CheckCircle,
  Clock,
  FileText,
  TrendingUp,
  XCircle,
} from "lucide-react";

import { useGetReportDashboardSummaryQuery } from "../../features/report/reportApi";
import { formatDate } from "../../utlis";

export default function ReportDashboard() {
  const { data: dashboardData, isLoading } = useGetReportDashboardSummaryQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-800"></div>
            <div className="mt-2 h-8 w-16 rounded bg-gray-200 dark:bg-gray-800"></div>
          </div>
        ))}
      </div>
    );
  }

  const summary = dashboardData?.data;

  if (!summary) {
    return null;
  }

  const statCards = [
    {
      title: "Total Reports",
      value: summary.total_reports,
      icon: FileText,
      color: "bg-primary/10 text-primary",
      trend: "+12%",
    },
    {
      title: "Completed",
      value: summary.completed_reports,
      icon: CheckCircle,
      color: "bg-green-500/10 text-green-500",
      trend: "+8%",
    },
    {
      title: "Pending",
      value: summary.pending_reports,
      icon: Clock,
      color: "bg-yellow-500/10 text-yellow-500",
      trend: "Processing",
    },
    {
      title: "Failed",
      value: summary.failed_reports,
      icon: XCircle,
      color: "bg-red-500/10 text-red-500",
      trend: "-2%",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-gray-500">{stat.trend}</p>
              </div>
              <div className={`rounded-full p-3 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Reports by Type */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Reports by Type
            </h3>
            <BarChart3 className="text-gray-400" size={20} />
          </div>
          <div className="space-y-4">
            {Object.entries(summary.reports_by_type).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                      {type.replace("_", " ")}
                    </p>
                    <p className="text-sm text-gray-500">Type</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {count}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Reports
            </h3>
            <TrendingUp className="text-gray-400" size={20} />
          </div>
          <div className="space-y-4">
            {summary.recent_reports.length > 0 ? (
              summary.recent_reports.slice(0, 5).map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        report.status === "completed"
                          ? "bg-green-500/10"
                          : report.status === "failed"
                          ? "bg-red-500/10"
                          : "bg-yellow-500/10"
                      }`}
                    >
                      <FileText
                        size={18}
                        className={
                          report.status === "completed"
                            ? "text-green-500"
                            : report.status === "failed"
                            ? "text-red-500"
                            : "text-yellow-500"
                        }
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {report.title}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {report.type.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {report.generated_at
                        ? formatDate(report.generated_at)
                        : formatDate(report.created_at)}
                    </p>
                    <span
                      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        report.status === "completed"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : report.status === "failed"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-gray-500 py-8">
                No recent reports
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
