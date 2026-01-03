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
  useDeleteBranchMutation,
  useGetBranchesQuery,
} from "../../../features/branch/branchApi";
import { useHasPermission } from "../../../hooks/useHasPermission";
import { useModal } from "../../../hooks/useModal";
import { Branch } from "../../../types/branch";
import BranchFormModal from "./BranchFormModal";

export default function BranchList() {
  const { data, isLoading, isError } = useGetBranchesQuery();

  const [deleteBranch] = useDeleteBranchMutation();

  // 🔹 Use the useModal hook for modal state management
  const formModal = useModal();
  const deleteModal = useModal();

  const [editBranch, setEditBranch] = useState<Branch | null>(null);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);

  const canCreate = useHasPermission("branch.create");
  const canUpdate = useHasPermission("branch.update");
  const canDelete = useHasPermission("branch.delete");

  const branches = data?.data || [];

  const openCreateModal = () => {
    setEditBranch(null);
    formModal.openModal();
  };

  const openEditModal = (branch: Branch) => {
    setEditBranch(branch);
    formModal.openModal();
  };

  const openDeleteDialog = (branch: Branch) => {
    setBranchToDelete(branch);
    deleteModal.openModal();
  };

  const confirmDelete = async () => {
    if (!branchToDelete) return;
    try {
      await deleteBranch(branchToDelete.id).unwrap();
      toast.success("Branch deleted successfully");
    } catch {
      toast.error("Failed to delete branch");
    } finally {
      deleteModal.closeModal();
    }
  };

  if (isLoading) return <Loading message="Loading Branches" />;

  if (isError)
    return <p className="p-6 text-red-500">Failed to fetch branches.</p>;

  return (
    <>
      <PageHeader
        title="Branch Management"
        icon={<Plus size={16} />}
        addLabel="Add"
        onAdd={openCreateModal}
        permission="branch.create"
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-[#1e1e1e]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/5">
              <TableRow>
                <TableCell isHeader>Code</TableCell>
                <TableCell isHeader>Branch Name</TableCell>
                <TableCell isHeader>Address</TableCell>
                <TableCell isHeader>Phone</TableCell>
                <TableCell isHeader>Email</TableCell>
                <TableCell isHeader>Warehouse</TableCell>
                <TableCell isHeader>Status</TableCell>
                <TableCell isHeader className="table-header text-right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
              {branches.length > 0 ? (
                branches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell>{branch.code}</TableCell>

                    <TableCell>{branch.name}</TableCell>

                    <TableCell className="table-body">
                      {branch.address}
                    </TableCell>

                    <TableCell className="table-body">{branch.phone}</TableCell>

                    <TableCell className="table-body">{branch.email}</TableCell>

                    <TableCell className="table-body">
                      {branch.default_warehouse ? (
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {branch.default_warehouse.name}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">
                          No warehouse
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="table-body">
                      <Badge
                        size="sm"
                        color={branch.is_active ? "success" : "error"}
                      >
                        {branch.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-4 py-3">
                      <div className="flex justify-start gap-2">
                        {canUpdate && (
                          <IconButton
                            icon={Pencil}
                            tooltip="Edit"
                            onClick={() => openEditModal(branch)}
                            color="blue"
                          />
                        )}
                        {canDelete && (
                          <IconButton
                            icon={Trash2}
                            tooltip="Delete"
                            onClick={() => openDeleteDialog(branch)}
                            color="red"
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No branches found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {(canCreate || canUpdate) && (
        <BranchFormModal
          isOpen={formModal.isOpen}
          onClose={formModal.closeModal}
          branch={editBranch}
        />
      )}

      {canDelete && (
        <ConfirmDialog
          isOpen={deleteModal.isOpen}
          title="Delete Branch"
          message={`Are you sure you want to delete "${branchToDelete?.name}"?`}
          confirmLabel="Yes, Delete"
          cancelLabel="Cancel"
          onConfirm={confirmDelete}
          onCancel={deleteModal.closeModal}
        />
      )}
    </>
  );
}
