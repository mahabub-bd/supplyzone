import { Download, Eye, FileText, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

import IconButton from "../../../components/common/IconButton";
import Loading from "../../../components/common/Loading";
import PageHeader from "../../../components/common/PageHeader";
import DatePicker from "../../../components/form/date-picker";
import Select from "../../../components/form/Select";
import Badge from "../../../components/ui/badge/Badge";
import { Modal } from "../../../components/ui/modal";
import Pagination from "../../../components/ui/pagination/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

import {
  useDeleteReportMutation,
  useGetReportsQuery,
  useLazyDownloadReportQuery,
} from "../../../features/report/reportApi";
import {
  Report,
  ReportFilterParams,
  ReportStatus,
  ReportType,
} from "../../../features/report/types";
import { useHasPermission } from "../../../hooks/useHasPermission";
import { formatDate } from "../../../utlis";
import GenerateReportModal from "./GenerateReportModal";

// Breadcrumb configuration
const breadcrumbItems = [{ name: "Reports", href: "" }];

// Report type options
const reportTypeOptions: { value: ReportType; label: string }[] = [
  { value: "sales", label: "Sales Report" },
  { value: "sales_daily", label: "Daily Sales Report" },
  { value: "purchase", label: "Purchase Report" },
  { value: "inventory", label: "Inventory Report" },
  { value: "inventory_stock", label: "Inventory Stock Report" },
  { value: "profit_loss", label: "Profit & Loss" },
  { value: "stock", label: "Stock Report" },
  { value: "products", label: "Products Report" },
  { value: "employees", label: "Employees Report" },
  { value: "expense", label: "Expense Report" },
  { value: "summary", label: "Summary Report" },
];

// Report status options
const statusOptions: { value: ReportStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
];

// Status badge variant mapping
const getStatusVariant = (
  status: ReportStatus
): "success" | "warning" | "error" | "primary" => {
  switch (status) {
    case "completed":
      return "success";
    case "processing":
      return "warning";
    case "failed":
      return "error";
    case "pending":
    default:
      return "primary";
  }
};

// Report type badge variant mapping
const getReportTypeVariant = (
  type: ReportType
): "primary" | "info" | "warning" | "success" | "error" | "dark" => {
  switch (type) {
    case "sales":
    case "sales_daily":
      return "primary";
    case "purchase":
      return "info";
    case "inventory":
    case "inventory_stock":
    case "stock":
      return "warning";
    case "profit_loss":
      return "success";
    case "expense":
      return "error";
    case "products":
      return "primary";
    case "employees":
      return "dark";
    case "summary":
      return "info";
    default:
      return "primary";
  }
};

export default function ReportList() {
  const canView = useHasPermission("report.view");

  const canDelete = useHasPermission("report.delete");
  const canGenerate = useHasPermission("report.generate");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [filters, setFilters] = useState<{
    type: ReportType | undefined;
    status: ReportStatus | undefined;
    fromDate: string | undefined;
    toDate: string | undefined;
  }>({
    type: undefined,
    status: undefined,
    fromDate: undefined,
    toDate: undefined,
  });

  // Modal states
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Fetch reports
  const {
    data,
    isLoading: isReportsLoading,
    isFetching,
    refetch,
  } = useGetReportsQuery({
    page,
    limit,
    type: filters.type,
    status: filters.status,
  } as ReportFilterParams);

  const reports = data?.data || [];

  // Download report mutation
  const [downloadReport] = useLazyDownloadReportQuery();

  // Delete report mutation
  const [deleteReport] = useDeleteReportMutation();

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle filter changes
  const handleFilterChange = (key: string, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }));
    setPage(1); // Reset to first page when filter changes
  };

  // Handle download
  const handleDownload = async (report: Report) => {
    try {
      const { data: blob } = await downloadReport(report.id, true);
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${report.title}.${
          report.file_path?.split(".").pop() || "pdf"
        }`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Report downloaded successfully");
      }
    } catch (error) {
      toast.error("Failed to download report");
    }
  };

  // Handle delete
  const handleDelete = async (reportId: number) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        await deleteReport(reportId).unwrap();
        toast.success("Report deleted successfully");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete report");
      }
    }
  };

  // Handle view details
  const handleViewDetails = (report: Report) => {
    setSelectedReport(report);
    setDetailModalOpen(true);
  };

  if (!canView) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">
          You don't have permission to view reports.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Reports"
          subtitle="Manage and generate business reports"
          breadcrumb={breadcrumbItems}
          onAdd={() => setGenerateModalOpen(true)}
          addLabel="Generate Report"
          icon={<Plus size={16} />}
          permission="report.generate"
        />

        {/* Filters */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Report Type Filter */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Report Type
              </label>
              <Select
                value={filters.type || ""}
                onChange={(value) => handleFilterChange("type", value)}
                options={[
                  { value: "", label: "All Types" },
                  ...reportTypeOptions.map((opt) => ({
                    value: opt.value,
                    label: opt.label,
                  })),
                ]}
                className="w-full"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <Select
                value={filters.status || ""}
                onChange={(value) => handleFilterChange("status", value)}
                options={[
                  { value: "", label: "All Status" },
                  ...statusOptions.map((opt) => ({
                    value: opt.value,
                    label: opt.label,
                  })),
                ]}
                className="w-full"
              />
            </div>

            {/* From Date Filter */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                From Date
              </label>
              <DatePicker
                id="report-filter-from-date"
                value={filters.fromDate ? new Date(filters.fromDate) : null}
                onChange={(value) => {
                  const date = Array.isArray(value) ? value[0] : value;
                  const dateStr = date ? date.toISOString().split('T')[0] : undefined;
                  handleFilterChange("fromDate", dateStr);
                }}
                placeholder="Select from date"
              />
            </div>

            {/* To Date Filter */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                To Date
              </label>
              <DatePicker
                id="report-filter-to-date"
                value={filters.toDate ? new Date(filters.toDate) : null}
                onChange={(value) => {
                  const date = Array.isArray(value) ? value[0] : value;
                  const dateStr = date ? date.toISOString().split('T')[0] : undefined;
                  handleFilterChange("toDate", dateStr);
                }}
                placeholder="Select to date"
              />
            </div>

            {/* Refresh Button */}
            <div className="flex items-end">
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <RefreshCw
                  size={18}
                  className={isFetching ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader className="min-w-50">
                    Title
                  </TableCell>
                  <TableCell isHeader>Type</TableCell>
                  <TableCell isHeader>Status</TableCell>
                  <TableCell isHeader>Generated At</TableCell>
                  <TableCell isHeader>Created By</TableCell>
                  <TableCell isHeader className="text-right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isReportsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      <Loading />
                    </TableCell>
                  </TableRow>
                ) : reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center">
                        <FileText size={48} className="mb-3 text-gray-400" />
                        <p className="text-gray-500">No reports found</p>
                        {canGenerate && (
                          <button
                            onClick={() => setGenerateModalOpen(true)}
                            className="mt-3 text-primary hover:underline"
                          >
                            Generate your first report
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report: Report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {report.title}
                          </p>
                          {report.description && (
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {report.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge color={getReportTypeVariant(report.type)}>
                          {
                            reportTypeOptions.find(
                              (opt) => opt.value === report.type
                            )?.label
                          }
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge color={getStatusVariant(report.status)}>
                          {report.status.charAt(0).toUpperCase() +
                            report.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {report.generated_at
                          ? formatDate(report.generated_at)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {report.created_by_user?.full_name ||
                            `User #${report.created_by}`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {/* View Details */}
                          <IconButton
                            icon={Eye}
                            onClick={() => handleViewDetails(report)}
                            tooltip="View Details"
                            color="blue"
                          />

                          {/* Download */}
                          {report.status === "completed" &&
                            report.file_path && (
                              <IconButton
                                icon={Download}
                                onClick={() => handleDownload(report)}
                                tooltip="Download"
                                color="green"
                              />
                            )}

                          {/* Delete */}
                          {canDelete && (
                            <IconButton
                              icon={Trash2}
                              onClick={() => handleDelete(report.id)}
                              tooltip="Delete"
                              color="red"
                            />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data?.meta && (
            <div className="border-t border-gray-200 p-4 dark:border-gray-800">
              <Pagination meta={data.meta} onPageChange={handlePageChange} />
            </div>
          )}
        </div>
      </div>

      {/* Generate Report Modal */}
      {generateModalOpen && (
        <GenerateReportModal
          isOpen={generateModalOpen}
          onClose={() => setGenerateModalOpen(false)}
          onSuccess={() => {
            setGenerateModalOpen(false);
            refetch();
          }}
        />
      )}

      {/* Report Detail Modal */}
      {detailModalOpen && selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          isOpen={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedReport(null);
          }}
          onDownload={() => {
            handleDownload(selectedReport);
            setDetailModalOpen(false);
          }}
        />
      )}
    </>
  );
}

