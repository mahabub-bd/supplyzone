import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import Select from "../../form/Select";
import Label from "../../form/Label";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  isFullscreen?: boolean;
  title?: string;
  description?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
  showCloseButton = true,
  isFullscreen = false,
  title,
  description,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const contentClasses = isFullscreen
    ? "w-full h-full"
    : "relative w-full max-w-2xl mx-auto rounded-3xl bg-white dark:bg-gray-900";

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 overflow-y-auto scrollbar-hide">
      {!isFullscreen && (
        <div
          className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]"
          onClick={onClose}
        />
      )}

      <div
        ref={modalRef}
        className={`${contentClasses} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-10 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white sm:right-6 sm:top-6 sm:h-11 sm:w-11"
          >
            <X size={20} />
          </button>
        )}

        {/* Title + Description Section */}
        {(title || description) && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            {title && (
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-gray-600 dark:text-gray-300 text-sm">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export function FormField({
  label,
  error,
  children,
}: {
  label: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

export function SelectField({
  label,
  data,
  value,
  onChange,
  error,
  disabled,
  placeholder,
  allowEmpty,
  emptyLabel,
}: {
  label: string;
  data?: { id: number | string; name: string }[];
  value?: number | string;
  error?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
}) {
  const options = data?.map((item) => ({
    value: item.id.toString(),
    label: item.name,
  })) ?? [];

  // Add empty option at the beginning if allowEmpty is true
  if (allowEmpty) {
    options.unshift({
      value: "",
      label: emptyLabel || "All",
    });
  }

  return (
    <FormField label={label} error={error}>
      <Select
        options={options}
        value={value?.toString()}
        onChange={(val: string) => {
          onChange(val);
        }}
        disabled={disabled}
        placeholder={placeholder}
      />
    </FormField>
  );
}