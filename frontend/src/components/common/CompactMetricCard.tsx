import { LucideIcon } from "lucide-react";

interface CompactMetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  iconBg?: string;
  iconColor?: string;
}

export function CompactMetricCard({
  icon: Icon,
  label,
  value,
  iconBg = "bg-gray-100",
  iconColor = "text-gray-600",
}: CompactMetricCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center ${iconBg}`}
      >
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>

      <div className="flex flex-col leading-tight">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-base font-semibold text-gray-900">{value}</span>
      </div>
    </div>
  );
}
