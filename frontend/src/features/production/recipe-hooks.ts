import { useEffect, useState } from "react";
import {
  MaterialConsumptionStatus,
  MaterialRequirementCalculation,
  MaterialType,
  ProductionRecipeStatus,
  ProductionRecipeType
} from "../../types/production-recipe";

// Custom hook for production recipe form validation
export const useProductionRecipeForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (formData: any) => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name?.trim()) {
      newErrors.name = "Recipe name is required";
    }

    // Finished product validation
    if (!formData.finished_product_id) {
      newErrors.finished_product_id = "Finished product is required";
    }

    // Recipe type validation
    if (!formData.recipe_type) {
      newErrors.recipe_type = "Recipe type is required";
    }

    // Standard quantity validation
    if (!formData.standard_quantity || formData.standard_quantity <= 0) {
      newErrors.standard_quantity = "Standard quantity must be greater than 0";
    }

    // Unit of measure validation
    if (!formData.unit_of_measure?.trim()) {
      newErrors.unit_of_measure = "Unit of measure is required";
    }

    // Estimated time validation
    if (formData.estimated_time_minutes && formData.estimated_time_minutes <= 0) {
      newErrors.estimated_time_minutes = "Estimated time must be greater than 0";
    }

    // Yield percentage validation
    if (formData.yield_percentage && (formData.yield_percentage <= 0 || formData.yield_percentage > 100)) {
      newErrors.yield_percentage = "Yield percentage must be between 0 and 100";
    }

    // Recipe items validation
    if (!formData.recipe_items || formData.recipe_items.length === 0) {
      newErrors.recipe_items = "At least one recipe item is required";
    } else {
      formData.recipe_items.forEach((item: any, index: number) => {
        if (!item.material_product_id) {
          newErrors[`recipe_items_${index}_material_product_id`] = "Material product is required";
        }
        if (!item.material_type) {
          newErrors[`recipe_items_${index}_material_type`] = "Material type is required";
        }
        if (!item.required_quantity || item.required_quantity <= 0) {
          newErrors[`recipe_items_${index}_required_quantity`] = "Required quantity must be greater than 0";
        }
        if (!item.unit_of_measure?.trim()) {
          newErrors[`recipe_items_${index}_unit_of_measure`] = "Unit of measure is required";
        }
        if (item.waste_percentage && (item.waste_percentage < 0 || item.waste_percentage > 100)) {
          newErrors[`recipe_items_${index}_waste_percentage`] = "Waste percentage must be between 0 and 100";
        }
        if (item.consumption_rate && (item.consumption_rate < 0 || item.consumption_rate > 1)) {
          newErrors[`recipe_items_${index}_consumption_rate`] = "Consumption rate must be between 0 and 1";
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

// Custom hook for production recipe status calculations
export const useProductionRecipeStatus = () => {
  const getStatusInfo = (status: ProductionRecipeStatus) => {
    const statusConfig = {
      [ProductionRecipeStatus.DRAFT]: {
        color: "yellow",
        label: "Draft",
        isActive: false,
        canActivate: true,
        canDeactivate: false,
        canEdit: true,
        canDelete: true,
      },
      [ProductionRecipeStatus.ACTIVE]: {
        color: "green",
        label: "Active",
        isActive: true,
        canActivate: false,
        canDeactivate: true,
        canEdit: true,
        canDelete: false,
      },
      [ProductionRecipeStatus.INACTIVE]: {
        color: "gray",
        label: "Inactive",
        isActive: false,
        canActivate: true,
        canDeactivate: false,
        canEdit: true,
        canDelete: true,
      },
      [ProductionRecipeStatus.ARCHIVED]: {
        color: "orange",
        label: "Archived",
        isActive: false,
        canActivate: false,
        canDeactivate: false,
        canEdit: false,
        canDelete: true,
      },
    };

    return statusConfig[status] || statusConfig[ProductionRecipeStatus.DRAFT];
  };

  return getStatusInfo;
};

// Custom hook for production recipe type display
export const useProductionRecipeType = () => {
  const getTypeInfo = (type: ProductionRecipeType) => {
    const typeConfig = {
      [ProductionRecipeType.MANUFACTURING]: {
        color: "blue",
        label: "Manufacturing",
        icon: "🏭",
      },
      [ProductionRecipeType.ASSEMBLY]: {
        color: "green",
        label: "Assembly",
        icon: "🔧",
      },
      [ProductionRecipeType.FORMULATION]: {
        color: "purple",
        label: "Formulation",
        icon: "🧪",
      },
      [ProductionRecipeType.MIXING]: {
        color: "orange",
        label: "Mixing",
        icon: "🥄",
      },
      [ProductionRecipeType.PROCESSING]: {
        color: "indigo",
        label: "Processing",
        icon: "⚙️",
      },
      [ProductionRecipeType.PACKAGING]: {
        color: "teal",
        label: "Packaging",
        icon: "📦",
      },
    };

    return typeConfig[type] || typeConfig[ProductionRecipeType.MANUFACTURING];
  };

  return getTypeInfo;
};

// Custom hook for material type display
export const useMaterialType = (type?: MaterialType) => {
  const [typeInfo, setTypeInfo] = useState({
    color: "gray",
    label: "Unknown",
    icon: "",
  });

  useEffect(() => {
    if (!type) return;

    const typeConfig = {
      [MaterialType.RAW_MATERIAL]: {
        color: "yellow",
        label: "Raw Material",
        icon: "🌾",
      },
      [MaterialType.COMPONENT]: {
        color: "blue",
        label: "Component",
        icon: "🔩",
      },
      [MaterialType.SUBASSEMBLY]: {
        color: "green",
        label: "Subassembly",
        icon: "🧩",
      },
      [MaterialType.CONSUMABLE]: {
        color: "purple",
        label: "Consumable",
        icon: "🧽",
      },
      [MaterialType.PACKAGING]: {
        color: "teal",
        label: "Packaging",
        icon: "📦",
      },
      [MaterialType.CHEMICAL]: {
        color: "red",
        label: "Chemical",
        icon: "🧪",
      },
      [MaterialType.ADDITIVE]: {
        color: "orange",
        label: "Additive",
        icon: "💊",
      },
    };

    setTypeInfo(typeConfig[type] || typeConfig[MaterialType.RAW_MATERIAL]);
  }, [type]);

  return typeInfo;
};

// Custom hook for material consumption status display
export const useMaterialConsumptionStatus = (status?: MaterialConsumptionStatus) => {
  const [statusInfo, setStatusInfo] = useState({
    color: "gray",
    label: "Unknown",
    icon: "",
  });

  useEffect(() => {
    if (!status) return;

    const statusConfig = {
      [MaterialConsumptionStatus.PLANNED]: {
        color: "yellow",
        label: "Planned",
        icon: "📋",
      },
      [MaterialConsumptionStatus.RESERVED]: {
        color: "blue",
        label: "Reserved",
        icon: "🔒",
      },
      [MaterialConsumptionStatus.CONSUMED]: {
        color: "green",
        label: "Consumed",
        icon: "✅",
      },
      [MaterialConsumptionStatus.WASTED]: {
        color: "red",
        label: "Wasted",
        icon: "❌",
      },
      [MaterialConsumptionStatus.RETURNED]: {
        color: "orange",
        label: "Returned",
        icon: "↩️",
      },
    };

    setStatusInfo(statusConfig[status] || statusConfig[MaterialConsumptionStatus.PLANNED]);
  }, [status]);

  return statusInfo;
};

// Custom hook for material requirements calculations
export const useMaterialRequirements = (calculation?: MaterialRequirementCalculation) => {
  const [requirements, setRequirements] = useState({
    totalCost: 0,
    totalMaterials: 0,
    requiredMaterials: 0,
    optionalMaterials: 0,
    canFulfillAll: true,
    shortageMaterials: 0,
    averageWastePercentage: 0,
    totalWithWaste: 0,
  });

  useEffect(() => {
    if (!calculation) return;

    const { material_requirements } = calculation;

    const requiredMaterials = material_requirements.filter(m => !m.is_optional);
    const optionalMaterials = material_requirements.filter(m => m.is_optional);
    const shortageMaterials = material_requirements.filter(m =>
      m.inventory_availability && !m.inventory_availability.can_fulfill
    );

    const totalWithWaste = material_requirements.reduce((sum, m) => sum + m.total_with_waste, 0);
    const averageWastePercentage = material_requirements.reduce((sum, m) => sum + m.waste_percentage, 0) / material_requirements.length;

    setRequirements({
      totalCost: calculation.total_estimated_cost,
      totalMaterials: material_requirements.length,
      requiredMaterials: requiredMaterials.length,
      optionalMaterials: optionalMaterials.length,
      canFulfillAll: shortageMaterials.length === 0,
      shortageMaterials: shortageMaterials.length,
      averageWastePercentage,
      totalWithWaste,
    });
  }, [calculation]);

  return requirements;
};

// Custom hook for filtering production recipes
export const useProductionRecipeFilters = () => {
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    recipe_type: "",
    finished_product_id: "",
    material_type: "",
    include_inactive: false,
  });

  const updateFilter = (key: string, value: string | number | boolean) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      recipe_type: "",
      finished_product_id: "",
      material_type: "",
      include_inactive: false,
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(
      (value) => value !== "" && value !== null && value !== undefined && value !== false
    ).length;
  };

  const getQueryParams = () => {
    const params: Record<string, any> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined && value !== false) {
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

// Custom hook for material consumption filtering
export const useMaterialConsumptionFilters = () => {
  const [filters, setFilters] = useState({
    production_order_id: "",
    material_product_id: "",
    status: "",
    consumption_date_from: "",
    consumption_date_to: "",
  });

  const updateFilter = (key: string, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      production_order_id: "",
      material_product_id: "",
      status: "",
      consumption_date_from: "",
      consumption_date_to: "",
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