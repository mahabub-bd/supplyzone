import Select from "../../../components/form/Select";
import { Role } from "../../../types/role";

interface RoleSelectorProps {
  roles: Role[];
  selectedRole: string;
  onRoleChange: (roleName: string) => void;
}

export default function RoleSelector({
  roles,
  selectedRole,
  onRoleChange,
}: RoleSelectorProps) {
  return (
    <div className="mb-6">
      <Select
        options={roles.map((r) => ({ value: r.name, label: r.name }))}
        defaultValue={selectedRole}
        placeholder="Choose Role"
        onChange={onRoleChange}
      />
    </div>
  );
}
