import React from "react";

interface InfoProps {
  label: string;
  value?: React.ReactNode;
  className?: string;
  valueClassName?: string;
}

const Info = ({
  label,
  value,
  className = "",
  valueClassName = "",
}: InfoProps) => {
  return (
    <div className={`flex items-center justify-start gap-4 ${className}`}>
      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
        {label} :
      </p>
      <p
        className={`text-sm font-medium text-gray-900 dark:text-white text-right ${valueClassName}`}
      >
        {value ?? "N/A"}
      </p>
    </div>
  );
};

export default Info;
