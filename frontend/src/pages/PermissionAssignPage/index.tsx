// pages/permission/assign/PermissionAssignPage.tsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import {
  useAssignPermissionsToRoleMutation,
  useGetPermissionsQuery,
  useGetRolePermissionsQuery,
} from "../../features/permissions/permissionsApi";
import { useGetRolesQuery } from "../../features/role/roleApi";
import { Permission } from "../../types/role";
import PermissionGrid from "./components/PermissionGrid";
import RoleSelector from "./components/RoleSelector";

export default function PermissionAssignPage() {
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Queries
  const { data: rolesRes } = useGetRolesQuery();
  const { data: permissionsRes } = useGetPermissionsQuery();
  const { data: rolePermRes, refetch } = useGetRolePermissionsQuery(
    selectedRole,
    { skip: !selectedRole }
  );

  // Mutation
  const [assignPermissions, { isLoading: isAssigning }] =
    useAssignPermissionsToRoleMutation();

  const roles = rolesRes?.data || [];
  const permissions = permissionsRes?.data || [];

  // Load existing permissions when role changes
  useEffect(() => {
    if (rolePermRes?.data) {
      setSelectedPermissions(rolePermRes.data.map((p: Permission) => p.key));
    } else {
      setSelectedPermissions([]);
    }
  }, [rolePermRes]);

  const handleRoleChange = (roleName: string) => {
    setSelectedRole(roleName);
    setSelectedPermissions([]);
  };

  const togglePermission = (key: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const selectAll = () => {
    setSelectedPermissions(permissions.map((p: Permission) => p.key));
  };

  const unselectAll = () => {
    setSelectedPermissions([]);
  };

  const handleAssign = async () => {
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    try {
      await assignPermissions({
        roleName: selectedRole,
        permissionKeys: selectedPermissions,
      }).unwrap();

      toast.success("Permissions assigned successfully!");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to assign permissions");
    }
  };

  return (
    <div>
      <PageMeta
        title="Assign Permissions"
        description="Assign permissions to roles"
      />

      <PageBreadcrumb pageTitle="Permission Assign" />

      <div className="p-6 mt-4 border rounded-xl bg-white dark:bg-white/5 dark:border-white/10">
        <h2 className="text-xl font-semibold mb-6">
          Assign Permissions to Role
        </h2>

        <RoleSelector
          roles={roles}
          selectedRole={selectedRole}
          onRoleChange={handleRoleChange}
        />

        {selectedRole && (
          <PermissionGrid
            permissions={permissions}
            selectedPermissions={selectedPermissions}
            onTogglePermission={togglePermission}
            onSelectAll={selectAll}
            onUnselectAll={unselectAll}
            onAssign={handleAssign}
            isAssigning={isAssigning}
          />
        )}
      </div>
    </div>
  );
}
