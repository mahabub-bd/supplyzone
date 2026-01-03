import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  useDeleteUnitMutation,
  useGetUnitsQuery,
} from "../../../features/unit/unitApi";
import { useHasPermission } from "../../../hooks/useHasPermission";
import { useModal } from "../../../hooks/useModal";
import { Unit } from "../../../types/product";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

import ConfirmDialog from "../../../components/common/ConfirmDialog";
import IconButton from "../../../components/common/IconButton";
import Loading from "../../../components/common/Loading";
import PageHeader from "../../../components/common/PageHeader";
import Badge from "../../../components/ui/badge/Badge";
import UnitFormModal from "./UnitFormModal";

export default function UnitList() {
  const { data, isLoading, isError } = useGetUnitsQuery();
  const [deleteUnit] = useDeleteUnitMutation();

  // 🔹 Use the useModal hook for modal state management
  const formModal = useModal();
  const deleteModal = useModal();

  const [editUnit, setEditUnit] = useState<Unit | null>(null);
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);

  const canCreate = useHasPermission("unit.create");
  const canUpdate = useHasPermission("unit.update");
  const canDelete = useHasPermission("unit.delete");

  const units = data?.data || [];

  const openCreateModal = () => {
    setEditUnit(null);
    formModal.openModal();
  };

  const openEditModal = (unit: Unit) => {
    setEditUnit(unit);
    formModal.openModal();
  };

  const openDeleteDialog = (unit: Unit) => {
    setUnitToDelete(unit);
    deleteModal.openModal();
  };

  const confirmDelete = async () => {
    if (!unitToDelete) return;
    try {
      await deleteUnit(unitToDelete.id).unwrap();
      toast.success("Unit deleted successfully");
    } catch {
      toast.error("Failed to delete unit");
    } finally {
      deleteModal.closeModal();
    }
  };

  if (isLoading) return <Loading message="Loading Units" />;

  if (isError)
    return <p className="p-6 text-red-500">Failed to fetch units.</p>;

  return (
    <>
      <PageHeader
        title="Unit Management"
        icon={<Plus size={16} />}
        addLabel="Add"
        onAdd={openCreateModal}
        permission="unit.create"
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-[#1e1e1e]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/5">
              <TableRow>
                <TableCell isHeader>Name</TableCell>
                <TableCell isHeader>Code</TableCell>
                <TableCell isHeader>Description</TableCell>
                <TableCell isHeader>Status</TableCell>
                <TableCell isHeader className="table-header text-right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
              {units.length > 0 ? (
                units.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="table-body font-medium">
                      {unit.name}
                    </TableCell>
                    <TableCell className="table-body">{unit.code}</TableCell>
                    <TableCell className="table-body">
                      {unit.description || "-"}
                    </TableCell>
                    <TableCell className="table-body">
                      <Badge
                        color={unit.isActive ? "success" : "error"}
                        size="sm"
                      >
                        {unit.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-4 py-3">
                      <div className="flex justify-start gap-2">
                        {canUpdate && (
                          <IconButton
                            icon={Pencil}
                            tooltip="Edit"
                            onClick={() => openEditModal(unit)}
                            color="blue"
                          />
                        )}
                        {canDelete && (
                          <IconButton
                            tooltip="Delete"
                            icon={Trash2}
                            onClick={() => openDeleteDialog(unit)}
                            color="red"
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="py-6 text-center text-gray-500 dark:text-gray-400">
                    No units found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {(canCreate || canUpdate) && (
        <UnitFormModal
          isOpen={formModal.isOpen}
          onClose={formModal.closeModal}
          unit={editUnit}
        />
      )}

      {canDelete && (
        <ConfirmDialog
          isOpen={deleteModal.isOpen}
          title="Delete Unit"
          message={`Are you sure you want to delete "${unitToDelete?.name}"?`}
          confirmLabel="Yes, Delete"
          cancelLabel="Cancel"
          onConfirm={confirmDelete}
          onCancel={deleteModal.closeModal}
        />
      )}
    </>
  );
}
