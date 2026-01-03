import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import z from "zod";
import { EmployeeStatus, EmployeeType } from "../types";
import { ProductType } from "../types/product";
export const baseUrl = import.meta.env.VITE_API_URL;
export const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "suspend", label: "Suspend" },
  { value: "deactive", label: "Deactive" },
];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyEnglish(amount: number): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace("BDT", "৳ ");
}

export const SafeNumber = (msg: string) =>
  z.preprocess((v) => {
    const num = Number(v);
    return Number.isFinite(num) ? num : null;
  }, z.number({ error: msg }));

export const badgeColors = {
  // Payment Methods
  cash: "green",
  bank: "blue",
  bkash: "purple",

  // Account Types
  asset: "blue",
  liability: "orange",
  equity: "purple",
  income: "green",
  expense: "red",

  // Status or fallback
  default: "gray",
};

export function getTypeColor(type: string) {
  switch (type) {
    case "asset":
      return "success"; // green
    case "liability":
      return "warning"; // yellow
    case "equity":
      return "primary"; // blue
    case "expense":
      return "error"; // red
    case "income":
      return "info"; // purple
    default:
      return "secondary";
  }
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const getEmployeeStatusColor = (status: EmployeeStatus) => {
  switch (status) {
    case EmployeeStatus.ACTIVE:
      return "success";
    case EmployeeStatus.INACTIVE:
      return "warning";
    case EmployeeStatus.TERMINATED:
      return "error";
    case EmployeeStatus.ON_LEAVE:
      return "info";
    default:
      return "light";
  }
};

export const getEmployeeTypeColor = (type: EmployeeType) => {
  switch (type) {
    case EmployeeType.FULL_TIME:
      return "primary";
    case EmployeeType.PART_TIME:
      return "info";
    case EmployeeType.CONTRACT:
      return "warning";
    case EmployeeType.INTERN:
      return "light";
    default:
      return "light";
  }
};

export const getStatusColor = (status: EmployeeStatus) => {
  switch (status) {
    case EmployeeStatus.ACTIVE:
      return "success";
    case EmployeeStatus.INACTIVE:
      return "warning";
    case EmployeeStatus.TERMINATED:
      return "error";
    case EmployeeStatus.ON_LEAVE:
      return "info";
    default:
      return "light";
  }
};

export const getDesignationLevelColor = (level?: string) => {
  switch (level) {
    case "managing_director":
      return "primary";
    case "director":
    case "cfo":
    case "cto":
    case "cio":
      return "success";
    case "head_of_department":
      return "info";
    case "senior_manager":
      return "warning";
    case "manager":
      return "dark";
    case "assistant_manager":
      return "primary";
    case "senior_executive":
      return "success";
    case "executive":
      return "info";
    case "senior_officer":
      return "warning";
    case "officer":
      return "light";
    case "junior_officer":
      return "dark";
    default:
      return "light";
  }
};

export const formatTime = (time: string | null) => {
  if (!time) return "-";
  return new Date(time).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getStatusColorAttendence = (
  status: string
): "primary" | "success" | "error" | "warning" | "info" | "light" | "dark" => {
  switch (status) {
    case "present":
      return "success";
    case "absent":
      return "error";
    case "late":
      return "warning";
    case "half_day":
      return "info";
    case "leave":
      return "light";
    default:
      return "light";
  }
};

export const getStatusColorLeave = (
  status: string
): "primary" | "success" | "error" | "warning" | "info" | "light" | "dark" => {
  switch (status) {
    case "pending":
      return "warning";
    case "approved":
      return "success";
    case "rejected":
      return "error";
    case "cancelled":
      return "light";
    default:
      return "light";
  }
};

export const getLeaveTypeColor = (
  leaveType: string
): "primary" | "success" | "error" | "warning" | "info" | "light" | "dark" => {
  switch (leaveType) {
    case "annual":
      return "primary";
    case "sick":
      return "error";
    case "maternity":
      return "info";
    case "paternity":
      return "success";
    case "unpaid":
      return "warning";
    case "compassionate":
      return "dark";
    default:
      return "light";
  }
};

export const getOvertimeBadgeColor = (
  level: string
): "primary" | "success" | "error" | "warning" | "info" | "light" | "dark" => {
  switch (level) {
    case "high":
      return "error";
    case "medium":
      return "warning";
    case "low":
      return "info";
    default:
      return "light";
  }
};

export const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return { color: "success" as const, text: "Completed" };
    case "held":
      return { color: "warning" as const, text: "Held" };
    case "refunded":
      return { color: "error" as const, text: "Refunded" };
    case "pending":
      return { color: "info" as const, text: "Pending" };
    case "cancelled":
      return { color: "light" as const, text: "Cancelled" };
    default:
      return { color: "light" as const, text: status };
  }
};

