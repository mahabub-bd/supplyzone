import { useEffect, useState } from "react";
import { ProductionOrder, ProductionOrderPriority, ProductionOrderStatus } from "../../types/production";

// Custom hook for production order form validation
export const useProductionOrderForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (formData: any) => {
    const newErrors: Record<string, string> = {};

    // Title validation
    if (!formData.title?.trim()) {
      newErrors.title = "Title is required";
    }

    // Manufacturer validation
    if (!formData.manufacturer_id) {
      newErrors.manufacturer_id = "Manufacturer is required";
    }

    // Warehouse validation
    if (!formData.warehouse_id) {
      newErrors.warehouse_id = "Warehouse is required";
    }

    // Priority validation
    if (!formData.priority) {
      newErrors.priority = "Priority is required";
    }

    // Date validation
    if (!formData.planned_start_date) {
      newErrors.planned_start_date = "Planned start date is required";
    }

    if (!formData.planned_completion_date) {
      newErrors.planned_completion_date = "Planned completion date is required";
    }

    if (formData.planned_start_date && formData.planned_completion_date) {
      const startDate = new Date(formData.planned_start_date);
      const completionDate = new Date(formData.planned_completion_date);

      if (completionDate <= startDate) {
        newErrors.planned_completion_date = "Completion date must be after start date";
      }
    }

    // Items validation
    if (!formData.items || formData.items.length === 0) {
      newErrors.items = "At least one item is required";
    } else {
      formData.items.forEach((item: any, index: number) => {
        if (!item.product_id) {
          newErrors[`items_${index}_product_id`] = "Product is required";
        }
        if (!item.planned_quantity || item.planned_quantity <= 0) {
          newErrors[`items_${index}_planned_quantity`] = "Quantity must be greater than 0";
        }
        if (!item.estimated_unit_cost || item.estimated_unit_cost <= 0) {
          newErrors[`items_${index}_estimated_unit_cost`] = "Unit cost must be greater than 0";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearErrors = () => {
    setErrors({});
  };

  const getFieldError = (fieldName: string) => {
    return errors[fieldName] || "";
  };

  const hasError = (fieldName: string) => {
    return !!errors[fieldName];
  };

  return {
    errors,
    isSubmitting,
    setIsSubmitting,
    validateForm,
    clearErrors,
    getFieldError,
    hasError,
  };
};

// Custom hook for production order status calculations
export const useProductionOrderStatus = (productionOrder?: ProductionOrder) => {
  const [statusInfo, setStatusInfo] = useState({
    color: "gray",
    label: "Unknown",
    isCompleted: false,
    canStart: false,
    canComplete: false,
    canCancel: false,
    canHold: false,
  });

  useEffect(() => {
    if (!productionOrder) return;

    const statusConfig = {
      [ProductionOrderStatus.PENDING]: {
        color: "yellow",
        label: "Pending",
        isCompleted: false,
        canStart: true,
        canComplete: false,
        canCancel: true,
        canHold: false,
      },
      [ProductionOrderStatus.IN_PROGRESS]: {
        color: "blue",
        label: "In Progress",
        isCompleted: false,
        canStart: false,
        canComplete: true,
        canCancel: true,
        canHold: true,
      },
      [ProductionOrderStatus.ON_HOLD]: {
        color: "orange",
        label: "On Hold",
        isCompleted: false,
        canStart: true,
        canComplete: false,
        canCancel: true,
        canHold: false,
      },
      [ProductionOrderStatus.COMPLETED]: {
        color: "green",
        label: "Completed",
        isCompleted: true,
        canStart: false,
        canComplete: false,
        canCancel: false,
        canHold: false,
      },
      [ProductionOrderStatus.CANCELLED]: {
        color: "red",
        label: "Cancelled",
        isCompleted: true,
        canStart: false,
        canComplete: false,
        canCancel: false,
        canHold: false,
      },
    };

    setStatusInfo(statusConfig[productionOrder.status] || statusConfig[ProductionOrderStatus.PENDING]);
  }, [productionOrder]);

  return statusInfo;
};

// Custom hook for production order priority display
export const useProductionOrderPriority = (priority?: ProductionOrderPriority) => {
  const [priorityInfo, setPriorityInfo] = useState({
    color: "gray",
    label: "Normal",
    level: 1,
  });

  useEffect(() => {
    if (!priority) return;

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

    setPriorityInfo(priorityConfig[priority] || priorityConfig[ProductionOrderPriority.NORMAL]);
  }, [priority]);

  return priorityInfo;
};

// Custom hook for production order progress calculations
export const useProductionOrderProgress = (productionOrder?: ProductionOrder) => {
  const [progress, setProgress] = useState({
    percentage: 0,
    status: "Not Started",
    quantityProgress: {
      planned: 0,
      actual: 0,
      good: 0,
      defective: 0,
    },
    costProgress: {
      estimated: 0,
      actual: 0,
      variance: 0,
    },
  });

  useEffect(() => {
    if (!productionOrder) return;

    const { summary } = productionOrder;
    const totalPlanned = summary.total_planned_quantity;
    const totalActual = summary.total_actual_quantity;
    const totalGood = summary.total_good_quantity;
    const totalDefective = summary.total_defective_quantity;

    // Calculate progress percentage
    let progressPercentage = 0;
    let progressStatus = "Not Started";

    if (totalPlanned > 0) {
      progressPercentage = Math.round((totalActual / totalPlanned) * 100);

      if (progressPercentage === 0) {
        progressStatus = "Not Started";
      } else if (progressPercentage < 100) {
        progressStatus = "In Progress";
      } else {
        progressStatus = "Completed";
      }
    }

    // Calculate cost variance
    const estimatedCost = summary.total_estimated_cost;
    const actualCost = summary.total_actual_cost;
    const costVariance = estimatedCost > 0 ? ((actualCost - estimatedCost) / estimatedCost) * 100 : 0;

    setProgress({
      percentage: progressPercentage,
      status: progressStatus,
      quantityProgress: {
        planned: totalPlanned,
        actual: totalActual,
        good: totalGood,
        defective: totalDefective,
      },
      costProgress: {
        estimated: estimatedCost,
        actual: actualCost,
        variance: costVariance,
      },
    });
  }, [productionOrder]);

  return progress;
};

// Custom hook for filtering production orders
export const useProductionOrderFilters = () => {
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    manufacturer_id: "",
    warehouse_id: "",
    start_date: "",
    end_date: "",
  });

  const updateFilter = (key: string, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      priority: "",
      manufacturer_id: "",
      warehouse_id: "",
      start_date: "",
      end_date: "",
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(
      (value) => value !== "" && value !== null && value !== undefined
    ).length;
  };

  const getQueryParams = () => {
    const params: Record<string, any> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        params[key] = value;
      }
    });
    return params;
  };

  return {
    filters,
    updateFilter,
    clearFilters,
    getActiveFiltersCount,
    getQueryParams,
  };
};