import {
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  MoreVertical,
  Package,
  Pause,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wrench,
  X,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import Loading from "../../../components/common/Loading";
import PageHeader from "../../../components/common/PageHeader";
import StatCard from "../../../components/common/stat-card";
import { SelectField } from "../../../components/form/form-elements/SelectFiled";
import { Dropdown } from "../../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../../components/ui/dropdown/DropdownItem";
import Pagination from "../../../components/ui/pagination/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  useDeleteProductionOrderMutation,
  useGetProductionOrdersQuery,
  useGetProductionOrderStatsQuery,
} from "../../../features/production/productionApi";
import { useHasPermission } from "../../../hooks/useHasPermission";
import {
  ProductionFilters,
  ProductionOrderPriority,
  ProductionOrderStatus,
} from "../../../types/production";

export default function ProductionOrderList() {
  const navigate = useNavigate();

  // Filter states
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState<
    ProductionOrderStatus | undefined
  >();
  const [selectedPriority, setSelectedPriority] = useState<
    ProductionOrderPriority | undefined
  >();
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Build filter object
  const filters: ProductionFilters = {
    page,
    limit,
    search: debouncedSearch,
    status: selectedStatus,
    priority: selectedPriority,
  };

  const { data, isLoading, isError } = useGetProductionOrdersQuery(filters);
  const { data: statsData } = useGetProductionOrderStatsQuery();
  const [deleteProductionOrder] = useDeleteProductionOrderMutation();

  const productionOrders = data?.data || [];
  const meta = data?.meta;
  const stats = statsData?.data;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<any>(null);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  const canEdit = useHasPermission("production.update");
  const canDelete = useHasPermission("production.delete");

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedStatus, selectedPriority]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchInput("");
    setSelectedStatus(undefined);
    setSelectedPriority(undefined);
    setPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchInput ||
    selectedStatus !== undefined ||
    selectedPriority !== undefined;

  // 🔹 Route Handlers
  const canView = useHasPermission("production.view");
  const openViewPage = useCallback(
    (order: any) => {
      navigate(`/production/orders/${order.id}`);
    },
    [navigate]
  );

  const openCreatePage = useCallback(() => {
    navigate("/production/orders/create");
  }, [navigate]);

  const openEditPage = useCallback(
    (order: any) => {
      navigate(`/production/orders/${order.id}/edit`);
    },
    [navigate]
  );

  // 🔹 Delete Handling
  const openDeleteDialog = useCallback((order: any) => {
    setOrderToDelete(order);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!orderToDelete) return;
    try {
      await deleteProductionOrder(orderToDelete.id).unwrap();
      toast.success("Production order deleted successfully");
    } catch {
      toast.error("Failed to delete production order");
    } finally {
      setIsDeleteModalOpen(false);
      setOrderToDelete(null);
    }
  }, [orderToDelete, deleteProductionOrder]);

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setOrderToDelete(null);
  }, []);

  // 🔹 Dropdown Handling
  const toggleDropdown = useCallback(
    (orderId: number) => {
      setActiveDropdown(activeDropdown === orderId ? null : orderId);
    },
    [activeDropdown]
  );

  const closeDropdown = useCallback(() => {
    setActiveDropdown(null);
  }, []);

  // 🔹 Loading & Error States
  if (isLoading) return <Loading message="Loading Production Orders..." />;
  if (isError)
    return (
      <p className="p-6 text-red-500">Failed to fetch production orders.</p>
    );

  return (
    <>
      {/* Header Section */}
      <PageHeader
        title="Production Orders"
        icon={<Plus size={16} />}
        addLabel="Create Order"
        onAdd={openCreatePage}
        permission="production.create"
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard
            icon={Package}
            title="Total Orders"
            value={stats.totalOrders}
            bgColor="blue"
            compact
          />
          <StatCard
            icon={Clock}
            title="Pending"
            value={stats.pendingOrders}
            bgColor="orange"
            compact
          />
          <StatCard
            icon={Wrench}
            title="In Progress"
            value={stats.inProgressOrders}
            bgColor="indigo"
            compact
          />
          <StatCard
            icon={Pause}
            title="On Hold"
            value={stats.onHoldOrders}
            bgColor="purple"
            compact
          />
          <StatCard
            icon={CheckCircle}
            title="Completed"
            value={stats.completedOrders}
            bgColor="green"
            compact
          />
          <StatCard
            icon={XCircle}
            title="Cancelled"
            value={stats.cancelledOrders}
            bgColor="default"
            compact
          />
        </div>
      )}

      {/* Search & Filters */}
      <div className="mb-4 space-y-4">
        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by order number, title, brand..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              showFilters || hasActiveFilters
                ? "bg-brand-50 border-brand-300 text-brand-700 dark:bg-brand-900/20 dark:border-brand-700 dark:text-brand-300"
                : "border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            }`}
          >
            Filters{" "}
            {hasActiveFilters &&
              `(${
                [searchInput, selectedStatus, selectedPriority].filter(Boolean)
                  .length
              })`}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
            >
              <X size={16} />
              Clear all
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Status Filter */}
              <SelectField
                label="Status"
                data={[
                  { id: "", name: "All Status" },
                  { id: "pending", name: "Pending" },
                  { id: "in_progress", name: "In Progress" },
                  { id: "on_hold", name: "On Hold" },
                  { id: "completed", name: "Completed" },
                  { id: "cancelled", name: "Cancelled" },
                ]}
                value={selectedStatus || ""}
                onChange={(value) =>
                  setSelectedStatus(value as ProductionOrderStatus)
                }
              />

              {/* Priority Filter */}
              <SelectField
                label="Priority"
                data={[
                  { id: "", name: "All Priorities" },
                  { id: "low", name: "Low" },
                  { id: "normal", name: "Normal" },
                  { id: "high", name: "High" },
                  { id: "urgent", name: "Urgent" },
                ]}
                value={selectedPriority || ""}
                onChange={(value) =>
                  setSelectedPriority(value as ProductionOrderPriority)
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-[#1e1e1e]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader>Order Details</TableCell>
                <TableCell isHeader>Brand</TableCell>
                <TableCell isHeader>Status</TableCell>
                <TableCell isHeader>Priority</TableCell>
                <TableCell isHeader>Progress</TableCell>
                <TableCell isHeader>Dates</TableCell>
                <TableCell isHeader>Actions</TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody>
              {productionOrders.length > 0 ? (
                productionOrders.map((order: any) => {
                  // Calculate progress
                  const progress =
                    order.summary?.total_planned_quantity > 0
                      ? Math.round(
                          (order.summary.total_actual_quantity /
                            order.summary.total_planned_quantity) *
                            100
                        )
                      : 0;

                  // Status info
                  const getStatusInfo = (status: ProductionOrderStatus) => {
                    const statusConfig = {
                      pending: {
                        color: "yellow",
                        label: "Pending",
                        isCompleted: false,
                        canStart: true,
                      },
                      in_progress: {
                        color: "blue",
                        label: "In Progress",
                        isCompleted: false,
                        canStart: false,
                      },
                      on_hold: {
                        color: "orange",
                        label: "On Hold",
                        isCompleted: false,
                        canStart: true,
                      },
                      completed: {
                        color: "green",
                        label: "Completed",
                        isCompleted: true,
                        canStart: false,
                      },
                      cancelled: {
                        color: "red",
                        label: "Cancelled",
                        isCompleted: true,
                        canStart: false,
                      },
                    };
                    return statusConfig[status] || statusConfig.pending;
                  };

                  // Priority info
                  const getPriorityInfo = (
                    priority: ProductionOrderPriority
                  ) => {
                    const priorityConfig = {
                      low: { color: "gray", label: "Low", level: 1 },
                      normal: { color: "blue", label: "Normal", level: 2 },
                      high: { color: "orange", label: "High", level: 3 },
                      urgent: { color: "red", label: "Urgent", level: 4 },
                    };
                    return priorityConfig[priority] || priorityConfig.normal;
                  };

                  const statusInfo = getStatusInfo(order.status);
                  const priorityInfo = getPriorityInfo(order.priority);

                  return (
                    <TableRow
                      key={order.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <TableCell className="py-3">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {order.order_number}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {order.title}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <div className="text-gray-900 dark:text-white">
                          {order.brand?.name || "-"}
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          {statusInfo.isCompleted ? (
                            <CheckCircle
                              size={16}
                              className={
                                statusInfo.color === "green"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            />
                          ) : statusInfo.canStart ? (
                            <Clock size={16} className="text-yellow-600" />
                          ) : (
                            <AlertCircle size={16} className="text-blue-600" />
                          )}
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              statusInfo.color === "green"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                                : statusInfo.color === "yellow"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                                : statusInfo.color === "red"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                            }`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            priorityInfo.level === 4
                              ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                              : priorityInfo.level === 3
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
                              : priorityInfo.level === 2
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
                          }`}
                        >
                          {priorityInfo.label}
                        </span>
                      </TableCell>

                      <TableCell className="py-3">
                        <div className="w-full">
                          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                            <span>{progress}%</span>
                            <span>
                              {order.summary?.total_actual_quantity || 0} /{" "}
                              {order.summary?.total_planned_quantity || 0}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                progress === 100
                                  ? "bg-green-500"
                                  : progress >= 75
                                  ? "bg-blue-500"
                                  : progress >= 50
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <div className="text-sm">
                          <div>
                            Start:{" "}
                            {order.planned_start_date
                              ? new Date(
                                  order.planned_start_date
                                ).toLocaleDateString()
                              : "-"}
                          </div>
                          <div>
                            End:{" "}
                            {order.planned_completion_date
                              ? new Date(
                                  order.planned_completion_date
                                ).toLocaleDateString()
                              : "-"}
                          </div>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3">
                        <div className="relative">
                          <button
                            onClick={() => toggleDropdown(order.id)}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Actions"
                          >
                            <MoreVertical size={16} className="text-gray-600" />
                          </button>

                          <Dropdown
                            isOpen={activeDropdown === order.id}
                            onClose={() => {
                              closeDropdown();
                              closeDeleteModal();
                            }}
                            className="min-w-40"
                          >
                            {canView && (
                              <DropdownItem
                                onClick={() => {
                                  openViewPage(order);
                                  closeDropdown();
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Eye size={16} />
                                View
                              </DropdownItem>
                            )}

                            {canEdit && (
                              <DropdownItem
                                onClick={() => {
                                  openEditPage(order);
                                  closeDropdown();
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Pencil size={16} />
                                Edit
                              </DropdownItem>
                            )}

                            {canDelete && (
                              <DropdownItem
                                onClick={() => {
                                  openDeleteDialog(order);
                                  closeDropdown();
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={16} />
                                Delete
                              </DropdownItem>
                            )}
                          </Dropdown>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center gap-2 w-full justify-center">
                      <Wrench size={48} className="text-gray-300" />
                      <p className="text-lg font-medium">
                        No production orders found
                      </p>
                      <p className="text-sm">
                        Get started by creating your first production order
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <Pagination
          meta={{
            currentPage: meta.page,
            totalPages: meta.totalPages,
            total: meta.total,
          }}
          onPageChange={handlePageChange}
          currentPageItems={productionOrders.length}
          itemsPerPage={limit}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {canDelete && (
        <ConfirmDialog
          isOpen={isDeleteModalOpen}
          title="Delete Production Order"
          message={`Are you sure you want to delete "${
            orderToDelete?.order_number || orderToDelete?.title
          }"? This action cannot be undone.`}
          confirmLabel="Yes, Delete"
          cancelLabel="Cancel"
          onConfirm={confirmDelete}
          onCancel={closeDeleteModal}
        />
      )}
    </>
  );
}
