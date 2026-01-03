import Button from "../../../components/ui/button/Button";

interface PermissionActionsProps {
  onSelectAll: () => void;
  onUnselectAll: () => void;
}

export default function PermissionActions({
  onSelectAll,
  onUnselectAll,
}: PermissionActionsProps) {
  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        onClick={onSelectAll}
        className="px-3 py-1 rounded bg-brand-600 text-white text-xs hover:bg-brand-700 transition-colors"
      >
        Select All
      </Button>
      <button
        onClick={onUnselectAll}
        className="px-3 py-1 rounded bg-gray-300 text-xs dark:bg-gray-700 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
      >
        Unselect All
      </button>
    </div>
  );
}
