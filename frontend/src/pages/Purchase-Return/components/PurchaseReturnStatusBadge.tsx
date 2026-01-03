const statusConfig = {
  draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  },
  approved: {
    label: "Approved",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-300",
  },
  processed: {
    label: "Processed",
    className:
      "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-300",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-300",
  },
};

export default function PurchaseReturnStatusBadge({
  status,
}: {
  status: keyof typeof statusConfig;
}) {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
