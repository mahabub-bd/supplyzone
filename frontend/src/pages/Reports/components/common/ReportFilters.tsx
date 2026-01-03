import Select from "@/components/form/Select";
import DatePicker from "@/components/form/date-picker";
import { ReactNode, useEffect, useState } from "react";

// ============================================================================
// Types & Interfaces
// ============================================================================

interface DateRangeOption {
  value: string;
  label: string;
}

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  label: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
}

interface ReportFiltersProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  dateRangeOptions?: DateRangeOption[];
  filters?: FilterConfig[];
  actions?: ReactNode;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_DATE_RANGE_OPTIONS: DateRangeOption[] = [
  { value: "custom", label: "Custom Range" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This Week" },
  { value: "last_week", label: "Last Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_quarter", label: "This Quarter" },
  { value: "last_quarter", label: "Last Quarter" },
  { value: "this_year", label: "This Year" },
  { value: "last_year", label: "Last Year" },
];

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get the start of the current week (Sunday)
 */
function getStartOfWeek(date: Date): Date {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  return start;
}

/**
 * Get the end of the current week (Saturday)
 */
function getEndOfWeek(date: Date): Date {
  const end = new Date(date);
  end.setDate(date.getDate() - date.getDay() + 6);
  return end;
}

/**
 * Get the start of a specific quarter
 */
function getQuarterStart(year: number, quarter: number): Date {
  return new Date(year, quarter * 3, 1);
}

/**
 * Get the end of a specific quarter
 */
function getQuarterEnd(year: number, quarter: number): Date {
  return new Date(year, quarter * 3 + 3, 0);
}

/**
 * Calculate date range based on preset selection
 */
function calculateDateRange(range: string): {
  start: Date | null;
  end: Date | null;
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (range) {
    case "today":
      return { start: today, end: today };

    case "yesterday": {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { start: yesterday, end: yesterday };
    }

    case "this_week":
      return {
        start: getStartOfWeek(today),
        end: getEndOfWeek(today),
      };

    case "last_week": {
      const lastWeekStart = new Date(today);
      lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
      const lastWeekEnd = new Date(lastWeekStart);
      lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
      return { start: lastWeekStart, end: lastWeekEnd };
    }

    case "this_month":
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      };

    case "last_month":
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 0),
      };

    case "this_quarter": {
      const quarter = Math.floor(now.getMonth() / 3);
      return {
        start: getQuarterStart(now.getFullYear(), quarter),
        end: getQuarterEnd(now.getFullYear(), quarter),
      };
    }

    case "last_quarter": {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const lastQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1;
      const year =
        currentQuarter === 0 ? now.getFullYear() - 1 : now.getFullYear();
      return {
        start: getQuarterStart(year, lastQuarter),
        end: getQuarterEnd(year, lastQuarter),
      };
    }

    case "this_year":
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear(), 11, 31),
      };

    case "last_year":
      return {
        start: new Date(now.getFullYear() - 1, 0, 1),
        end: new Date(now.getFullYear() - 1, 11, 31),
      };

    default:
      return { start: null, end: null };
  }
}

// ============================================================================
// Custom Hooks
// ============================================================================

/**
 * Hook for managing date range options
 */
export function useDateRangeOptions(): DateRangeOption[] {
  return DEFAULT_DATE_RANGE_OPTIONS;
}

/**
 * Hook for calculating date ranges based on preset selection
 */
export function useDateRangeCalculation(dateRange: string) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    if (!dateRange || dateRange === "custom") {
      return;
    }

    const { start, end } = calculateDateRange(dateRange);
    setStartDate(start);
    setEndDate(end);
  }, [dateRange]);

  return { startDate, endDate };
}

// ============================================================================
// Sub-Components
// ============================================================================

interface FilterFieldProps {
  label: string;
  children: ReactNode;
}

function FilterField({ label, children }: FilterFieldProps) {
  return (
    <div className="flex-1 min-w-50">
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      {children}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function ReportFilters({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  dateRange,
  onDateRangeChange,
  dateRangeOptions,
  filters = [],
  actions,
  className = "",
}: ReportFiltersProps) {
  const options = dateRangeOptions || DEFAULT_DATE_RANGE_OPTIONS;

  const handleDateChange = (
    dates: Date | Date[] | null,
    setter: (date: Date | null) => void
  ) => {
    if (Array.isArray(dates)) {
      setter(dates[0] || null);
    } else {
      setter(dates);
    }
  };

  return (
    <div
      className={`mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 ${className}`}
    >
      <div className="flex flex-wrap gap-4">
        {/* Date Range Preset */}
        <FilterField label="Date Range">
          <Select
            value={dateRange}
            onChange={onDateRangeChange}
            options={options}
            placeholder="Select range"
          />
        </FilterField>

        {/* Start Date */}
        <FilterField label="Start Date">
          <DatePicker
            id="report-start-date"
            value={startDate}
            onChange={(dates) => handleDateChange(dates, onStartDateChange)}
            placeholder="Select start date"
            disabled={dateRange !== "custom"}
          />
        </FilterField>

        {/* End Date */}
        <FilterField label="End Date">
          <DatePicker
            id="report-end-date"
            value={endDate}
            onChange={(dates) => handleDateChange(dates, onEndDateChange)}
            placeholder="Select end date"
            disabled={dateRange !== "custom"}
          />
        </FilterField>

        {/* Additional Filters */}
        {filters.map((filter, index) => (
          <FilterField key={`filter-${index}`} label={filter.label}>
            <Select
              value={filter.value?.toString() || ""}
              onChange={filter.onChange}
              options={filter.options}
              placeholder={
                filter.placeholder || `Select ${filter.label.toLowerCase()}`
              }
            />
          </FilterField>
        ))}

        {/* Action Buttons */}
        {actions && <div className="flex items-end min-w-fit">{actions}</div>}
      </div>
    </div>
  );
}
