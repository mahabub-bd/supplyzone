import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Package
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../../components/common/Loading";
import PageHeader from "../../../components/common/PageHeader";
import {
  useGetProductionOrderByIdQuery,
  useGetProductionOrderLogsQuery,
} from "../../../features/production/productionApi";
import { ProductionOrderPriority, ProductionOrderStatus } from "../../../types/production";

export default function ProductionOrderDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data: orderData,
    isLoading: isLoadingOrder,
    isError: orderError,
  } = useGetProductionOrderByIdQuery(id as string, {
    skip: !id,
  });

  const {
    data: logsData,
    isLoading: isLoadingLogs,
  } = useGetProductionOrderLogsQuery(id as string, {
    skip: !id,
  });

  const [order, setOrder] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  // Helper function for status info
  const getStatusInfo = (status: ProductionOrderStatus) => {
    const statusConfig = {
      [ProductionOrderStatus.PENDING]: {
        color: "yellow",
        label: "Pending",
        isCompleted: false,
        canStart: true,
      },
      [ProductionOrderStatus.IN_PROGRESS]: {
        color: "blue",
        label: "In Progress",
        isCompleted: false,
        canStart: false,
      },
      [ProductionOrderStatus.ON_HOLD]: {
        color: "orange",
        label: "On Hold",
        isCompleted: false,
        canStart: true,
      },
      [ProductionOrderStatus.COMPLETED]: {
        color: "green",
        label: "Completed",
        isCompleted: true,
        canStart: false,
      },
      [ProductionOrderStatus.CANCELLED]: {
        color: "red",
        label: "Cancelled",
        isCompleted: true,
        canStart: false,
      },
    };
    return statusConfig[status] || statusConfig[ProductionOrderStatus.PENDING];
  };

  // Helper function for priority info
  const getPriorityInfo = (priority: ProductionOrderPriority) => {
    const priorityConfig = {
      [ProductionOrderPriority.LOW]: {
        color: "gray",
        label: "Low",
        level: 1,
      },
      [ProductionOrderPriority.NORMAL]: {
        color: "blue",
        label: "Normal",
        level: 2,
      },
      [ProductionOrderPriority.HIGH]: {
        color: "orange",
        label: "High",
        level: 3,
      },
      [ProductionOrderPriority.URGENT]: {
        color: "red",
        label: "Urgent",
        level: 4,
      },
    };
    return priorityConfig[priority] || priorityConfig[ProductionOrderPriority.NORMAL];
  };

  useEffect(() => {
    if (orderData?.data) {
      setOrder(orderData.data);
    }
  }, [orderData]);

  useEffect(() => {
    if (logsData?.data) {
      setLogs(logsData.data);
    }
  }, [logsData]);

  // 🔹 Route Handlers
  const openEditPage = useCallback(() => {
    if (id) {
      navigate(`/production/orders/${id}/edit`);
    }
  }, [navigate, id]);

  // Loading state
  if (isLoadingOrder || isLoadingLogs) return <Loading message="Loading production order details..." />;
  if (orderError || !order) return <div>Production order not found</div>;

  const statusInfo = getStatusInfo(order.status);
  const priorityInfo = getPriorityInfo(order.priority);

  // Calculate progress percentage
  const progress = order.summary?.total_planned_quantity > 0
    ? Math.round((order.summary.total_actual_quantity / order.summary.total_planned_quantity) * 100)
    : 0;

  return (
    <>
      <PageHeader
        title={order.order_number}
        subtitle={order.title}
        breadcrumb={[
          { name: "Production Orders", href: "/production/orders" },
          { name: order.order_number, href: "" },
        ]}
        action={{
          label: "Edit Order",
          icon: <Edit size={16} />,
          onClick: openEditPage,
          permission: "production.edit",
        }}
      />

      <div className="max-w-7xl">
        {/* Status Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {statusInfo.isCompleted ? (
                  <CheckCircle size={20} className={statusInfo.color === "green" ? "text-green-600" : "text-red-600"} />
                ) : statusInfo.canStart ? (
                  <Clock size={20} className="text-yellow-600" />
                ) : (
                  <AlertTriangle size={20} className="text-orange-600" />
                )}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  statusInfo.color === "green" ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" :
                  statusInfo.color === "yellow" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300" :
                  statusInfo.color === "red" ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300" :
                  "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                }`}>
                  {statusInfo.label}
                </span>
              </div>

              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                priorityInfo.level === 4 ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300" :
                priorityInfo.level === 3 ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300" :
                priorityInfo.level === 2 ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300" :
                "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
              }`}>
                {priorityInfo.label}
              </span>
            </div>

            <div className="text-sm text-gray-500">
              Created: {new Date(order.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-8">
            {["overview", "items", "logs"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? "border-brand-500 text-brand-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Order Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Order Number
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {order.order_number}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {order.title}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Brand
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {order.brand?.name || "-"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Warehouse
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {order.warehouse?.name || "-"}
                    </p>
                  </div>
                </div>

                {order.description && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <p className="text-gray-600 dark:text-gray-300">
                      {order.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Progress */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Production Progress
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          progress === 100 ? "bg-green-500" :
                          progress >= 75 ? "bg-blue-500" :
                          progress >= 50 ? "bg-yellow-500" :
                          "bg-red-500"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {order.summary?.total_planned_quantity || 0}
                      </div>
                      <div className="text-xs text-gray-500">Planned</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {order.summary?.total_actual_quantity || 0}
                      </div>
                      <div className="text-xs text-gray-500">Actual</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {order.summary?.total_good_quantity || 0}
                      </div>
                      <div className="text-xs text-gray-500">Good</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {order.summary?.total_defective_quantity || 0}
                      </div>
                      <div className="text-xs text-gray-500">Defective</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Timeline */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Timeline
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar size={16} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Planned Start
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.planned_start_date ? new Date(order.planned_start_date).toLocaleDateString() : "-"}
                      </p>
                    </div>
                  </div>

                  {order.actual_start_date && (
                    <div className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-green-500 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Actual Start
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.actual_start_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Calendar size={16} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Planned Completion
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.planned_completion_date ? new Date(order.planned_completion_date).toLocaleDateString() : "-"}
                      </p>
                    </div>
                  </div>

                  {order.actual_completion_date && (
                    <div className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-green-500 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Actual Completion
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.actual_completion_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cost Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Cost Summary
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Estimated Cost</span>
                    <span className="font-medium">
                      ${order.summary?.total_estimated_cost?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Actual Cost</span>
                    <span className="font-medium">
                      ${order.summary?.total_actual_cost?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  {order.summary?.total_estimated_cost && order.summary?.total_actual_cost && (
                    <div className="flex justify-between border-t pt-3">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Difference</span>
                      <span className={`font-medium ${
                        order.summary.total_actual_cost > order.summary.total_estimated_cost
                          ? "text-red-600"
                          : "text-green-600"
                      }`}>
                        ${Math.abs(order.summary.total_actual_cost - order.summary.total_estimated_cost).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Items Tab */}
        {activeTab === "items" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Production Items
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Planned
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actual
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Good
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Defective
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {order.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.product?.name || "-"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.product?.sku || "-"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.planned_quantity || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.actual_quantity || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.good_quantity || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.defective_quantity || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ${item.total_cost?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.status === "completed" ? "bg-green-100 text-green-800" :
                          item.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                          item.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === "logs" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Activity Logs
              </h3>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {logs.length > 0 ? (
                logs.map((log: any) => (
                  <div key={log.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          {log.log_type === "order_created" && <Package size={16} className="text-gray-600" />}
                          {log.log_type === "status_changed" && <AlertTriangle size={16} className="text-gray-600" />}
                          {log.log_type === "production_started" && <CheckCircle size={16} className="text-gray-600" />}
                        </div>
                        <div>
                          <p className="text-sm text-gray-900 dark:text-white font-medium">
                            {log.message}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <span>by {log.user?.name || "System"}</span>
                            <span>{new Date(log.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-500">
                  <p>No activity logs found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}