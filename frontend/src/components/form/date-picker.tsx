import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import type { Instance } from "flatpickr/dist/types/instance";
import { useEffect, useRef } from "react";
import { CalenderIcon, TimeIcon } from "../../icons";

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time" | "datetime";
  onChange?: (dates: Date | Date[] | null) => void;
  value?: Date | Date[] | null;
  label?: string;
  placeholder?: string;
  error?: boolean;
  hint?: string;
  disableFuture?: boolean;
  isRequired?: boolean;
  isInLine?: boolean;
  enableTime?: boolean;
  time_24hr?: boolean;
  minuteIncrement?: number;
  hourIncrement?: number;
  disabled?: boolean;
};

export default function DatePicker({
  id,
  mode = "single",
  onChange,
  value,
  label,
  placeholder,
  error = false,
  hint,
  disableFuture = true,
  isRequired = false,
  isInLine = false,
  enableTime = false,
  time_24hr = true,
  minuteIncrement = 1,
  hourIncrement = 1,
  disabled = false,
}: PropsType) {
  const flatpickrRef = useRef<Instance | null>(null);

  useEffect(() => {
    const element = document.getElementById(id);
    if (!element) return;

    // If disabled, don't initialize flatpickr
    if (disabled) {
      if (flatpickrRef.current) {
        flatpickrRef.current.destroy();
        flatpickrRef.current = null;
      }
      return;
    }

    const config: any = {
      mode: mode === "datetime" ? "single" : mode,
      static: true,
      position: "below",
      dateFormat:
        mode === "time" || mode === "datetime" ? "F j, Y H:i" : "F j, Y",
      monthSelectorType: "dropdown",
      defaultDate: value || undefined,
      maxDate: disableFuture ? "today" : undefined,
      onChange: (selectedDates: any[]) => {
        if (onChange) {
          if (mode === "single" || mode === "datetime" || mode === "time") {
            onChange(selectedDates[0] || null);
          } else {
            onChange(selectedDates);
          }
        }
      },
    };

    // Enable time picker for datetime or time mode
    if (mode === "datetime" || mode === "time" || enableTime) {
      config.enableTime = true;
      config.time_24hr = time_24hr;
      config.minuteIncrement = minuteIncrement;
      config.hourIncrement = hourIncrement;
      if (mode === "time") {
        config.noCalendar = true;
        config.dateFormat = "H:i";
      }
    }

    flatpickrRef.current = flatpickr(element, config);

    return () => {
      if (flatpickrRef.current) {
        flatpickrRef.current.destroy();
        flatpickrRef.current = null;
      }
    };
  }, [id, mode, disableFuture, disabled]);

  useEffect(() => {
    if (flatpickrRef.current && value !== undefined) {
      flatpickrRef.current.setDate(value || [], false);
    }
  }, [value]);

  // Updated label styling to match Input component
  const getLabelClasses = (isInLine: boolean) => {
    return `${isInLine ? "mb-0" : "mb-2"} block text-sm font-medium ${
      error ? "text-error-500" : "text-gray-500"
    }`;
  };

  // Updated input classes to match Input and Select exactly
  const getInputClasses = () => {
    let inputClasses = `h-10 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800`;

    if (disabled) {
      inputClasses += ` border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500`;
    } else if (error) {
      inputClasses += ` border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:text-error-400 dark:border-error-500 dark:focus:border-error-800`;
    } else {
      inputClasses += ` border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800`;
    }

    return inputClasses;
  };

  // Updated hint styling to match Input component
  const getHintClasses = () => {
    return ` text-xs ${error ? "text-error-500" : "text-gray-500"}`;
  };

  return (
    <div className={`${isInLine ? "flex items-center" : ""}`}>
      <div className={`${isInLine ? "text-left basis-2/5 mr-2" : ""}`}>
        {label && (
          <label htmlFor={id} className={getLabelClasses(isInLine)}>
            {label} {isRequired && <span className="text-error-500">*</span>}
          </label>
        )}
      </div>
      <div className={`relative basis-4/5`}>
        <input
          id={id}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          className={getInputClasses()}
        />

        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400 ">
          {mode === "time" || mode === "datetime" || enableTime ? (
            <TimeIcon className="size-5 cursor-pointer" />
          ) : (
            <CalenderIcon className="size-5 cursor-pointer" />
          )}
        </span>
        {hint && <p className={getHintClasses()}>{hint}</p>}
      </div>
    </div>
  );
}
