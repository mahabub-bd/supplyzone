import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

import {
  useDeleteWarehouseMutation,
  useGetWarehousesQuery,
} from "../../../features/warehouse/warehouseApi";
import { useHasPermission } from "../../../hooks/useHasPermission";
import { useModal } from "../../../hooks/useModal";

import ConfirmDialog from "../../../components/common/ConfirmDialog";
import IconButton from "../../../components/common/IconButton";
import PageHeader from "../../../components/common/PageHeader";
import Badge from "../../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

import Loading from "../../../components/common/Loading";
import { Warehouse } from "../../../types/branch";
import WarehouseFormModal from "./WarehouseFormModal";

export default function WarehouseList() {
  const { data, isLoading, isError } = useGetWarehousesQuery();
  const [deleteWarehouse] = useDeleteWarehouseMutation();

  const warehouses = data?.data || [];

  const canCreate = useHasPermission("warehouse.create");
  const canUpdate = useHasPermission("warehouse.update");
  const canDelete = useHasPermission("warehouse.delete");

  // 🔹 Use the useModal hook for modal state management
  const formModal = useModal();
  const deleteModal = useModal();

  const [editWarehouse, setEditWarehouse] = useState<Warehouse | null>(null);
  const [warehouseToDelete, setWarehouseToDelete] = useState<Warehouse | null>(
    null
  );

  const openCreate = () => {
    setEditWarehouse(null);
    formModal.openModal();
  };

  const openEdit = (w: Warehouse) => {
    setEditWarehouse(w);
    formModal.openModal();
  };

  const openDelete = (w: Warehouse) => {
    setWarehouseToDelete(w);
    deleteModal.openModal();
  };

  const confirmDelete = async () => {
    if (!warehouseToDelete) return;
    try {
      await deleteWarehouse(warehouseToDelete.id).unwrap();
      toast.success("Warehouse deleted");
    } catch {
      toast.error("Failed to delete warehouse");
    } finally {
      deleteModal.closeModal();
    }
  };

  if (isLoading) return <Loading message="Loading Warehouses" />;

  if (isError)
    return <p className="p-6 text-red-500">Failed to load warehouses.</p>;

  return (
    <>
      <PageHeader
        title="Warehouse Management"
        icon={<Plus size={16} />}
        addLabel="Add"
        onAdd={openCreate}
        permission="warehouse.create"
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-[#1e1e1e]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/5">
              <TableRow>
                <TableCell isHeader className="table-header">
                  Name
                </TableCell>
                <TableCell isHeader className="table-header">
                  Location
                </TableCell>
                <TableCell isHeader className="table-header">
                  Address
                </TableCell>
                <TableCell isHeader className="table-header">
                  Status
                </TableCell>
                <TableCell isHeader className="table-header text-right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
              {warehouses.length > 0 ? (
                warehouses.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="table-body font-medium">
                      {w.name}
                    </TableCell>
                    <TableCell className="table-body">
                      {w.location || "-"}
                    </TableCell>
                    <TableCell className="table-body">
                      {w.address || "-"}
                    </TableCell>
                    <TableCell className="table-body">
                      <Badge color={w.status ? "success" : "error"} size="sm">
                        {w.status ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="table-body px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {canUpdate && (
                          <IconButton
                            icon={Pencil}
                            color="blue"
                            onClick={() => openEdit(w)}
                          />
                        )}
                        {canDelete && (
                          <IconButton
                            icon={Trash2}
                            color="red"
                            onClick={() => openDelete(w)}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="py-6 text-center text-gray-500 dark:text-gray-400">
                    No warehouses found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {(canCreate || canUpdate) && (
        <WarehouseFormModal
          isOpen={formModal.isOpen}
          onClose={formModal.closeModal}
          warehouse={editWarehouse}
        />
      )}

      {canDelete && (
        <ConfirmDialog
          isOpen={deleteModal.isOpen}
          title="Delete Warehouse"
          message={`Are you sure to delete "${warehouseToDelete?.name}"?`}
          onConfirm={confirmDelete}
          onCancel={deleteModal.closeModal}
        />
      )}
    </>
  );
}
