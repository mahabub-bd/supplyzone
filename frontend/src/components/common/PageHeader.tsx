import { ChevronRight, Plus } from "lucide-react";
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useHasPermission } from "../../hooks/useHasPermission";
import Button from "../ui/button/Button";

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface ActionButton {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  permission?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: BreadcrumbItem[];
  onAdd?: () => void;
  addLabel?: string;
  icon?: ReactNode;
  permission?: string;
  action?: ActionButton;
  children?: ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  breadcrumb,
  onAdd,
  addLabel = "Add",
  icon = <Plus size={16} />,
  permission,
  action,
  children,
  className,
}: PageHeaderProps) {
  const canAdd = permission ? useHasPermission(permission) : true;
  const canAction = action?.permission ? useHasPermission(action.permission) : true;

  return (
    <div className={className || "mb-6"}>
      {/* Breadcrumb */}
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="mb-3">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link
                to="/"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Home
              </Link>
            </li>
            {breadcrumb.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                <ChevronRight size={14} className="text-gray-400" />
                {item.href ? (
                  <Link
                    to={item.href}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span className="text-gray-900 dark:text-white font-medium">
                    {item.name}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {children}

          {action && canAction && (
            <Button variant="outline" size="sm" onClick={action.onClick}>
              {action.icon}
              {action.label}
            </Button>
          )}

          {onAdd && canAdd && (
            <Button variant="primary" size="sm" onClick={onAdd}>
              {icon}
              <span className="ml-1">{addLabel}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
