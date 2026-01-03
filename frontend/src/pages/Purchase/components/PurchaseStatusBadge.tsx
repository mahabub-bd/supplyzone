import Badge from "../../../components/ui/badge/Badge";
import { PurchaseOrderStatus, PurchaseStatus } from "../../../types/purchase";

interface PurchaseStatusBadgeProps {
  status: PurchaseStatus | PurchaseOrderStatus;
  size?: "sm" | "md";
}

const PurchaseStatusBadge: React.FC<PurchaseStatusBadgeProps> = ({
  status,
  size = "md",
}) => {
  const statusMap: Record<
    string,
    {
      color:
        | "warning"
        | "info"
        | "success"
        | "error"
        | "primary"
        | "light"
        | "dark";
      label: string;
    }
  > = {
    // Original PurchaseStatus
    draft: { color: "warning", label: "Draft" },
    ordered: { color: "info", label: "Ordered" },
    received: { color: "success", label: "Received" },
    cancelled: { color: "error", label: "Cancelled" },

    // PurchaseOrderStatus extensions
    sent: { color: "info", label: "Sent" },
    approved: { color: "primary", label: "Approved" },
    rejected: { color: "error", label: "Rejected" },
    partial_received: { color: "warning", label: "Partial Received" },
    fully_received: { color: "success", label: "Fully Received" },
    closed: { color: "dark", label: "Closed" },
  };

  const { color, label } = statusMap[status] || {
    color: "light",
    label: status,
  };

  return (
    <Badge color={color} size={size} variant="light">
      {label}
    </Badge>
  );
};

export default PurchaseStatusBadge;
