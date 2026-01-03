import { useState } from "react";
import { toast } from "react-toastify";

import DatePicker from "../../../components/form/date-picker";
import Select from "../../../components/form/Select";
import { Modal } from "../../../components/ui/modal";
import {
  useGenerateAttendanceReportMutation,
  useGenerateExpenseReportMutation,
  useGenerateInventoryReportMutation,
  useGenerateProfitLossReportMutation,
  useGeneratePurchaseReportMutation,
  useGenerateSalesReportMutation,
} from "../../../features/report/reportApi";
import { ReportType } from "../../../features/report/types";

// Report type options
const reportTypeOptions = [
  { value: "sales", label: "Sales Report" },
  { value: "purchase", label: "Purchase Report" },
  { value: "inventory", label: "Inventory Report" },
  { value: "profit_loss", label: "Profit & Loss Report" },
  { value: "expense", label: "Expense Report" },
  { value: "attendance", label: "Attendance Report" },
];

// Period options for date-based reports
const periodOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "custom", label: "Custom Range" },
];

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GenerateReportModal({
  isOpen,
  onClose,
  onSuccess,
}: GenerateReportModalProps) {
  const [selectedType, setSelectedType] = useState<ReportType>("sales");
  const [isGenerating, setIsGenerating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    period: "custom",
    branch_id: "",
    customer_id: "",
    payment_method: "",
    supplier_id: "",
    warehouse_id: "",
    product_id: "",
    low_stock_only: false,
    category_id: "",
    employee_id: "",
    department_id: "",
  });

  // Mutations for different report types
  const [generateSalesReport] = useGenerateSalesReportMutation();
  const [generatePurchaseReport] = useGeneratePurchaseReportMutation();
  const [generateInventoryReport] = useGenerateInventoryReportMutation();
  const [generateProfitLossReport] = useGenerateProfitLossReportMutation();
  const [generateExpenseReport] = useGenerateExpenseReportMutation();
  const [generateAttendanceReport] = useGenerateAttendanceReportMutation();

  // Reset form when modal opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      start_date: "",
      end_date: "",
      period: "custom",
      branch_id: "",
      customer_id: "",
      payment_method: "",
      supplier_id: "",
      warehouse_id: "",
      product_id: "",
      low_stock_only: false,
      category_id: "",
      employee_id: "",
      department_id: "",
    });
    setSelectedType("sales");
    setIsGenerating(false);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter a report title");
      return;
    }

    setIsGenerating(true);

    try {
      const commonData = {
        title: formData.title,
        description: formData.description || undefined,
        ...(formData.period !== "custom" && { period: formData.period as "daily" | "weekly" | "monthly" | "yearly" }),
        ...(formData.start_date && { start_date: formData.start_date }),
        ...(formData.end_date && { end_date: formData.end_date }),
        ...(formData.branch_id && {
          branch_id: parseInt(formData.branch_id),
        }),
      };

      let result;

      switch (selectedType) {
        case "sales":
          result = await generateSalesReport({
            ...commonData,
            ...(formData.customer_id && {
              customer_id: parseInt(formData.customer_id),
            }),
            ...(formData.payment_method && {
              payment_method: formData.payment_method,
            }),
          }).unwrap();
          break;

        case "purchase":
          result = await generatePurchaseReport({
            ...commonData,
            ...(formData.supplier_id && {
              supplier_id: parseInt(formData.supplier_id),
            }),
            ...(formData.warehouse_id && {
              warehouse_id: parseInt(formData.warehouse_id),
            }),
          }).unwrap();
          break;

        case "inventory":
          result = await generateInventoryReport({
            ...commonData,
            ...(formData.warehouse_id && {
              warehouse_id: parseInt(formData.warehouse_id),
            }),
            ...(formData.product_id && {
              product_id: parseInt(formData.product_id),
            }),
            ...(formData.low_stock_only && {
              low_stock_only: formData.low_stock_only,
            }),
          }).unwrap();
          break;

        case "profit_loss":
          result = await generateProfitLossReport({
            ...commonData,
          }).unwrap();
          break;

        case "expense":
          result = await generateExpenseReport({
            ...commonData,
            ...(formData.category_id && {
              category_id: parseInt(formData.category_id),
            }),
            ...(formData.payment_method && {
              payment_method: formData.payment_method,
            }),
          }).unwrap();
          break;

        case "attendance":
          result = await generateAttendanceReport({
            ...commonData,
            ...(formData.employee_id && {
              employee_id: parseInt(formData.employee_id),
            }),
            ...(formData.department_id && {
              department_id: parseInt(formData.department_id),
            }),
          }).unwrap();
          break;

        default:
          throw new Error("Invalid report type");
      }

      toast.success(result?.message || "Report generated successfully");
      onSuccess();
      resetForm();
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || "Failed to generate report"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Report">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Report Type */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Report Type <span className="text-red-500">*</span>
          </label>
          <Select
            options={reportTypeOptions}
            value={selectedType}
            onChange={(value) => setSelectedType(value as ReportType)}
            className="w-full"
          />
        </div>

        {/* Title */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Report Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter report title"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter report description (optional)"
            rows={3}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>

        {/* Date Range Filters (for date-based reports) */}
        {["sales", "purchase", "profit_loss", "expense", "attendance"].includes(
          selectedType
        ) && (
          <>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Period
              </label>
              <Select
                options={periodOptions}
                value={formData.period}
                onChange={(value) => handleSelectChange("period", value)}
                className="w-full"
              />
            </div>

            {formData.period === "custom" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start Date
                  </label>
                  <DatePicker
                    id="report-start-date"
                    value={formData.start_date ? new Date(formData.start_date) : null}
                    onChange={(value) => {
                      const date = Array.isArray(value) ? value[0] : value;
                      const dateStr = date ? date.toISOString().split('T')[0] : '';
                      handleSelectChange("start_date", dateStr);
                    }}
                    placeholder="Select start date"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    End Date
                  </label>
                  <DatePicker
                    id="report-end-date"
                    value={formData.end_date ? new Date(formData.end_date) : null}
                    onChange={(value) => {
                      const date = Array.isArray(value) ? value[0] : value;
                      const dateStr = date ? date.toISOString().split('T')[0] : '';
                      handleSelectChange("end_date", dateStr);
                    }}
                    placeholder="Select end date"
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Sales-specific fields */}
        {selectedType === "sales" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Customer
              </label>
              <input
                type="number"
                name="customer_id"
                value={formData.customer_id}
                onChange={handleInputChange}
                placeholder="Customer ID"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Payment Method
              </label>
              <input
                type="text"
                name="payment_method"
                value={formData.payment_method}
                onChange={handleInputChange}
                placeholder="e.g., cash, card, online"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Purchase-specific fields */}
        {selectedType === "purchase" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Supplier
              </label>
              <input
                type="number"
                name="supplier_id"
                value={formData.supplier_id}
                onChange={handleInputChange}
                placeholder="Supplier ID"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Warehouse
              </label>
              <input
                type="number"
                name="warehouse_id"
                value={formData.warehouse_id}
                onChange={handleInputChange}
                placeholder="Warehouse ID"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Inventory-specific fields */}
        {selectedType === "inventory" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Warehouse
                </label>
                <input
                  type="number"
                  name="warehouse_id"
                  value={formData.warehouse_id}
                  onChange={handleInputChange}
                  placeholder="Warehouse ID"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Product
                </label>
                <input
                  type="number"
                  name="product_id"
                  value={formData.product_id}
                  onChange={handleInputChange}
                  placeholder="Product ID"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="low_stock_only"
                name="low_stock_only"
                checked={formData.low_stock_only}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    low_stock_only: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label
                htmlFor="low_stock_only"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Low Stock Only
              </label>
            </div>
          </>
        )}

        {/* Expense-specific fields */}
        {selectedType === "expense" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <input
                type="number"
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                placeholder="Category ID"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Payment Method
              </label>
              <input
                type="text"
                name="payment_method"
                value={formData.payment_method}
                onChange={handleInputChange}
                placeholder="Payment method"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Attendance-specific fields */}
        {selectedType === "attendance" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Employee
              </label>
              <input
                type="number"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleInputChange}
                placeholder="Employee ID"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Department
              </label>
              <input
                type="number"
                name="department_id"
                value={formData.department_id}
                onChange={handleInputChange}
                placeholder="Department ID"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            disabled={isGenerating}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isGenerating}
            className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {isGenerating ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