// Report Detail Modal Component
function ReportDetailModal({
  report,
  isOpen,
  onClose,
  onDownload,
}: {
  report: Report;
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report Details">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Title
          </label>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {report.title}
          </p>
        </div>

        {report.description && (
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Description
            </label>
            <p className="text-gray-700 dark:text-gray-300">
              {report.description}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Type
            </label>
            <p className="text-gray-900 dark:text-white capitalize">
              {report.type.replace(/_/g, " ")}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Status
            </label>
            <Badge color={getStatusVariant(report.status)}>
              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
            </Badge>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Format
            </label>
            <p className="text-gray-900 dark:text-white uppercase">
              {report.format || "N/A"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Records
            </label>
            <p className="text-gray-900 dark:text-white">
              {report.total_records ?? "N/A"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Generated At
            </label>
            <p className="text-gray-900 dark:text-white">
              {report.generated_at
                ? formatDate(report.generated_at)
                : "Not generated yet"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Created At
            </label>
            <p className="text-gray-900 dark:text-white">
              {formatDate(report.created_at)}
            </p>
          </div>

          {report.branch && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Branch
              </label>
              <p className="text-gray-900 dark:text-white">
                {report.branch.name}
              </p>
            </div>
          )}

          {report.created_by_user && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Created By
              </label>
              <p className="text-gray-900 dark:text-white">
                {report.created_by_user.full_name} (
                {report.created_by_user.username})
              </p>
            </div>
          )}
        </div>

        {report.error_message && (
          <div>
            <label className="text-sm font-medium text-red-500 dark:text-red-400">
              Error Message
            </label>
            <p className="mt-1 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {report.error_message}
            </p>
          </div>
        )}

        {report.parameters && Object.keys(report.parameters).length > 0 && (
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Parameters
            </label>
            <pre className="mt-1 overflow-auto rounded-lg bg-gray-100 p-3 text-sm dark:bg-gray-800">
              {JSON.stringify(report.parameters, null, 2)}
            </pre>
          </div>
        )}

        {report.data && Object.keys(report.data).length > 0 && (
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Report Data Summary
            </label>
            <pre className="mt-1 max-h-96 overflow-auto rounded-lg bg-gray-100 p-3 text-xs dark:bg-gray-800">
              {JSON.stringify(report.data, null, 2)}
            </pre>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Close
          </button>
          {report.status === "completed" && report.file_path && (
            <button
              onClick={onDownload}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
            >
              <Download size={16} />
              Download Report
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
