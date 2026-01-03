import { QuotationStatus } from "../../../types/quotation";


interface QuotationStatusBadgeProps {
  status: QuotationStatus;
}

const statusConfig = {
  [QuotationStatus.DRAFT]: {
    label: "Draft",
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
    dotColor: "bg-gray-400",
  },
  [QuotationStatus.SENT]: {
    label: "Sent",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    dotColor: "bg-blue-400",
  },
  [QuotationStatus.ACCEPTED]: {
    label: "Accepted",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    dotColor: "bg-green-400",
  },
  [QuotationStatus.REJECTED]: {
    label: "Rejected",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    dotColor: "bg-red-400",
  },
  [QuotationStatus.EXPIRED]: {
    label: "Expired",
    bgColor: "bg-orange-100",
    textColor: "text-orange-800",
    dotColor: "bg-orange-400",
  },
  [QuotationStatus.CONVERTED]: {
    label: "Converted",
    bgColor: "bg-purple-100",
    textColor: "text-purple-800",
    dotColor: "bg-purple-400",
  },
};

export default function QuotationStatusBadge({
  status,
}: QuotationStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig[QuotationStatus.DRAFT];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}
    >
      {config.label}
    </span>
  );
}

export { QuotationStatusBadge };

