import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import IconButton from "../../../components/common/IconButton";
import Loading from "../../../components/common/Loading";
import PageHeader from "../../../components/common/PageHeader";
import Badge from "../../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

import {
  useDeleteCustomerGroupMutation,
  useGetCustomerGroupsQuery,
} from "../../../features/customer-group/customerGroupApi";
import { useHasPermission } from "../../../hooks/useHasPermission";
import { useModal } from "../../../hooks/useModal";
import { CustomerGroup } from "../../../types/customer";
import CustomerGroupFormModal from "./CustomerGroupFormModal";

export default function CustomerGroupList() {
  // 🔹 Use the useModal hook for modal state management
  const formModal = useModal();
  const deleteModal = useModal();

  const [editGroup, setEditGroup] = useState<CustomerGroup | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<CustomerGroup | null>(
    null
  );

  const canCreate = useHasPermission("customergroup.create");
  const canUpdate = useHasPermission("customergroup.update");
  const canDelete = useHasPermission("customergroup.delete");

  const { data, isLoading, isError } = useGetCustomerGroupsQuery({});

  const [deleteGroup] = useDeleteCustomerGroupMutation();
  const groups = data?.data || [];

  const confirmDelete = async () => {
    if (!groupToDelete) return;
    try {
      await deleteGroup(groupToDelete.id).unwrap();
      toast.success("Customer group deleted successfully");
    } catch {
      toast.error("Failed to delete customer group");
    } finally {
      deleteModal.closeModal();
    }
  };

  if (isLoading) return <Loading message="Loading customer groups..." />;
  if (isError)
    return <p className="p-6 text-red-500">Failed to fetch groups.</p>;

  return (
    <>
      <PageHeader
        title="Customer Group Management"
        icon={<Plus size={16} />}
        addLabel="Add Group"
        onAdd={() => {
          setEditGroup(null);
          formModal.openModal();
        }}
        permission="customergroup.create"
      />

      <div className="border rounded-xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader>Name</TableCell>
                <TableCell isHeader>Discount (%)</TableCell>
                <TableCell isHeader>Status</TableCell>
                <TableCell isHeader className="text-right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group: CustomerGroup) => (
                <TableRow key={group.id}>
                  <TableCell>{group.name}</TableCell>
                  <TableCell>{group.discount_percentage || 0}%</TableCell>
                  <TableCell>
                    <Badge
                      size="sm"
                      color={group.is_active ? "success" : "error"}
                    >
                      {group.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    {canUpdate && (
                      <IconButton
                        icon={Pencil}
                        tooltip="Edit"
                        onClick={() => {
                          setEditGroup(group);
                          formModal.openModal();
                        }}
                        color="blue"
                      />
                    )}
                    {canDelete && (
                      <IconButton
                        icon={Trash2}
                        tooltip="Delete"
                        onClick={() => {
                          setGroupToDelete(group);
                          deleteModal.openModal();
                        }}
                        color="red"
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {canCreate || canUpdate ? (
        <CustomerGroupFormModal
          isOpen={formModal.isOpen}
          onClose={formModal.closeModal}
          group={editGroup}
        />
      ) : null}

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        title="Delete Customer Group"
        message={`Are you sure you want to delete "${groupToDelete?.name}"?`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={deleteModal.closeModal}
      />
    </>
  );
}
