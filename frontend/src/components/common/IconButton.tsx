import { LucideIcon } from "lucide-react";
import { ButtonHTMLAttributes } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  color?: "blue" | "red" | "green" | "gray" | "purple" | "orange";
  size?: number;
  tooltip?: string;
}

export default function IconButton({
  icon: Icon,
  onClick,
  color = "gray",
  size = 14,
  tooltip,
  className = "",
  ...props
}: IconButtonProps) {
  const colorClasses = {
    blue: "bg-blue-500 hover:bg-blue-600 text-white",
    red: "bg-red-500 hover:bg-red-600 text-white",
    green: "bg-green-500 hover:bg-green-600 text-white",
    gray: "bg-gray-500 hover:bg-gray-600 text-white",
    purple: "bg-purple-500 hover:bg-purple-600 text-white",
    orange: "bg-orange-500 hover:bg-orange-600 text-white",
  };

  return (
    <div className="relative group inline-block">
      <button
        onClick={onClick}
        className={`px-3 py-2 rounded flex items-center justify-center ${colorClasses[color]} ${className}`}
        {...props}
      >
        <Icon size={size} />
      </button>

      {tooltip && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 dark:bg-gray-700">
          {tooltip}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></span>
        </span>
      )}
    </div>
  );
}
