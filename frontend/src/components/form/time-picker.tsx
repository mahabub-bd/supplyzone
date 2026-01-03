import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import type { Instance } from "flatpickr/dist/types/instance";
import { useEffect, useRef } from "react";
import { TimeIcon } from "../../icons";

interface TimePickerProps {
  id: string;
  label?: string;
  placeholder?: string;
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  error?: boolean;
  hint?: string;
  isRequired?: boolean;
  isInLine?: boolean;
  time_24hr?: boolean;
  minuteIncrement?: number;
  hourIncrement?: number;
  disablePast?: boolean;
}

export default function TimePicker({
  id,
  label,
  placeholder = "Select time",
  value,
  onChange,
  error = false,
  hint,
  isRequired = false,
  isInLine = false,
  time_24hr = true,
  minuteIncrement = 15,
  hourIncrement = 1,
  disablePast = false,
}: TimePickerProps) {
  const flatpickrRef = useRef<Instance | null>(null);

  useEffect(() => {
    const element = document.getElementById(id);
    if (!element) return;

    const config = {
      enableTime: true,
      noCalendar: true,
      dateFormat: "H:i",
      time_24hr,
      minuteIncrement,
      hourIncrement,
      defaultDate: value || undefined,
      minDate: disablePast ? "now" : undefined,
      onChange: (selectedDates: any[]) => {
        if (onChange) {
          onChange(selectedDates[0] || null);
        }
      },
    };

    flatpickrRef.current = flatpickr(element, config);

    return () => {
      if (flatpickrRef.current) {
        flatpickrRef.current.destroy();
        flatpickrRef.current = null;
      }
    };
  }, [id, time_24hr, minuteIncrement, hourIncrement, disablePast]);

  useEffect(() => {
    if (flatpickrRef.current && value) {
      flatpickrRef.current.setDate([value]);
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
    let inputClasses = `h-9 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800`;

    if (error) {
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
          className={getInputClasses()}
        />

        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400 ">
          <TimeIcon className="size-5 cursor-pointer" />
        </span>
        {hint && <p className={getHintClasses()}>{hint}</p>}
      </div>
    </div>
  );
}