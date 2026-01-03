import Checkbox from "../../../components/form/input/Checkbox";
import { Permission } from "../../../types/role";

interface PermissionCardProps {
  permission: Permission;
  isSelected: boolean;
  onToggle: () => void;
}

export default function PermissionCard({
  permission,
  isSelected,
  onToggle,
}: PermissionCardProps) {
  return (
    <div
      onClick={onToggle}
      className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer
        ${isSelected ? "border-blue-300 bg-blue-50" : "border-gray-300 bg-white"
        }
      `}
    >
      <Checkbox checked={isSelected} onChange={onToggle} />

      <div>
        <h4 className="text-sm font-semibold">{permission.key}</h4>
      </div>
    </div>
  );
}