// Get payment method badge properties
export const getPaymentMethodBadge = (method: string) => {
  switch (method) {
    case "cash":
      return { color: "success" as const, text: "Cash" };
    case "card":
      return { color: "primary" as const, text: "Card" };
    case "mobile":
      return { color: "info" as const, text: "Mobile" };
    default:
      return { color: "light" as const, text: method };
  }
};

// Get product type badge properties
export const getProductTypeBadge = (type: ProductType) => {
  switch (type) {
    case ProductType.RAW_MATERIAL:
      return { color: "warning" as const, text: "Raw Material" };
    case ProductType.COMPONENT:
      return { color: "info" as const, text: "Component" };
    case ProductType.FINISHED_GOOD:
      return { color: "success" as const, text: "Finished Good" };
    case ProductType.RESALE:
      return { color: "primary" as const, text: "Resale" };
    case ProductType.CONSUMABLE:
      return { color: "secondary" as const, text: "Consumable" };
    case ProductType.PACKAGING:
      return { color: "light" as const, text: "Packaging" };
    case ProductType.SERVICE:
      return { color: "dark" as const, text: "Service" };
    default:
      return { color: "light" as const, text: type };
  }
};

// Calculate business days between two dates (excluding weekends)
export const calculateBusinessDays = (
  startDate: Date,
  endDate: Date
): number => {
  let businessDays = 0;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    // Sunday is 0, Saturday is 6
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return businessDays;
};

// ============================================================================
// RTK QUERY UTILITIES
// ============================================================================

/**
 * Build URL query string from parameters object
 * Automatically filters out undefined/null values
 *
 * @example
 * buildQueryString({ page: 1, search: 'test', empty: undefined })
 * // Returns: "page=1&search=test"
 *
 * @param params - Object containing query parameters
 * @returns Formatted query string (without leading '?')
 */
export function buildQueryString(
  params: Record<string, unknown>
): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
}

/**
 * Generate cache tags for list items with individual IDs
 * Useful for optimistic updates and granular cache invalidation
 *
 * @example
 * generateListTags(productsResponse, 'Products')
 * // Returns: [
 * //   { type: 'Products', id: 1 },
 * //   { type: 'Products', id: 2 },
 * //   { type: 'Products', id: 'LIST' }
 * // ]
 *
 * @param result - API response with data array
 * @param tagType - The tag type to use
 * @returns Array of cache tags
 */
export function generateListTags<
  TagType extends string,
  T extends { id: string | number }
>(result: { data: T[] } | undefined, tagType: TagType) {
  return result?.data
    ? ([
        ...result.data.map((item) => ({ type: tagType, id: item.id })),
        { type: tagType, id: "LIST" as const },
      ] as const)
    : ([{ type: tagType, id: "LIST" as const }] as const);
}

/**
 * Generate cache tag for a single item
 *
 * @param tagType - The tag type to use
 * @param id - The item ID
 * @returns Array with single cache tag
 */
export function generateItemTag<TagType extends string>(
  tagType: TagType,
  id: string | number
) {
  return [{ type: tagType, id }] as const;
}

/**
 * Invalidate both the item and the list cache
 * Use this for create/update/delete mutations
 *
 * @example
 * invalidatesTags: (_result, _error, { id }) =>
 *   invalidateItemAndList('Products', id)
 *
 * @param tagType - The tag type to invalidate
 * @param id - The item ID (optional, for create operations)
 * @returns Array of cache tags to invalidate
 */
export function invalidateItemAndList<TagType extends string>(
  tagType: TagType,
  id?: string | number
) {
  if (id !== undefined) {
    return [
      tagType,
      { type: tagType, id: "LIST" as const },
      { type: tagType, id },
    ] as const;
  }

  return [tagType, { type: tagType, id: "LIST" as const }] as const;
}
