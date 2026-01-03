import React, { useState, useRef, useEffect } from "react";
import { EmployeeBasic } from "../../types";

interface EmployeeActionButtonProps {
  onEmployeeSelect: (employee: EmployeeBasic) => void;
  selectedEmployee?: EmployeeBasic;
  buttonClassName?: string;
  disabled?: boolean;
  placeholder?: string;
}

export const EmployeeActionButton: React.FC<EmployeeActionButtonProps> = ({
  onEmployeeSelect: _onEmployeeSelect,
  selectedEmployee,
  buttonClassName = "",
  disabled = false,
  placeholder = "Select Employee",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  
  const getEmployeeDisplayName = (employee?: EmployeeBasic) => {
    if (!employee) return placeholder;
    return `${employee.first_name} ${employee.last_name}`.trim() || employee.employee_code;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".employee-dropdown")
      ) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        disabled={disabled}
        className={`inline-flex items-center justify-between w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${buttonClassName}`}
      >
        <span className="truncate">
          {selectedEmployee ? (
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-gray-700">
                  {selectedEmployee.first_name?.[0]?.toUpperCase() || "E"}
                </span>
              </div>
              <span>{getEmployeeDisplayName(selectedEmployee)}</span>
            </div>
          ) : (
            <span>{getEmployeeDisplayName()}</span>
          )}
        </span>
        <svg
          className={`ml-2 h-4 w-4 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* <EmployeeDropdown
        isOpen={isOpen}
        onClose={handleClose}
        onEmployeeSelect={handleEmployeeSelect}
        selectedEmployeeId={selectedEmployee?.id}
        statusFilter={statusFilter as any[]}
        className={`employee-dropdown ${dropdownClassName}`}
        placeholder={placeholder}
      /> */}
    </div>
  );
};

export default EmployeeActionButton;