import { useState } from "react";
import Button from "../../../components/ui/button/Button";
import { Permission } from "../../../types/role";
import PermissionActions from "./PermissionActions";
import PermissionCard from "./PermissionCard";

// ⬇️ Lucide Icons
import {
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  Send,
  X,
} from "lucide-react";

interface PermissionGridProps {
  permissions: Permission[];
  selectedPermissions: string[];
  onTogglePermission: (key: string) => void;
  onSelectAll: () => void;
  onUnselectAll: () => void;
  onAssign: () => void;
  isAssigning: boolean;
}

export default function PermissionGrid({
  permissions,
  selectedPermissions,
  onTogglePermission,
  onSelectAll,
  onUnselectAll,
  onAssign,
  isAssigning,
}: PermissionGridProps) {
  // Group permissions: user.create → user
  const grouped = permissions.reduce((acc, perm) => {
    const moduleName = perm.key.split(".")[0];
    if (!acc[moduleName]) acc[moduleName] = [];
    acc[moduleName].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (m: string) => setExpanded((p) => ({ ...p, [m]: !p[m] }));

  const selectModule = (module: string) => {
    grouped[module].forEach((p) => {
      if (!selectedPermissions.includes(p.key)) onTogglePermission(p.key);
    });
  };

  const unselectModule = (module: string) => {
    grouped[module].forEach((p) => {
      if (selectedPermissions.includes(p.key)) onTogglePermission(p.key);
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Permissions</h3>
          <p className="text-sm text-gray-500">
            {selectedPermissions.length} of {permissions.length} selected
          </p>
        </div>

        <PermissionActions
          onSelectAll={onSelectAll}
          onUnselectAll={onUnselectAll}
        />
      </div>

      {/* Modules */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([module, perms]) => {
          const total = perms.length;
          const isExpanded = expanded[module];

          return (
            <div key={module} className="border rounded-md">
              {/* Module Header */}
              <div
                onClick={() => toggle(module)}
                className="flex items-center justify-between px-3 py-2 bg-gray-100 cursor-pointer"
              >
                {/* Left Side */}
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown size={18} className="text-gray-600" />
                  ) : (
                    <ChevronRight size={18} className="text-gray-600" />
                  )}

                  <h4 className="font-semibold text-gray-800">
                    {module.charAt(0).toUpperCase() + module.slice(1)}
                  </h4>

                  <span className="text-gray-500 text-sm">({total})</span>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      selectModule(module);
                    }}
                    size="sm"
                    variant="success"
                    startIcon={<Check size={14} />}
                    className="h-6 text-xs px-2"
                  >
                    Select All
                  </Button>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      unselectModule(module);
                    }}
                    size="sm"
                    variant="secondary"
                    startIcon={<X size={14} />}
                    className="h-6 text-xs px-2"
                  >
                    Unselect
                  </Button>
                </div>
              </div>

              {/* Module Permissions */}
              {isExpanded && (
                <div className="flex flex-wrap gap-4 p-3">
                  {perms.map((perm) => (
                    <PermissionCard
                      key={perm.key}
                      permission={perm}
                      isSelected={selectedPermissions.includes(perm.key)}
                      onToggle={() => onTogglePermission(perm.key)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Assign Button */}
      <div className="mt-5 flex justify-end items-center">
        <Button
          size="sm"
          onClick={onAssign}
          disabled={isAssigning || selectedPermissions.length === 0}
          className="flex items-center gap-2 px-4  bg-blue-600 text-white rounded-md"
        >
          {isAssigning ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Send size={16} />
              Assign
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
